/**
 * App.tsx — Funpals Admin Panel root component.
 * Powered by react-admin with shadcn/ui components.
 */
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';

import { authProvider }  from '@/providers/authProvider';
import { dataProvider }  from '@/providers/dataProvider';
import { AppLayout }     from '@/layout/AppLayout';
import { LoginPage }     from '@/pages/LoginPage';
import { Dashboard }     from '@/pages/Dashboard';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SettingsPage }  from '@/pages/SettingsPage';

import { UserList }      from '@/resources/users/UserList';
import { UserShow }      from '@/resources/users/UserShow';
import { ActivityList }  from '@/resources/activities/ActivityList';
import { ActivityCreate, ActivityEdit } from '@/resources/activities/ActivityForm';
import { MaterialList }  from '@/resources/materials/MaterialList';
import { MaterialCreate, MaterialEdit } from '@/resources/materials/MaterialForm';
import { ReportList }    from '@/resources/reports/ReportList';
import { GroupList }     from '@/resources/groups/GroupList';
import { MeetingList }   from '@/resources/meetings/MeetingList';
import { PostList }      from '@/resources/posts/PostList';

export default function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      layout={AppLayout}
      loginPage={LoginPage}
      dashboard={Dashboard}
      title="Funpals Admin"
    >
      <Resource name="users"      list={UserList}     show={UserShow} />
      <Resource name="activities" list={ActivityList} create={ActivityCreate} edit={ActivityEdit} />
      <Resource name="materials"  list={MaterialList} create={MaterialCreate} edit={MaterialEdit} />
      <Resource name="groups"     list={GroupList} />
      <Resource name="meetings"   list={MeetingList} />
      <Resource name="posts"      list={PostList} />
      <Resource name="reports"    list={ReportList} />

      <CustomRoutes>
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings"      element={<SettingsPage />} />
      </CustomRoutes>
    </Admin>
  );
}
