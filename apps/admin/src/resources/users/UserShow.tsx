import {
  Show, SimpleShowLayout, TextField, EmailField, DateField,
  useRecordContext, ArrayField, Datagrid,
} from 'react-admin';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const UserProfile = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <div className="flex items-center gap-4 mb-6">
      {record.photo_url
        ? <img src={record.photo_url as string} alt="" className="w-16 h-16 rounded-full object-cover border" />
        : <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl">{String(record.username ?? '?')[0].toUpperCase()}</div>}
      <div>
        <h2 className="text-xl font-bold">{record.display_name ?? record.username}</h2>
        <p className="text-muted-foreground text-sm">{record.email as string}</p>
        <div className="flex gap-2 mt-1">
          <Badge variant={record.role === 'admin' ? 'default' : 'outline'}>{record.role as string}</Badge>
          <Badge variant={record.is_banned ? 'destructive' : 'success'}>{record.is_banned ? 'Banned' : 'Active'}</Badge>
        </div>
      </div>
    </div>
  );
};

export const UserShow = () => (
  <Show title="User Profile">
    <SimpleShowLayout>
      <UserProfile />
      <div className="grid md:grid-cols-2 gap-4 mt-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Username</span><TextField source="username" /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><EmailField source="email" /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><DateField source="created_at" /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expertise</span><TextField source="expertise_level" /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Daily Goal</CardTitle></CardHeader>
          <CardContent>
            <TextField source="daily_goal" emptyText="No goal set" />
          </CardContent>
        </Card>
      </div>
    </SimpleShowLayout>
  </Show>
);
