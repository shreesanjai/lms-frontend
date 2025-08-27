import React from 'react';
import { useAppSelector } from '@/store/hook';


const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Hi, {user?.name?.split(' ')[0] || 'User'}!
        </h1>

      </div>


    </div>
  );
};

export default Dashboard;