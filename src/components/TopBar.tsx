// components/TopBar.tsx
import React from 'react';
import { Menu, LogOut, UserPlus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { logoutThunk } from '@/store/thunks/authThunks';
import { ModeToggle } from '@/components/ui/mode-toggle';

interface TopBarProps {
    setSidebarOpen: (open: boolean) => void;
    setAddUserOpen: (open: boolean) => void;
}

const TopBar: React.FC<TopBarProps> = ({ setSidebarOpen, setAddUserOpen }) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logoutThunk());
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="border-b border-zinc-200 dark:border-zinc-800 h-16">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex items-center space-x-4">
                    <ModeToggle />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-teal-600 dark:text-neutral-800 text-white">
                                        {getInitials(user?.name || user?.username || 'User')}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.username}
                                    </p>
                                </div>
                            </DropdownMenuLabel>

                            {user?.department === "ADMIN" && (
                                <DropdownMenuItem onClick={() => setAddUserOpen(true)}>
                                    <UserPlus /> Add User
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer text-red-600 dark:text-red-400"
                            >
                                <LogOut className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default TopBar;