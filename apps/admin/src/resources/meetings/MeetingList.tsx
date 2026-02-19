import { List, Datagrid, TextField, DateField } from 'react-admin';
import { Badge } from '@/components/ui/badge';
import { useRecordContext } from 'react-admin';

const LiveBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  return record.is_live
    ? <Badge variant="destructive" className="animate-pulse">● Live</Badge>
    : <Badge variant="outline">Ended</Badge>;
};

const TypeBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  const colors: Record<string, string> = { video: 'bg-blue-100 text-blue-800', audio: 'bg-green-100 text-green-800', google_meet: 'bg-yellow-100 text-yellow-800' };
  const t = record.meeting_type as string ?? 'video';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[t] ?? ''}`}>{t}</span>;
};

export const MeetingList = () => (
  <List sort={{ field: 'created_at', order: 'DESC' }} title="Meetings">
    <Datagrid rowClick={false} bulkActionButtons={false}>
      <TextField source="call_id" label="Call ID" />
      <TypeBadge />
      <LiveBadge />
      <TextField source="created_by" label="Created By" />
      <DateField source="created_at" label="Started" />
    </Datagrid>
  </List>
);
