import { useAppSelector } from '@/store/hook';
import LeaveSummary from '@/components/LeaveSummary';
import LeaveHistory from '@/components/LeaveHistory';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';



const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const [year, setYear] = useState(new Date().getFullYear())

  const years = Array.from({ length: 2 }, (_, i) => new Date().getFullYear() + i)

  return (
    <div className="space-y-8">
      <div className="flex justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Hi, {user?.name?.split(' ')[0] || 'User'}!
        </h1>

        <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Pick a year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((item) => (
              <SelectItem key={item} className="text-bold" value={String(item)}>
                Jan {item} - Dec {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>



      {/* Leave Summary */}
      <div className=''>
        <LeaveSummary year={year} />
      </div>


      {/* Leave History */}
      <div className='flex flex-col gap-3'>
        <h3 className='text-xl font-bold'>Leave History</h3>
        <LeaveHistory year={year} />
      </div>

    </div>
  );
};

export default Dashboard;