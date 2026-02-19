import { AppBar as RaAppBar, TitlePortal, useGetIdentity, useLogout } from 'react-admin';
import { LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export const AppBar = () => {
  const { identity } = useGetIdentity();
  const logout = useLogout();
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDark((d) => !d);
  };

  return (
    <RaAppBar
      sx={{
        backgroundColor: 'hsl(var(--secondary))',
        color: '#fff',
        boxShadow: 'none',
        borderBottom: '1px solid hsl(var(--sidebar-border))',
        '& .RaAppBar-title': { flex: 1 },
      }}
    >
      {/* Funpals logo / brand */}
      <span className="flex items-center gap-2 font-bold text-lg text-white mr-4 select-none">
        <span className="inline-block w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black">F</span>
        Funpals Admin
      </span>

      <TitlePortal />

      <div className="flex items-center gap-2 ml-auto">
        {identity && (
          <span className="text-sm text-white/80 hidden sm:block">
            {identity.fullName}
          </span>
        )}
        <Button variant="ghost" size="icon" onClick={toggleDark} className="text-white hover:bg-white/10">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => logout()} className="text-white hover:bg-white/10">
          <LogOut size={16} />
        </Button>
      </div>
    </RaAppBar>
  );
};
