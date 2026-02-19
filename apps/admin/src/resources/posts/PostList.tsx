import {
  List, Datagrid, TextField, DateField, SearchInput,
  useRecordContext, useDelete, useNotify, useRefresh,
} from 'react-admin';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

const DeletePostButton = () => {
  const record = useRecordContext();
  const [deleteOne] = useDelete();
  const notify = useNotify();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);
  if (!record) return null;

  const handleDelete = async () => {
    await deleteOne('posts', { id: record.id, previousData: record });
    notify('Post deleted', { type: 'success' });
    setOpen(false);
    refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm"><Trash2 size={14} /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Post</DialogTitle>
          <DialogDescription>Remove "{record.title as string}" permanently?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const filters = [<SearchInput key="search" source="search" alwaysOn placeholder="Search posts…" />];

export const PostList = () => (
  <List filters={filters} sort={{ field: 'created_at', order: 'DESC' }} title="Posts Moderation">
    <Datagrid rowClick={false} bulkActionButtons={false}>
      <TextField source="title" />
      <TextField source="author_username" label="Author" />
      <DateField source="created_at" label="Posted" />
      <DeletePostButton />
    </Datagrid>
  </List>
);
