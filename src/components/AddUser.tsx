/* eslint-disable @typescript-eslint/no-explicit-any */
import { departments } from "@/utils/constants";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { addUser, searchUser, type UserData } from "@/api/api";
import { toast } from "sonner";
import debounce from "lodash.debounce";

interface AppUserProps {
    onClose: () => void;
}

interface user {
    id: string;
    name: string;
    username: string;
    department: string;
}

const searchUsers = async (searchTerm: string): Promise<user[]> => {
    try {
        const users: user[] = (await searchUser(searchTerm)).suggestions;
        if (users.length <= 0) return [];
        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } catch (error: any) {
        toast.error("Error Occurred", error.message);
        return [];
    }
};

const AddUser = ({ onClose }: AppUserProps) => {
    const [formData, setFormData] = useState<UserData>({
        id: "",
        name: "",
        username: "",
        role: "",
        department: "",
        password: "",
        reporting_manager_id: "",
        hr_id: "",
    });

    // Reporting Manager States
    const [managerInput, setManagerInput] = useState("");
    const [managerResults, setManagerResults] = useState<user[]>([]);
    const [isSearchingManager, setIsSearchingManager] = useState(false);
    const [showManagerDropdown, setShowManagerDropdown] = useState(false);

    // HR States
    const [hrInput, setHrInput] = useState("");
    const [hrResults, setHrResults] = useState<user[]>([]);
    const [isSearchingHr, setIsSearchingHr] = useState(false);
    const [showHrDropdown, setShowHrDropdown] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const resp = await addUser(formData);
            toast.success("User Created", { description: resp.username });
            onClose();
        } catch (error: any) {
            toast.error("Create Failure", { description: error.message, duration: 2000 });
        }
    };

    // Debounced search for Manager
    const debouncedManagerSearch = useMemo(
        () =>
            debounce(async (searchTerm: string) => {
                if (searchTerm.trim().length < 2) {
                    setManagerResults([]);
                    setShowManagerDropdown(false);
                    setIsSearchingManager(false);
                    return;
                }

                setIsSearchingManager(true);
                try {
                    const results = await searchUsers(searchTerm);
                    setManagerResults(results);
                    setShowManagerDropdown(true);
                } catch (error) {
                    console.error("Search failed:", error);
                    setManagerResults([]);
                } finally {
                    setIsSearchingManager(false);
                }
            }, 300),
        []
    );

    // Debounced search for HR (filtered by department = HR)
    const debouncedHrSearch = useMemo(
        () =>
            debounce(async (searchTerm: string) => {
                if (searchTerm.trim().length < 2) {
                    setHrResults([]);
                    setShowHrDropdown(false);
                    setIsSearchingHr(false);
                    return;
                }

                setIsSearchingHr(true);
                try {
                    const results = await searchUsers(searchTerm);
                    const hrOnly = results.filter((user) => user.department === "HR"); // filter HR only
                    setHrResults(hrOnly);
                    setShowHrDropdown(true);
                } catch (error) {
                    console.error("Search failed:", error);
                    setHrResults([]);
                } finally {
                    setIsSearchingHr(false);
                }
            }, 300),
        []
    );

    const handleManagerSelect = (manager: user) => {
        setManagerInput(manager.name);
        setFormData((prev) => ({
            ...prev,
            reporting_manager_id: manager.id,
            department: manager.department,
        }));
        setShowManagerDropdown(false);
        setManagerResults([]);
    };

    const handleHrSelect = (hr: user) => {
        setHrInput(hr.name);
        setFormData((prev) => ({
            ...prev,
            hr_id: hr.id,
        }));
        setShowHrDropdown(false);
        setHrResults([]);
    };

    const onValueUpdate = (key: keyof UserData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        return () => {
            debouncedManagerSearch.cancel();
            debouncedHrSearch.cancel();
        };
    }, [debouncedManagerSearch, debouncedHrSearch]);

    return (
        <div className="border border-neutral-700 bg-white dark:bg-neutral-900 p-6 rounded-2xl">
            <h2 className="text-lg font-semibold mb-4">Add New User</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Name */}
                <div>
                    <Label className="mb-2">Name</Label>
                    <Input type="text" placeholder="Enter name" onChange={(e) => onValueUpdate("name", e.target.value)} />
                </div>

                {/* Username */}
                <div>
                    <Label className="mb-2">Username</Label>
                    <Input type="text" placeholder="Enter username" onChange={(e) => onValueUpdate("username", e.target.value)} />
                </div>

                {/* Password */}
                <div>
                    <Label className="mb-2">Password</Label>
                    <Input type="password" placeholder="Enter password" onChange={(e) => onValueUpdate("password", e.target.value)} />
                </div>

                {/* Role */}
                <div>
                    <Label className="mb-2">Role</Label>
                    <Input type="text" placeholder="Enter role" onChange={(e) => onValueUpdate("role", e.target.value)} />
                </div>

                {/* Department */}
                <div>
                    <Label className="mb-2">Department</Label>
                    <Select onValueChange={(value) => onValueUpdate("department", value)} value={formData.department}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {departments.map((item, idx) => (
                                    <SelectItem value={item} key={idx}>
                                        {item.charAt(0) + item.slice(1).toLowerCase()}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {/* Reporting Manager */}
                <div className="manager-search-container relative">
                    <Label className="mb-2">Reporting Manager</Label>
                    <div className="relative">
                        <Input
                            type="text"
                            value={managerInput}
                            onChange={(e) => {
                                setManagerInput(e.target.value);
                                debouncedManagerSearch(e.target.value);
                            }}
                            placeholder="Search for reporting manager..."
                            className="w-full pr-8"
                        />
                        {isSearchingManager && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {showManagerDropdown && managerResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {managerResults.map((manager) => (
                                <button
                                    key={manager.id}
                                    type="button"
                                    className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    onClick={() => handleManagerSelect(manager)}
                                >
                                    <div className="font-medium">{manager.name}</div>
                                    <div className="text-sm text-gray-500">@{manager.username}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {showManagerDropdown && managerResults.length === 0 && !isSearchingManager && managerInput.length >= 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-3 text-gray-500 text-sm">
                            No managers found
                        </div>
                    )}
                </div>

                {/* HR Search */}
                <div className="manager-search-container relative">
                    <Label className="mb-2">HR</Label>
                    <div className="relative">
                        <Input
                            type="text"
                            value={hrInput}
                            onChange={(e) => {
                                setHrInput(e.target.value);
                                debouncedHrSearch(e.target.value);
                            }}
                            placeholder="Search for HR..."
                            className="w-full pr-8"
                        />
                        {isSearchingHr && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {showHrDropdown && hrResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {hrResults.map((hr) => (
                                <button
                                    key={hr.id}
                                    type="button"
                                    className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    onClick={() => handleHrSelect(hr)}
                                >
                                    <div className="font-medium">{hr.name}</div>
                                    <div className="text-sm text-gray-500">@{hr.username}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {showHrDropdown && hrResults.length === 0 && !isSearchingHr && hrInput.length >= 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-3 text-gray-500 text-sm">
                            No HR found
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-teal-700 hover:bg-teal-800">
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddUser;
