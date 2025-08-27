import { departments } from "@/utils/constants";
import { Button } from "./ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState, type FormEvent } from "react";
import { addUser, type UserData } from "@/api/api";
import { toast } from "sonner";


interface AppUserProps {
    onClose: () => void;
}

const AddUser = ({ onClose }: AppUserProps) => {

    const [formData, setFormData] = useState<UserData>({
        name: "",
        username: "",
        role: "",
        department: "",
        password: "",
        reporting_manager_id: "1",
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const resp = await addUser(formData);

            toast.success("User Created", {
                description: resp.username
            })
            onClose();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.log(error);

            throw new Error(error.message)
        }
    }

    const onValueUpdate = (key: keyof UserData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }


    return (
        <div className="border border-gray9700 bg-white dark:bg-gray-950 p-6 rounded-2xl">
            <h2 className="text-lg font-semibold mb-4">Add New User</h2>

            {/* Example form content */}
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
                        type="text"
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
                                {
                                    departments.map((item, idx) => (
                                        <SelectItem value={item} key={idx}>
                                            {item.charAt(0) + item.slice(1).toLowerCase()}
                                        </SelectItem>
                                    ))
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose} // 🔹 close when cancel clicked
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