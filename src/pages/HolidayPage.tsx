/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getAllHolidays, insertHolidayBulk } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/store/hook";
import debounce from "lodash.debounce";

import { Plus, Trash2, Upload, ChevronDownIcon } from "lucide-react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export type Holiday = {
    id: string;
    date: string | null;
    is_floater: boolean | null;
    description: string;
    hasError: boolean,
    err: string;
    isPast?: boolean;
    isExisting?: boolean;
};

type ImportedHoliday = {
    date: string;
    description: string;
    floater: boolean;
};

function formatDateForPostgres(date: Date): string {
    return date.toLocaleDateString("en-CA").split("T")[0];
}

function isPastDate(dateString: string | null): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

const HolidayPage = () => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [addHolidayYear, setAddHolidayYear] = useState<number>(new Date().getFullYear());

    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const { user } = useAppSelector(state => state.auth)

    const initialHoliday = useMemo(() => ({
        id: Date.now().toString(),
        date: null,
        is_floater: false,
        description: "",
        hasError: false,
        err: "",
        isPast: false,
        isExisting: false
    }), []);

    const [newHolidays, setNewHolidays] = useState<Holiday[]>([initialHoliday]);
    const [updatedHoliday, setUpdatedHoliday] = useState<string[]>([]);
    const [deletedHoliday, setDeletedHoliday] = useState<Holiday[]>([initialHoliday]);


    const loadExistingHolidaysForAddYear = useCallback(async (year: number) => {
        try {
            const startDate = new Date(`January 01,${year}`).toISOString().split("T")[0];
            const endDate = new Date(`December 31,${year}`).toISOString().split("T")[0];
            const resp = await getAllHolidays(startDate, endDate);

            if (resp.success && resp.data.length > 0) {
                const existingHolidays = resp.data.map((holiday: any) => ({
                    ...holiday,
                    hasError: false,
                    err: "",
                    isPast: isPastDate(holiday.date),
                    isExisting: true
                }));

                const holidaysWithNewRow = [...existingHolidays, { ...initialHoliday, id: Date.now().toString() }];
                setNewHolidays(holidaysWithNewRow);
            } else {
                setNewHolidays([{ ...initialHoliday, id: Date.now().toString() }]);
            }
        } catch (error) {
            console.error("Error loading existing holidays:", error);
            setNewHolidays([{ ...initialHoliday, id: Date.now().toString() }]);
        }
    }, [initialHoliday]);

    const debouncedLoadHolidays = useMemo(
        () => debounce(loadExistingHolidaysForAddYear, 300),
        [loadExistingHolidaysForAddYear]
    );

    const addHolidayRow = () => {
        setNewHolidays((prev) => [...prev, {
            ...initialHoliday,
            id: Date.now().toString(),
            isPast: false,
            isExisting: false
        }]);
    };

    const deleteHolidayRow = (index: number) => {
        const holidayToDelete = newHolidays[index];


        if (holidayToDelete.isPast && holidayToDelete.isExisting) {
            toast.error("Cannot delete past holidays");
            return;
        }

        setDeletedHoliday(prev => [...prev, holidayToDelete])

        setNewHolidays((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            return validateDuplicates(sortArrayBasedOnDate(updated));
        });
    };

    const updateHolidayField = (index: number, field: keyof Holiday, value: any) => {
        const holiday = newHolidays[index];


        if (holiday.isPast && holiday.isExisting) {
            toast.error("Cannot modify past holidays");
            return;
        }

        setUpdatedHoliday(prev => [...prev, holiday.id])

        setNewHolidays((prev) => {
            const updated = prev.map((holiday, i) => {
                if (i === index) {
                    const updatedHoliday = { ...holiday, [field]: value };
                    if (field === 'date') {
                        updatedHoliday.isPast = isPastDate(value);
                    }
                    return updatedHoliday;
                }
                return holiday;
            });

            const sorted = sortArrayBasedOnDate(updated);
            const validated = validateDuplicates(sorted);

            return validated;
        });
    };

    const sortArrayBasedOnDate = (data: Holiday[]) => {
        return data.sort((a, b) => {
            if (a.date === null)
                return 1;
            if (b.date === null)
                return -1;
            return (new Date(a.date) > new Date(b.date) ? 1 : -1)
        })
    }


    const validateDuplicates = (data: Holiday[]): Holiday[] => {
        const map = new Map<string, Holiday[]>();

        // Group by date
        for (const holiday of data) {
            if (!holiday.date) continue;
            if (!map.has(holiday.date)) {
                map.set(holiday.date, []);
            }
            map.get(holiday.date)!.push(holiday);
        }

        const result: Holiday[] = [];

        for (const [, holidays] of map.entries()) {
            const first = holidays[0];

            // âœ… require both description & floater to match
            const allSame = holidays.every(
                (h) =>
                    h.description === first.description &&
                    h.is_floater === first.is_floater
            );

            if (allSame) {
                // âœ… Keep only one copy
                result.push({ ...first, hasError: false, err: "" });
            } else {
                // âŒ Conflicting duplicates -> mark all
                for (const h of holidays) {
                    result.push({
                        ...h,
                        hasError: true,
                        err: "Duplicate date with conflicting description or floater",
                    });
                }
            }
        }

        return result;
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                let parsedData: ImportedHoliday[] = [];

                if (file.name.endsWith(".csv")) {
                    const text = data as string;
                    const lines = text.split("\n");

                    for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].split(",").map((v) => v.trim());
                        if (values.length >= 3 && values[0]) {
                            parsedData.push({
                                date: values[0],
                                description: values[1] || "",
                                floater: values[2].toLowerCase() === "true" || values[2] === "1",
                            });
                        }
                    }
                } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
                    const workbook = XLSX.read(data, { type: "binary" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    parsedData = (jsonData as any[])
                        .map((row: any) => ({
                            date: row.Date || row.date || "",
                            description: row.Description || row.description || "",
                            floater: Boolean(row.Floater || row.floater || row.is_floater),
                        }))
                        .filter((item) => item.date);
                }

                importData(parsedData);
                console.log('Imported dates in YYYY-MM-DD format:', parsedData.map(item => item.date));
            } catch (error) {
                console.error("Error parsing file:", error);
                alert("Error parsing file. Please check the format.");
            }
        };

        if (file.name.endsWith(".csv")) {
            reader.readAsText(file);
        } else {
            reader.readAsBinaryString(file);
        }
    };

    const importData = (importedData: ImportedHoliday[]) => {
        const convertedData: Holiday[] = importedData
            .filter(item => {
                const itemDate = new Date(item.date);
                const isCorrectYear = itemDate.getFullYear() === addHolidayYear;
                const isNotPast = !isPastDate(item.date);

                if (isCorrectYear && isPastDate(item.date)) {
                    console.warn(`Skipping past date from import: ${item.date}`);
                }

                return isCorrectYear && isNotPast;
            })
            .map((item, index) => ({
                id: `_${Date.now()}_${index}`,
                date: new Date(item.date).toLocaleDateString("en-CA"),
                is_floater: item.floater,
                description: item.description,
                hasError: false,
                err: "",
                isPast: isPastDate(item.date),
                isExisting: false
            }));

        if (convertedData.length === 0) {
            toast.warning("No future dates found in the imported file for the selected year");
            return;
        }

        const currentHolidays = newHolidays.filter(h => h.date || h.description.trim());
        const sortedHolidays = sortArrayBasedOnDate([...currentHolidays, ...convertedData]);
        const validatedHolidays = validateDuplicates(sortedHolidays);

        // Ensure there's always one empty row for new entries
        const hasEmptyRow = validatedHolidays.some(h => !h.date && !h.description.trim());
        if (!hasEmptyRow) {
            validatedHolidays.push({ ...initialHoliday, id: Date.now().toString() });
        }

        setNewHolidays(validatedHolidays);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        toast.success(`Imported ${convertedData.length} future holidays`);
    };

    const saveHolidays = async () => {
        const hasErrors = newHolidays.some(h => h.hasError);
        if (hasErrors) {
            toast.error("Please fix validation errors before saving");
            return;
        }

        // Only save new/modified non-past holidays
        const validHolidays = newHolidays.filter((h) =>
            h.date &&
            h.description.trim() &&
            !h.isPast &&
            (!h.isExisting || h.hasError)
        );

        if (validHolidays.length === 0 && updatedHoliday.length === 0 && deletedHoliday.length === 0) {
            toast.warning("No valid future holidays to save");
            return;
        }

        const validHoliday = validHolidays.map((h) => ({
            ...h,
            date: h.date,
        }))

        try {
            const response = await insertHolidayBulk(
                {
                    validHoliday: validHoliday,
                    deletedHoliday: deletedHoliday.filter(item => !isNaN(Number(item.id))),
                    updatedHoliday: newHolidays.filter(h => updatedHoliday.includes(h.id))
                }
            );


            if (response.success) {

                if (response.inserted !== 0)
                    toast.success(`Saved ${response.inserted} holidays`);
                if (response.updated !== 0)
                    toast.success(`Updated ${response.updated} holidays`);
                if (response.deleted !== 0)
                    toast.success(`Deleted ${response.deleted} holidays`);


                await debouncedLoadHolidays(addHolidayYear);

                setUpdatedHoliday([]);
                setDeletedHoliday([]);


                if (selectedYear === addHolidayYear) {
                    const startDate = new Date(`January 01,${selectedYear}`).toISOString().split("T")[0];
                    const endDate = new Date(`December 31,${selectedYear}`).toISOString().split("T")[0];
                    const resp = await getAllHolidays(startDate, endDate);
                    if (resp.success) setHolidays(resp.data);
                }
            }


        } catch (error) {
            console.error("Error saving holidays:", error);
            toast.error("Error saving holidays");
        }
    };

    // Load holidays for view tab
    useEffect(() => {
        (async () => {
            const startDate = new Date(`January 01,${selectedYear}`).toISOString().split("T")[0];
            const endDate = new Date(`December 31,${selectedYear}`).toISOString().split("T")[0];
            const resp = await getAllHolidays(startDate, endDate);

            if (resp.success) setHolidays(resp.data);
        })();
    }, [selectedYear]);

    // Load existing holidays when add holiday year changes
    useEffect(() => {
        loadExistingHolidaysForAddYear(addHolidayYear);
    }, [addHolidayYear, loadExistingHolidaysForAddYear]);

    const years: number[] = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - 2 + i);

    return (
        <div className="w-full">
            <Tabs defaultValue="view">
                <TabsList className="w-3/4 h-12">
                    <TabsTrigger value="view">View Holidays</TabsTrigger>
                    {user?.department === "ADMIN" && (<TabsTrigger value="add">Add Holidays</TabsTrigger>)}
                </TabsList>

                {/* ---------------- VIEW HOLIDAYS ---------------- */}
                <TabsContent value="view">
                    <div>
                        <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Pick a year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((item) => (
                                    <SelectItem key={item} className="text-bold" value={String(item)}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="w-3/4 m-4 ">
                            {holidays.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {holidays.map((item, index) => {
                                        const holidayDate = new Date(item.date || "");
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const isPast = holidayDate < today;

                                        const dayOfWeek = holidayDate.toLocaleDateString("en-CA", { weekday: "long" });
                                        const monthName = holidayDate.toLocaleDateString("en-CA", { month: "short" });
                                        const day = holidayDate.getDate();

                                        return (
                                            <div
                                                key={item.id || index}
                                                className={`flex flex-row gap-4 items-center p-4 border rounded-lg transition-colors 
              ${isPast
                                                        ? "bg-gray-100 dark:bg-neutral-800/40 text-gray-400"
                                                        : "hover:bg-neutral-50/20 dark:hover:bg-neutral-800/20"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-16 flex px-4 py-3 flex-col gap-1 items-center border rounded-lg shadow-sm 
                ${isPast ? "bg-gray-200 dark:bg-neutral-900 text-gray-400" : "bg-white dark:bg-neutral-900"}
              `}
                                                >
                                                    <div className="text-xl font-bold text-teal-600">{day}</div>
                                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">{monthName}</div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`font-bold ${isPast ? "text-gray-400" : ""}`}>{item.description}</div>
                                                    <div className="text-muted-foreground flex items-center gap-2">
                                                        <span className={`text-sm ${isPast ? "text-gray-400" : ""}`}>{dayOfWeek}</span>
                                                        {item.is_floater && (
                                                            <span
                                                                className={`text-xs px-2 py-1 rounded-full font-medium 
                      ${isPast
                                                                        ? "bg-gray-300 text-gray-500 dark:bg-neutral-700 dark:text-gray-400"
                                                                        : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                                                    }`}
                                                            >
                                                                Floater
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-muted-foreground text-sm flex justify-center">No Holidays to show.</div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* ---------------- ADD HOLIDAYS ---------------- */}
                <TabsContent value="add" className="mb-30">
                    <div className="flex flex-row items-center justify-between mb-4">
                        <Select value={String(addHolidayYear)} onValueChange={(value) => setAddHolidayYear(Number(value))}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Pick a year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((item) => (
                                    <SelectItem key={item} className="text-bold" value={String(item)}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-teal-600 dark:bg-teal-600 hover:bg-teal-600/70 hover:dark:bg-teal-600/70"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Import Excel/CSV
                        </Button>
                    </div>

                    <div>
                        <Table className="w-5/6">
                            <TableHeader className="bg-neutral-100 dark:bg-neutral-800 text-center">
                                <TableRow>
                                    <TableHead className="text-center w-48">Date</TableHead>
                                    <TableHead className="text-center ">Description</TableHead>
                                    <TableHead className="text-center">Floater</TableHead>
                                    <TableHead className="text-center w-24">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {newHolidays.map((item, idx) => (
                                    <TableRow
                                        className={`h-12 ${item.hasError ? "bg-red-600/25 hover:bg-red-600/35" :
                                            item.isPast && item.isExisting ? "bg-gray-100 dark:bg-neutral-800/40" : ""
                                            }`}
                                        title={item.hasError ? item.err : item.isPast && item.isExisting ? "Past holiday - cannot be modified" : ""}
                                        key={item.id || idx}
                                    >
                                        <TableCell>
                                            <Popover open={openIndex === idx} onOpenChange={(o) => setOpenIndex(o ? idx : null)}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        id="date"
                                                        className={`w-48 justify-between font-normal border-0 ${item.isPast && item.isExisting ? "text-gray-400 cursor-not-allowed" : ""
                                                            }`}
                                                        disabled={item.isPast && item.isExisting}
                                                    >
                                                        {item.date || "yyyy-mm-dd"}
                                                        <ChevronDownIcon />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        fromYear={addHolidayYear}
                                                        toYear={addHolidayYear}
                                                        selected={item.date ? new Date(item.date) : undefined}
                                                        captionLayout="dropdown"
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                updateHolidayField(idx, "date", formatDateForPostgres(date));
                                                            }
                                                            setOpenIndex(null);
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="text"
                                                className={`border-0 ${item.isPast && item.isExisting ? "text-gray-400 cursor-not-allowed" : ""
                                                    }`}
                                                placeholder="Holiday description"
                                                value={item.description}
                                                disabled={item.isPast && item.isExisting}
                                                onChange={(e) => updateHolidayField(idx, "description", e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={item?.is_floater === true}
                                                disabled={item.isPast && item.isExisting}
                                                onCheckedChange={(checked) => updateHolidayField(idx, "is_floater", checked)}
                                            />
                                        </TableCell>
                                        <TableCell className="flex justify-center">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={`text-red-600 hover:text-red-700 ${item.isPast && item.isExisting ? "cursor-not-allowed opacity-50" : ""
                                                    }`}
                                                disabled={item.isPast && item.isExisting}
                                                onClick={() => deleteHolidayRow(idx)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="fixed bottom-10 right-10 float-right flex flex-col items-center gap-2">
                            <Button variant="secondary" className="hover:scale-105" onClick={addHolidayRow}>
                                Add New Row <Plus className="w-3 h-4" />
                            </Button>
                            <Button
                                onClick={saveHolidays}
                                className="bg-teal-600 w-full hover:bg-teal-500 hover:scale-105"
                                disabled={newHolidays.every(h => (!h.date || !h.description.trim()) || (h.isPast && h.isExisting))}
                            >
                                Save Holidays
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default HolidayPage;