import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initializeAuthThunk } from './store/thunks/authThunks';
import { Toaster } from './components/ui/sonner';
import { useAppDispatch, useAppSelector } from './store/hook';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import DashboardLayout from './pages/layout/DashboardLayout';
import Leave from './pages/Leave';
import Holiday from './pages/Holiday';
import Team from './pages/Team';
import Policy from './pages/Policy';


const App = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuthThunk());
  }, [dispatch]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
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
          <Route index element={<Leave />} />
        </Route>

        <Route path="/holiday" element={<DashboardLayout />}>
          <Route index element={<Holiday />} />
        </Route>

        <Route path="/team" element={<DashboardLayout />}>
          <Route index element={<Team />} />
        </Route>

        <Route path="/policy" element={<DashboardLayout />}>
          <Route index element={<Policy />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster richColors position="bottom-center" />
    </>
  );
};

export default App;