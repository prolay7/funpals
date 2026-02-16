import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
export default function Notifications() {
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const send = useMutation({ mutationFn: () => apiClient.post('/admin/notifications/send', { user_id: userId, title, body }) });
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A3C5E] mb-4">Send Push Notification</h1>
      <div className="bg-white rounded-xl p-6 shadow w-96 flex flex-col gap-3">
        <input className="border rounded p-2 text-sm" placeholder="User ID (UUID)" value={userId} onChange={e=>setUserId(e.target.value)} />
        <input className="border rounded p-2 text-sm" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="border rounded p-2 text-sm" placeholder="Body" rows={3} value={body} onChange={e=>setBody(e.target.value)} />
        <button className="bg-[#0E7F6B] text-white rounded py-2 font-medium hover:bg-teal-700"
          onClick={() => send.mutate()}>Send Notification</button>
        {send.isSuccess && <p className="text-green-600 text-sm">Sent successfully!</p>}
      </div>
    </div>
  );
}
