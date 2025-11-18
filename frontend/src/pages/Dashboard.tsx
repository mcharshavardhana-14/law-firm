import { useAuth } from '@/contexts/AuthContext';
import { Folder, FileText, Users, Activity } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Projects', value: '12', icon: Folder, color: 'bg-blue-500' },
    { name: 'Documents', value: '48', icon: FileText, color: 'bg-green-500' },
    { name: 'Team Members', value: '8', icon: Users, color: 'bg-purple-500' },
    { name: 'Active Cases', value: '7', icon: Activity, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">Here's an overview of your legal cases</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Projects</h2>
          <p className="text-gray-500">No recent projects yet</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Upcoming Hearings</h2>
          <p className="text-gray-500">No upcoming hearings</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
