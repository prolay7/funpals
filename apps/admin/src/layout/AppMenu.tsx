import { Menu } from 'react-admin';
import {
  LayoutDashboard, Users, Activity, BookOpen, FileText,
  Bell, Settings, Flag, Users2, Video, Globe,
} from 'lucide-react';

export const AppMenu = () => (
  <Menu>
    <Menu.DashboardItem primaryText="Dashboard" leftIcon={<LayoutDashboard size={18} />} />
    <Menu.Item to="/users"      primaryText="Users"      leftIcon={<Users size={18} />} />
    <Menu.Item to="/activities" primaryText="Activities" leftIcon={<Activity size={18} />} />
    <Menu.Item to="/materials"  primaryText="Materials"  leftIcon={<BookOpen size={18} />} />
    <Menu.Item to="/groups"     primaryText="Groups"     leftIcon={<Users2 size={18} />} />
    <Menu.Item to="/meetings"   primaryText="Meetings"   leftIcon={<Video size={18} />} />
    <Menu.Item to="/posts"      primaryText="Posts"      leftIcon={<FileText size={18} />} />
    <Menu.Item to="/reports"    primaryText="Reports"    leftIcon={<Flag size={18} />} />
    <Menu.Item to="/notifications" primaryText="Notifications" leftIcon={<Bell size={18} />} />
    <Menu.Item to="/settings"   primaryText="Settings"   leftIcon={<Settings size={18} />} />
    <Menu.Item to="/location"   primaryText="Search"     leftIcon={<Globe size={18} />} />
  </Menu>
);
