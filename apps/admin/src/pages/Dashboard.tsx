import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['stats'], queryFn: () => apiClient.get('/admin/stats').then(r => r.data.data) });
  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  const stats = [
    { label: 'Total Users',       value: data?.totalUsers       ?? 0 },
    { label: 'Total Channels',    value: data?.totalChannels    ?? 0 },
    { label: 'Messages Today',    value: data?.messagesToday    ?? 0 },
    { label: 'Active Activities', value: data?.activeActivities ?? 0 },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A3C5E] mb-6">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-[#1A3C5E]">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
