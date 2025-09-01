import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initializeAuthThunk } from './store/thunks/authThunks';


import Dashboard from './pages/Dashboard';

import { useAppDispatch, useAppSelector } from './store/hook';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/layout/DashboardLayout';
import LeavePage from './pages/LeavePage';
import { Toaster } from './components/ui/sonner';
import HolidayPage from './pages/HolidayPage';


const App = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuthThunk());
  }, [dispatch]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
        </Route>

        <Route path="/leave" element={<DashboardLayout />}>
          <Route index element={<LeavePage />} />
        </Route>

        <Route path="/holiday" element={<DashboardLayout />}>
          <Route index element={<HolidayPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster richColors position="bottom-center" />
    </>
  );
};

export default App;