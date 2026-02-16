import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
export default function Settings() {
  const { data } = useQuery({ queryKey: ['settings'], queryFn: () => apiClient.get('/admin/settings').then(r => r.data.data) });
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A3C5E] mb-4">App Settings</h1>
      <div className="bg-white rounded-xl p-6 shadow">
        <pre className="text-sm text-gray-600">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
