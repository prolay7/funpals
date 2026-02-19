import { Create, Edit, SimpleForm, TextInput, required } from 'react-admin';

const MaterialFormFields = () => (
  <>
    <TextInput source="title"       validate={required()} fullWidth label="Title" />
    <TextInput source="url"         validate={required()} fullWidth label="URL" type="url" />
    <TextInput source="category"    fullWidth label="Category" />
    <TextInput source="description" fullWidth multiline rows={3} label="Description" />
  </>
);

export const MaterialCreate = () => (
  <Create title="Add Material">
    <SimpleForm><MaterialFormFields /></SimpleForm>
  </Create>
);

export const MaterialEdit = () => (
  <Edit title="Edit Material">
    <SimpleForm><MaterialFormFields /></SimpleForm>
  </Edit>
);
