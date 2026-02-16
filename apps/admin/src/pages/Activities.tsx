import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
export default function Activities() {
  const { data } = useQuery({ queryKey: ['activities'], queryFn: () => apiClient.get('/admin/activities').then(r => r.data.data) });
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A3C5E] mb-4">Activities Management</h1>
      <div className="grid grid-cols-3 gap-4">
        {(data ?? []).map((a: any) => (
          <div key={a.id} className="bg-white rounded-xl p-4 shadow">
            <p className="font-semibold">{a.title}</p>
            <p className="text-xs text-gray-500">{a.category_name}</p>
            <p className="text-xs text-gray-400 mt-1">{a.address ?? 'No address'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
