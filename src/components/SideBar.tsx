// components/Sidebar.tsx
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, TreePalm, X, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { UserData } from '@/api/api';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    hasTeam: boolean;
    teamData?: UserData[];
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, hasTeam }) => {
    const location = useLocation();

    const sidebarItems = useMemo(() => {
        const baseItems = [
            {
                name: 'Dashboard',
                href: '/dashboard',
                icon: Home
            },
            {
                name: 'Leave',
                href: '/leave',
                icon: Calendar
            },
            {
                name: 'Holiday',
                href: '/holiday',
                icon: TreePalm
            }
        ];

        if (hasTeam) {
            baseItems.push({
                name: 'My Team',
                href: '/team',
                icon: Users
            });
        }

        return baseItems;
    }, [hasTeam]);

    const renderSidebarItem = (item: typeof sidebarItems[0]) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;

        return (
            <li key={item.name}>
                <Link
                    to={item.href}
                    className={`
            flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-teal-100/40 hover:text-teal-700/80 hover:dark:bg-teal-950 hover:dark:text-teal-100
            ${isActive ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-100'
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
    };

    return (
        <div className={`
      fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
      lg:translate-x-0 lg:static lg:inset-0 border-r dark:border-zinc-800 backdrop-blur-xs
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
            <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
                        LMS
                    </h1>
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
                    {sidebarItems.map(renderSidebarItem)}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;