import { useEffect, useState } from 'react';
import { Title, useNotify } from 'react-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/api/client';
import { Loader2, Save, RefreshCw } from 'lucide-react';

type SettingValue = string | number | boolean;
type Settings = Record<string, SettingValue>;

const SettingField = ({
  name, value, onChange,
}: { name: string; value: SettingValue; onChange: (v: SettingValue) => void }) => {
  const label = name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center justify-between py-2 border-b last:border-0">
        <Label className="capitalize">{label}</Label>
        <Switch checked={value} onCheckedChange={onChange} />
      </div>
    );
  }
  if (typeof value === 'number') {
    return (
      <div className="space-y-1 py-2 border-b last:border-0">
        <Label>{label}</Label>
        <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="max-w-xs" />
      </div>
    );
  }
  return (
    <div className="space-y-1 py-2 border-b last:border-0">
      <Label>{label}</Label>
      <Input value={String(value)} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};

export const SettingsPage = () => {
  const raNotify = useNotify();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    apiClient.get('/admin/settings')
      .then((r) => {
        const raw = r.data?.data ?? r.data;
        setSettings(typeof raw === 'object' && raw !== null ? raw as Settings : {});
      })
      .catch(() => raNotify('Failed to load settings', { type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch('/admin/settings', settings);
      raNotify('Settings saved', { type: 'success' });
    } catch {
      raNotify('Failed to save settings', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: SettingValue) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Title title="Settings" />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">App Settings</h2>
          <p className="text-muted-foreground">Configure global platform behaviour</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration</CardTitle>
          <CardDescription>Changes take effect immediately after saving</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
              <Loader2 className="animate-spin" size={18} /> Loading settings…
            </div>
          ) : Object.keys(settings).length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No settings found</p>
          ) : (
            <div className="space-y-1">
              {Object.entries(settings).map(([key, value]) => (
                <SettingField key={key} name={key} value={value} onChange={(v) => handleChange(key, v)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(settings).length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Settings</>}
          </Button>
        </div>
      )}
    </div>
  );
};
