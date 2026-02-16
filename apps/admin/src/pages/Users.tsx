import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export default function Users() {
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => apiClient.get(`/admin/users${search ? `?search=${search}` : ''}`).then(r => r.data.data),
  });
  const banMutation = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) => apiClient.patch(`/admin/users/${id}/ban`, { banned }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A3C5E] mb-4">Users</h1>
      <input className="border rounded p-2 mb-4 w-72 text-sm" placeholder="Search by email or username..."
        value={search} onChange={e => setSearch(e.target.value)} />
      {isLoading ? <p className="text-gray-500">Loading...</p> : (
        <table className="w-full bg-white rounded-xl shadow text-sm">
          <thead className="bg-[#1A3C5E] text-white">
            <tr>{['Username','Email','Role','Status','Actions'].map(h=><th key={h} className="p-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {(data ?? []).map((u: any) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${u.role==='admin'?'bg-purple-100 text-purple-700':'bg-gray-100'}`}>{u.role}</span></td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${u.is_active?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{u.is_active?'Active':'Banned'}</span></td>
                <td className="p-3">
                  <button className={`text-xs px-2 py-1 rounded ${u.is_active?'bg-red-100 text-red-700 hover:bg-red-200':'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    onClick={() => banMutation.mutate({ id: u.id, banned: u.is_active })}>
                    {u.is_active ? 'Ban' : 'Unban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
