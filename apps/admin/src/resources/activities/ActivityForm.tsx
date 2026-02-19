import {
  Create, Edit, SimpleForm, TextInput, required,
} from 'react-admin';

const ActivityFormFields = () => (
  <>
    <TextInput source="name"        validate={required()} fullWidth label="Activity Name" />
    <TextInput source="description" fullWidth multiline rows={3} label="Description" />
    <TextInput source="category_id" label="Category ID (UUID)" fullWidth />
  </>
);

export const ActivityCreate = () => (
  <Create title="Create Activity">
    <SimpleForm><ActivityFormFields /></SimpleForm>
  </Create>
);

export const ActivityEdit = () => (
  <Edit title="Edit Activity">
    <SimpleForm><ActivityFormFields /></SimpleForm>
  </Edit>
);
