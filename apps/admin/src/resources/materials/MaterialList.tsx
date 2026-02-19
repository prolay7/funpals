import {
  List, Datagrid, TextField, DateField, SearchInput,
  EditButton, DeleteButton, UrlField,
} from 'react-admin';

const filters = [<SearchInput key="search" source="search" alwaysOn placeholder="Search materials…" />];

export const MaterialList = () => (
  <List filters={filters} sort={{ field: 'created_at', order: 'DESC' }} title="Materials">
    <Datagrid rowClick={false}>
      <TextField source="title" />
      <UrlField source="url" label="Link" />
      <TextField source="category" />
      <TextField source="description" />
      <DateField source="created_at" label="Created" />
      <EditButton />
      <DeleteButton confirmTitle="Delete material?" />
    </Datagrid>
  </List>
);
