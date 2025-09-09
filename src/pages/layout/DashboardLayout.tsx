
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/SideBar';
import TopBar from '@/components/TopBar';
import AddUser from '@/components/AddUser';
import UpdateUser from '@/components/UpdateUser';
import { getMyTeam } from '@/api/api';
import LoadingSpinner from '@/components/ui/Spinner';

const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [addUserOpen, setAddUserOpen] = useState(false);
    const [updateUserOpen, setUpdateUserOpen] = useState(false);
    const [teamData, setTeamData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const hasTeam = useMemo(() => teamData.length > 0, [teamData.length]);

    const fetchTeamData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await getMyTeam();
            if (res.data.length <= 0)
                setTeamData(res.hrData);
            else
                setTeamData(res.data);
            console.log(res);

        } catch (error) {
            console.error('Error fetching team data:', error);
            setTeamData([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        console.log(teamData);
    }, [teamData])

    useEffect(() => {
        fetchTeamData();
    }, [fetchTeamData]);

    const toggleSidebar = (open: boolean) => setSidebarOpen(open);
    const toggleAddUser = (open: boolean) => setAddUserOpen(open);
    const toggleUpdateUser = (open: boolean) => setUpdateUserOpen(open);

    const closeSidebar = () => setSidebarOpen(false);
    const closeAddUser = () => setAddUserOpen(false);
    const closeUpdateUser = () => setUpdateUserOpen(false);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-lg"><LoadingSpinner /></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex overflow-hidden dark:bg-neutral-950">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={toggleSidebar}
                hasTeam={hasTeam}
            />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                <TopBar
                    setSidebarOpen={toggleSidebar}
                    setAddUserOpen={toggleAddUser}
                    setUpdateUserOpen={toggleUpdateUser}
                />

                <main className="flex-1 overflow-auto">
                    <div className="p-6">
                        <Outlet context={{ hasTeam, teamData }} />
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

            {updateUserOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
                    <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={closeUpdateUser} />
                    <div className="relative z-10 w-full max-w-lg">
                        <UpdateUser onClose={closeUpdateUser} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;