import {
  List, Datagrid, TextField, DateField, SearchInput,
  EditButton, DeleteButton,
} from 'react-admin';

const filters = [<SearchInput key="search" source="search" alwaysOn placeholder="Search activities…" />];

export const ActivityList = () => (
  <List filters={filters} sort={{ field: 'created_at', order: 'DESC' }} title="Activities">
    <Datagrid rowClick={false}>
      <TextField source="name" />
      <TextField source="category_name" label="Category" />
      <TextField source="address" />
      <DateField source="created_at" label="Created" />
      <EditButton />
      <DeleteButton confirmTitle="Delete activity?" />
    </Datagrid>
  </List>
);
