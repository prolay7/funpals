import { List, Datagrid, TextField, DateField, NumberField } from 'react-admin';
import { Badge } from '@/components/ui/badge';
import { useRecordContext } from 'react-admin';

const PrivacyBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  return record.is_private
    ? <Badge variant="secondary">Private</Badge>
    : <Badge variant="outline">Public</Badge>;
};

export const GroupList = () => (
  <List sort={{ field: 'created_at', order: 'DESC' }} title="Groups">
    <Datagrid rowClick={false} bulkActionButtons={false}>
      <TextField source="name" />
      <TextField source="description" />
      <NumberField source="member_count" label="Members" />
      <PrivacyBadge />
      <DateField source="created_at" label="Created" />
    </Datagrid>
  </List>
);
