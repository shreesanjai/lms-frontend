"use client";

import { getAllHolidays } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

type Holiday = {
    id: string;
    date: Date;
    is_floater: boolean | null;
    description: string
}


const HolidayPage = () => {

    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [holidays, setHolidays] = useState<Holiday[]>([]);

    // const [newHolidays, setNewHolidays] = useState<Holiday[]>([]);

    useEffect(() => {
        (async () => {
            const startDate = new Date("January 01," + selectedYear).toLocaleDateString("en-CA")
            const endDate = new Date("December 31," + selectedYear).toLocaleDateString("en-CA")
            const resp = await getAllHolidays(startDate, endDate)

            if (resp.success)
                setHolidays(resp.data);
        })()
    }, [selectedYear])

    const years: number[] = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - 2 + i);

    return (
        <div className="w-full">
            <Tabs defaultValue="view">
                <TabsList className="w-3/4 h-12">
                    <TabsTrigger value="view">View Holidays</TabsTrigger>
                    <TabsTrigger value="add">Add Holidays</TabsTrigger>
                </TabsList >
                <TabsContent value="view">
                    <div>

                        <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pick a year" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    years.map(item => (
                                        <SelectItem className="text-bold" value={String(item)}>{item}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>

                        <div className="w-3/4 m-4">
                            {holidays.length > 0 ? (
                                <Table className="border">
                                    <TableHeader className="bg-neutral-100 dark:bg-neutral-800">
                                        <TableRow >
                                            <TableHead>Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Floater</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {
                                            holidays.map(item => (
                                                <TableRow className="h-12">
                                                    <TableCell>{new Date(item.date).toLocaleDateString("en-ca")}</TableCell>
                                                    <TableCell>{item.description}</TableCell>
                                                    <TableCell><Checkbox className="checked:bg-teal-600" checked={item?.is_floater === true} /></TableCell>
                                                </TableRow>))
                                        }

                                    </TableBody>
                                </Table>
                            ) : (<div className="text-muted-foreground text-sm flex justify-center">No Holidays to show.</div>)}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="add">
                    <div className="flex flex-row items-center justify-between">

                        <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pick a year" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    years.map(item => (
                                        <SelectItem className="text-bold" value={String(item)}>{item}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>

                        <Button className="bg-teal-600 dark:bg-teal-600 hover:bg-teal-600/70 hover:dark:bg-teal-600/70">Import Excel/CSV</Button>

                    </div>


                </TabsContent>
            </Tabs >

        </div >
    )
}


export default HolidayPage