import { Outlet } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';

const Index = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default Index;