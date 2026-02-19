import {
  List, Datagrid, TextField, EmailField, DateField, useRecordContext,
  useUpdate, useNotify, useRefresh, SearchInput, BooleanField,
} from 'react-admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const RoleBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  return record.role === 'admin'
    ? <Badge variant="default">Admin</Badge>
    : <Badge variant="outline">User</Badge>;
};

const StatusBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  return record.is_banned
    ? <Badge variant="destructive">Banned</Badge>
    : <Badge variant="success">Active</Badge>;
};

const AvatarField = () => {
  const record = useRecordContext();
  if (!record) return null;
  return record.photo_url
    ? <img src={record.photo_url as string} alt="" className="w-8 h-8 rounded-full object-cover" />
    : <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{String(record.username ?? '?')[0].toUpperCase()}</div>;
};

const BanButton = () => {
  const record = useRecordContext();
  const [update] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);
  if (!record) return null;

  const handleBan = async () => {
    await update('users', { id: record.id, data: { __action: 'ban' }, previousData: record });
    notify(record.is_banned ? 'User unbanned' : 'User banned', { type: 'success' });
    setOpen(false);
    refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={record.is_banned ? 'outline' : 'destructive'} size="sm" className="gap-1">
          {record.is_banned ? <><ShieldCheck size={14} /> Unban</> : <><ShieldBan size={14} /> Ban</>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record.is_banned ? 'Unban User' : 'Ban User'}</DialogTitle>
          <DialogDescription>
            {record.is_banned
              ? `Restore access for ${record.username}?`
              : `Block ${record.username} from accessing Funpals?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant={record.is_banned ? 'default' : 'destructive'} onClick={handleBan}>
            {record.is_banned ? 'Unban' : 'Ban'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const filters = [<SearchInput key="search" source="search" alwaysOn placeholder="Search users…" />];

export const UserList = () => (
  <List filters={filters} sort={{ field: 'created_at', order: 'DESC' }} title="Users">
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <AvatarField />
      <TextField source="username" />
      <EmailField source="email" />
      <RoleBadge />
      <StatusBadge />
      <DateField source="created_at" label="Joined" />
      <BanButton />
    </Datagrid>
  </List>
);
