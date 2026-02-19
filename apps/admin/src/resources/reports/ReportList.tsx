import { List, Datagrid, TextField, DateField } from 'react-admin';
import { Badge } from '@/components/ui/badge';
import { useRecordContext } from 'react-admin';

const ReasonBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  return <Badge variant="warning">{record.reason as string}</Badge>;
};

export const ReportList = () => (
  <List sort={{ field: 'created_at', order: 'DESC' }} title="User Reports">
    <Datagrid rowClick={false} bulkActionButtons={false}>
      <TextField source="reporter_username" label="Reporter" />
      <TextField source="reported_username"  label="Reported User" />
      <ReasonBadge />
      <DateField source="created_at" label="Date" />
    </Datagrid>
  </List>
);
