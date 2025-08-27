import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    Home,
    Calendar,
    LogOut,
    Menu,
    X,
    UserPlus,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { logoutThunk } from '@/store/thunks/authThunks';
import { ModeToggle } from '@/components/mode-toggle';
import AddUser from '@/components/AddUser';


const sidebarItems = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home
    },
    {
        name: 'Leave',
        href: '/leave',
        icon: Calendar
    }
];

const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [addUserOpen, setAddUserOpen] = useState(false);
    const location = useLocation();
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
        <div className="h-screen flex overflow-hidden">
            {/* Sidebar */}
            <div className={`
                                fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
                                lg:translate-x-0 lg:static lg:inset-0 border-r dark:border-gray-800 backdrop-blur-xs
                                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                            `}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                            LMS
                        </h1>x
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="mt-8 px-4">
                    <ul className="space-y-2">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;

                            return (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        className={`
                      flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${isActive
                                                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-100'
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900'
                                            }
                    `}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>


            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                {/* Top bar */}
                <header className="border-b border-gray-200 dark:border-gray-800">
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
                                            <AvatarImage src="/placeholder-avatar.jpg" alt={user?.name || 'User'} />
                                            <AvatarFallback className="bg-teal-600 text-white">
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

                                    {user?.role === "Admin" && <DropdownMenuItem onClick={() => { setAddUserOpen(true) }}>
                                        <UserPlus /> Add User
                                    </DropdownMenuItem>}


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


                <main className="flex-1 overflow-auto">
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>


            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-opacity-10 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {
                addUserOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">

                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setAddUserOpen(false)}
                        />


                        <div className="relative z-10 w-full max-w-lg">
                            <AddUser onClose={() => setAddUserOpen(false)} />
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default DashboardLayout;