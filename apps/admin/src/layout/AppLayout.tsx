import { Layout, LayoutProps } from 'react-admin';
import { AppMenu } from './AppMenu';
import { AppBar } from './AppBar';

export const AppLayout = (props: LayoutProps) => (
  <Layout
    {...props}
    menu={AppMenu}
    appBar={AppBar}
    sx={{
      '& .RaLayout-appFrame': { marginTop: 0 },
      '& .RaSidebar-root': {
        backgroundColor: 'hsl(var(--sidebar))',
        borderRight: '1px solid hsl(var(--sidebar-border))',
        '& .RaMenuItemLink-root': {
          color: 'hsl(var(--sidebar-foreground))',
          borderRadius: '6px',
          margin: '2px 8px',
          '&:hover': { backgroundColor: 'hsl(var(--sidebar-accent) / 0.3)' },
          '&.RaMenuItemLink-active': {
            backgroundColor: 'hsl(var(--sidebar-accent))',
            color: 'hsl(var(--sidebar-accent-foreground))',
          },
        },
        '& .RaMenu-root': { paddingTop: '8px' },
      },
      '& .RaLayout-content': {
        backgroundColor: 'hsl(var(--background))',
        padding: '24px',
      },
    }}
  />
);
