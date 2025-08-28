/* eslint-disable @typescript-eslint/no-explicit-any */
import { departments } from "@/utils/constants";
import { Button } from "./ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { addUser, searchUser, type UserData } from "@/api/api";
import { toast } from "sonner";
import debounce from 'lodash.debounce'

interface AppUserProps {
    onClose: () => void;
}

interface user {
    id: string;
    name: string;
    username: string;
}

const searchUsers = async (searchTerm: string): Promise<user[]> => {

    try {
        const users: user[] = (await searchUser(searchTerm)).suggestions;
        console.log(users);

        if (users.length <= 0) return []
        // return [];
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } catch (error: any) {
        toast.error("Error Occured", error.message)
        return [];
    }

};

const AddUser = ({ onClose }: AppUserProps) => {
    const [formData, setFormData] = useState<UserData>({
        name: "",
        username: "",
        role: "",
        department: "",
        password: "",
        reporting_manager_id: "",
    });

    const [inputValue, setInputValue] = useState("");
    const [searchResults, setSearchResults] = useState<user[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const resp = await addUser(formData);

            toast.success("User Created", {
                description: resp.username
            })
            onClose();

        } catch (error: any) {
            toast.error("Create Failure", {
                description: error.message,
                duration: 2000
            })
        }
    }

    // Debounced search function
    const debouncedSearch = useMemo(
        () => debounce(async (searchTerm: string) => {
            if (searchTerm.trim().length < 2) {
                setSearchResults([]);
                setShowDropdown(false);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const results: user[] | any = await searchUsers(searchTerm);
                setSearchResults(results);
                setShowDropdown(true);
            } catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300),
        []
    );

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        debouncedSearch(value);
    };

    // Handle manager selection
    const handleManagerSelect = (manager: any) => {
        setInputValue(manager.name);
        setFormData(prev => ({ ...prev, reporting_manager_id: manager.id }));
        setShowDropdown(false);
        setSearchResults([]);
    };

    // Generic form update handler
    const onValueUpdate = (key: keyof UserData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.manager-search-container')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="border border-gray-700 bg-white dark:bg-gray-950 p-6 rounded-2xl">
            <h2 className="text-lg font-semibold mb-4">Add New User</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <Label className="mb-2">Name</Label>
                    <Input
                        type="text"
                        className="w-full"
                        placeholder="Enter name"
                        onChange={(e) => onValueUpdate("name", e.target.value)}
                    />
                </div>

                <div>
                    <Label className="mb-2">Username</Label>
                    <Input
                        type="text"
                        className="w-full"
                        placeholder="Enter username"
                        onChange={(e) => onValueUpdate("username", e.target.value)}
                    />
                </div>

                <div>
                    <Label className="mb-2">Password</Label>
                    <Input
                        type="password"
                        className="w-full"
                        placeholder="Enter password"
                        onChange={(e) => onValueUpdate("password", e.target.value)}
                    />
                </div>

                <div>
                    <Label className="mb-2">Role</Label>
                    <Input
                        type="text"
                        className="w-full"
                        placeholder="Enter role"
                        onChange={(e) => onValueUpdate("role", e.target.value)}
                    />
                </div>

                <div>
                    <Label className="mb-2">Department</Label>
                    <Select onValueChange={(value) => onValueUpdate("department", value)}>
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

                <div className="manager-search-container relative">
                    <Label className="mb-2">Reporting Manager</Label>
                    <div className="relative">
                        <Input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="Search for reporting manager..."
                            className="w-full pr-8"
                        />

                        {isSearching && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showDropdown && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((manager) => (
                                <button
                                    key={manager.id}
                                    type="button"
                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none"
                                    onClick={() => handleManagerSelect(manager)}
                                >
                                    <div className="font-medium">{manager.name}</div>
                                    <div className="text-sm text-gray-500">@{manager.username}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No results message */}
                    {showDropdown && searchResults.length === 0 && !isSearching && inputValue.length >= 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-3 text-gray-500 text-sm">
                            No managers found
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </div>
    );
}

export default AddUser