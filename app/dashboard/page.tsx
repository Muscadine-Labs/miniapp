import Dashboard from '../components/Dashboard';

// Force dynamic rendering to avoid SSR issues with wallet hooks
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return <Dashboard />;
}

