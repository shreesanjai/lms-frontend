import React from 'react';
import { Menu, LogOut, UserPlus, UserRoundPen } from 'lucide-react';
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
import { getInitials } from '@/utils/constants';

interface TopBarProps {
    setSidebarOpen: (open: boolean) => void;
    setAddUserOpen: (open: boolean) => void;
    setUpdateUserOpen: (open: boolean) => void;
}

const TopBar: React.FC<TopBarProps> = ({ setSidebarOpen, setAddUserOpen, setUpdateUserOpen }) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logoutThunk());
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
                                    <div className='flex justify-between'>
                                        <p className="text-sm font-medium leading-none">
                                            {user?.name || 'User'}
                                        </p>
                                        <span className='text-xs leading-none text-muted-foreground'>{user?.department}</span>
                                    </div>
                                    <div className='flex justify-between'>

                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.username}
                                        </p>
                                        <span className='text-xs leading-none text-muted-foreground'>{user?.role}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            {user?.department === "ADMIN" && (
                                <div>
                                    <DropdownMenuItem onClick={() => setAddUserOpen(true)}>
                                        <UserPlus /> Add User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setUpdateUserOpen(true)}>
                                        <UserRoundPen /> Update User
                                    </DropdownMenuItem></div>
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