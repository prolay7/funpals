import { useEffect, useState } from 'react';
import { Title } from 'react-admin';
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { Users, MessageSquare, Activity, Video, Flag, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/api/client';

interface Stats {
  total_users?: number;
  totalUsers?: number;
  total_channels?: number;
  totalChannels?: number;
  messages_today?: number;
  messagesToday?: number;
  active_activities?: number;
  activeActivities?: number;
  live_meetings?: number;
  pending_reports?: number;
  registrations_by_day?: { date: string; count: number }[];
  activity_categories?: { name: string; count: number }[];
}

const PIE_COLORS = ['#0E7F6B', '#1A3C5E', '#2CA58D', '#4ECDC4', '#84BC9C', '#A8DADC'];

const StatCard = ({
  title, value, icon: Icon, color,
}: { title: string; value: number | undefined; icon: React.ElementType; color: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`rounded-md p-2 ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value?.toLocaleString() ?? '—'}</div>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/admin/stats')
      .then((r) => setStats((r.data?.data ?? r.data) as Stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const registrations = stats.registrations_by_day ?? [
    { date: 'Mon', count: 12 }, { date: 'Tue', count: 19 }, { date: 'Wed', count: 14 },
    { date: 'Thu', count: 28 }, { date: 'Fri', count: 22 }, { date: 'Sat', count: 35 }, { date: 'Sun', count: 18 },
  ];
  const categories = stats.activity_categories ?? [
    { name: 'Sports', count: 30 }, { name: 'Arts', count: 20 }, { name: 'Tech', count: 25 },
    { name: 'Music', count: 15 }, { name: 'Other', count: 10 },
  ];

  return (
    <div className="space-y-6">
      <Title title="Dashboard" />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">Platform statistics at a glance</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Users"       value={stats.total_users ?? stats.totalUsers}               icon={Users}         color="bg-primary" />
        <StatCard title="Total Channels"    value={stats.total_channels ?? stats.totalChannels}         icon={Radio}         color="bg-secondary" />
        <StatCard title="Messages Today"    value={stats.messages_today ?? stats.messagesToday}         icon={MessageSquare} color="bg-teal-600" />
        <StatCard title="Active Activities" value={stats.active_activities ?? stats.activeActivities}   icon={Activity}      color="bg-indigo-500" />
        <StatCard title="Live Meetings"     value={stats.live_meetings}                                 icon={Video}         color="bg-violet-500" />
        <StatCard title="Pending Reports"   value={stats.pending_reports}                               icon={Flag}          color="bg-rose-500" />
      </div>
      {!loading && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">User Registrations (Last 7 days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={registrations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0E7F6B" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Activity Categories</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categories} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
