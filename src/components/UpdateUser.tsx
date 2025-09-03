/* eslint-disable @typescript-eslint/no-explicit-any */
import { departments } from "@/utils/constants";
import { Button } from "./ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getUserById, updateUser, searchUser, type UserData } from "@/api/api";
import { toast } from "sonner";
import debounce from 'lodash.debounce'

interface UpdateUserProps {
    userId?: string; // Optional - can be provided or searched
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

        if (users.length <= 0) return []
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } catch (error: any) {
        toast.error("Error Occurred", error.message)
        return [];
    }
};

const UpdateUser = ({ userId, onClose }: UpdateUserProps) => {
    const [formData, setFormData] = useState<UserData>({
        id: "",
        name: "",
        username: "",
        role: "",
        department: "",
        password: "",
        reporting_manager_id: "",
    });

    const [selectedUserId, setSelectedUserId] = useState<string | null>(userId || null);
    const [userSearchValue, setUserSearchValue] = useState("");
    const [userSearchResults, setUserSearchResults] = useState<user[]>([]);
    const [isUserSearching, setIsUserSearching] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Manager search states
    const [managerInputValue, setManagerInputValue] = useState("");
    const [managerSearchResults, setManagerSearchResults] = useState<user[]>([]);
    const [isManagerSearching, setIsManagerSearching] = useState(false);
    const [showManagerDropdown, setShowManagerDropdown] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [userDataLoaded, setUserDataLoaded] = useState(!!userId);

    // Fetch user data when selectedUserId changes
    useEffect(() => {
        if (selectedUserId) {
            const fetchUserData = async () => {
                try {
                    setIsLoading(true);
                    const userData = await getUserById(selectedUserId);

                    setFormData({
                        id: userData.id || "",
                        name: userData.name || "",
                        username: userData.username || "",
                        role: userData.role || "",
                        department: userData.department || "",
                        password: "",
                        reporting_manager_id: userData.reporting_manager_id || "",
                    });

                    // If there's a reporting manager ID, fetch their data to show name
                    if (userData.reporting_manager_id) {
                        try {
                            const managerData = await getUserById(userData.reporting_manager_id);
                            setManagerInputValue(managerData.name);
                        } catch (error) {
                            console.error('Failed to fetch manager data:', error);
                            setManagerInputValue(''); // Clear if manager data can't be fetched
                        }
                    } else {
                        setManagerInputValue(''); // Clear if no reporting manager
                    }

                    setUserDataLoaded(true);

                } catch (error: any) {
                    toast.error("Failed to fetch user data", {
                        description: error.message
                    });
                } finally {
                    setIsLoading(false);
                }
            };

            fetchUserData();
        }
    }, [selectedUserId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedUserId) {
            toast.error("Please select a user to update");
            return;
        }

        try {
            const resp = await updateUser({ ...formData, id: selectedUserId });

            toast.success("User Updated Successfully", {
                description: resp.username
            })
            onClose();

        } catch (error: any) {
            toast.error("Update Failed", {
                description: error.message,
                duration: 2000
            })
        }
    }

    // Debounced search function for users
    const debouncedUserSearch = useMemo(
        () => debounce(async (searchTerm: string) => {
            if (searchTerm.trim().length < 2) {
                setUserSearchResults([]);
                setShowUserDropdown(false);
                setIsUserSearching(false);
                return;
            }

            setIsUserSearching(true);
            try {
                const results: user[] | any = await searchUsers(searchTerm);
                setUserSearchResults(results);
                setShowUserDropdown(true);
            } catch (error) {
                console.error('User search failed:', error);
                setUserSearchResults([]);
            } finally {
                setIsUserSearching(false);
            }
        }, 300),
        []
    );

    // Debounced search function for managers
    const debouncedManagerSearch = useMemo(
        () => debounce(async (searchTerm: string) => {
            if (searchTerm.trim().length < 2) {
                setManagerSearchResults([]);
                setShowManagerDropdown(false);
                setIsManagerSearching(false);
                return;
            }

            setIsManagerSearching(true);
            try {
                const results: user[] | any = await searchUsers(searchTerm);
                setManagerSearchResults(results);
                setShowManagerDropdown(true);
            } catch (error) {
                console.error('Manager search failed:', error);
                setManagerSearchResults([]);
            } finally {
                setIsManagerSearching(false);
            }
        }, 300),
        []
    );

    const handleUserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUserSearchValue(value);
        debouncedUserSearch(value);
    };

    const handleManagerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setManagerInputValue(value);
        debouncedManagerSearch(value);
    };

    const handleUserSelect = (user: any) => {
        setUserSearchValue(`${user.name} (@${user.username})`);
        setSelectedUserId(user.id);
        setShowUserDropdown(false);
        setUserSearchResults([]);
        setUserDataLoaded(false); // Reset to show loading when new user is selected
    };

    const handleManagerSelect = (manager: any) => {
        setManagerInputValue(manager.name);

        setFormData(prev => ({
            ...prev,
            reporting_manager_id: manager.id,
            department: manager.department // Update department when manager is selected, same as AddUser
        }));
        setShowManagerDropdown(false);
        setManagerSearchResults([]);
    };

    const onValueUpdate = (key: keyof UserData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }

    useEffect(() => {
        return () => {
            debouncedUserSearch.cancel();
            debouncedManagerSearch.cancel();
        };
    }, [debouncedUserSearch, debouncedManagerSearch]);

    return (
        <div className="border border-neutral-700 bg-white dark:bg-neutral-900 p-6 rounded-2xl">
            <h2 className="text-lg font-semibold mb-4">Update User</h2>

            {/* User Search Section */}
            {!userId && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Label className="mb-2 font-medium">Search User to Update</Label>
                    <div className="relative">
                        <Input
                            type="text"
                            value={userSearchValue}
                            onChange={handleUserSearchChange}
                            placeholder="Search by name or username..."
                            className="w-full pr-8"
                        />

                        {isUserSearching && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {showUserDropdown && userSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {userSearchResults.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:outline-none"
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-gray-500">@{user.username} • {user.department}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {showUserDropdown && userSearchResults.length === 0 && !isUserSearching && userSearchValue.length >= 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-3 text-gray-500 text-sm">
                            No users found
                        </div>
                    )}
                </div>
            )}

            {/* Loading State */}
            {selectedUserId && isLoading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                    <span className="ml-2">Loading user data...</span>
                </div>
            )}

            {/* Update Form */}
            {selectedUserId && userDataLoaded && !isLoading && (
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label className="mb-2">Name</Label>
                        <Input
                            type="text"
                            className="w-full"
                            placeholder="Enter name"
                            value={formData.name}
                            onChange={(e) => onValueUpdate("name", e.target.value)}
                        />
                    </div>

                    <div>
                        <Label className="mb-2">Username</Label>
                        <Input
                            type="text"
                            className="w-full"
                            placeholder="Enter username"
                            value={formData.username}
                            onChange={(e) => onValueUpdate("username", e.target.value)}
                        />
                    </div>

                    <div>
                        <Label className="mb-2">Password</Label>
                        <Input
                            type="password"
                            className="w-full"
                            placeholder="Enter new password (leave empty to keep current)"
                            value={formData.password}
                            onChange={(e) => onValueUpdate("password", e.target.value)}
                        />
                    </div>

                    <div>
                        <Label className="mb-2">Role</Label>
                        <Input
                            type="text"
                            className="w-full"
                            placeholder="Enter role"
                            value={formData.role}
                            onChange={(e) => onValueUpdate("role", e.target.value)}
                        />
                    </div>

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

                    <div className="manager-search-container relative">
                        <Label className="mb-2">Reporting Manager</Label>
                        <div className="relative">
                            <Input
                                type="text"
                                value={managerInputValue}
                                onChange={handleManagerInputChange}
                                placeholder="Search for reporting manager..."
                                className="w-full pr-8"
                            />

                            {isManagerSearching && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                                </div>
                            )}
                        </div>

                        {showManagerDropdown && managerSearchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {managerSearchResults.map((manager) => (
                                    <button
                                        key={manager.id}
                                        type="button"
                                        className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:outline-none"
                                        onClick={() => {
                                            handleManagerSelect(manager)
                                            setShowManagerDropdown(false)
                                        }}
                                    >
                                        <div className="font-medium">{manager.name}</div>
                                        <div className="text-sm text-gray-500">@{manager.username}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showManagerDropdown && managerSearchResults.length === 0 && !isManagerSearching && managerInputValue.length >= 2 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-3 text-gray-500 text-sm">
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
                        <Button type="submit" className="bg-teal-700 hover:bg-teal-800">
                            Update User
                        </Button>
                    </div>
                </form>
            )}

            {/* Show message when no user is selected */}
            {!selectedUserId && (
                <div className="text-center py-8 text-gray-500">
                    <p>Search for a user above to start updating their information</p>
                </div>
            )}
        </div>
    );
}

export default UpdateUser