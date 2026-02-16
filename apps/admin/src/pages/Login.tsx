import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      if (data.user?.role !== 'admin') { setError('Admin access required'); return; }
      localStorage.setItem('adminToken', data.tokens.accessToken);
      navigate('/');
    } catch { setError('Invalid credentials'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A3C5E]">
      <div className="bg-white p-8 rounded-xl shadow-xl w-96">
        <h1 className="text-2xl font-bold text-[#1A3C5E] mb-6">Funpals Admin</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input className="w-full border rounded p-2 mb-3 text-sm" type="email" placeholder="Admin email"
          value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border rounded p-2 mb-4 text-sm" type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <button onClick={handleLogin}
          className="w-full bg-[#0E7F6B] text-white py-2 rounded hover:bg-teal-700 font-medium">
          Sign In
        </button>
      </div>
    </div>
  );
}
