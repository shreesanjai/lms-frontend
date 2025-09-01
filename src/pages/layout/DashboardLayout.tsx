// pages/layout/DashboardLayout.tsx
import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/SideBar';
import TopBar from '@/components/TopBar';
import AddUser from '@/components/AddUser';

const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [addUserOpen, setAddUserOpen] = useState(false);


    const sidebarToggle = useCallback((open: boolean) => {
        setSidebarOpen(open);
    }, []);

    const addUserToggle = useCallback((open: boolean) => {
        setAddUserOpen(open);
    }, []);

    const closeSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    const closeAddUser = useCallback(() => {
        setAddUserOpen(false);
    }, []);

    return (
        <div className="h-screen flex overflow-hidden dark:bg-neutral-950">

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={sidebarToggle} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">

                <TopBar setSidebarOpen={sidebarToggle} setAddUserOpen={addUserToggle} />

                <main className="flex-1 overflow-auto">
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>

            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-opacity-10 lg:hidden" onClick={closeSidebar} />
            )}

            {addUserOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
                    <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={closeAddUser} />
                    <div className="relative z-10 w-full max-w-lg">
                        <AddUser onClose={closeAddUser} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;