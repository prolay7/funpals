import { useState } from 'react';
import { Title, useNotify } from 'react-admin';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/api/client';
import { Bell, Send, Loader2 } from 'lucide-react';

const schema = z.object({
  userId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(100),
  body: z.string().min(1, 'Message body is required').max(500),
});
type FormValues = z.infer<typeof schema>;

interface SentNotification { title: string; body: string; userId?: string; sentAt: string }

export const NotificationsPage = () => {
  const raNotify = useNotify();
  const [broadcastAll, setBroadcastAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SentNotification[]>([]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const title = watch('title', '');
  const body = watch('body', '');

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await apiClient.post('/admin/notifications/send', {
        ...(broadcastAll ? {} : { userId: values.userId }),
        title: values.title,
        body: values.body,
      });
      setHistory((h) => [{ title: values.title, body: values.body, userId: values.userId, sentAt: new Date().toLocaleString() }, ...h.slice(0, 19)]);
      raNotify('Notification sent', { type: 'success' });
      reset();
    } catch {
      raNotify('Failed to send notification', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Title title="Notifications" />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Push Notifications</h2>
        <p className="text-muted-foreground">Send in-app push notifications to users</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compose Notification</CardTitle>
              <CardDescription>Fill in the details below and hit Send</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="broadcast">Broadcast to all users</Label>
                <Switch id="broadcast" checked={broadcastAll} onCheckedChange={setBroadcastAll} />
              </div>
              {!broadcastAll && (
                <div className="space-y-1">
                  <Label htmlFor="userId">User ID (UUID)</Label>
                  <Input id="userId" placeholder="e.g. 00000000-0000-…" {...register('userId')} />
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="New activity available!" {...register('title')} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="body">Message</Label>
                <Textarea id="body" placeholder="Join the chess tournament this Saturday…" rows={3} {...register('body')} />
                {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send Notification</>}
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Live preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-muted p-4 space-y-1 min-h-[80px]">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-primary" />
                  <span className="text-sm font-semibold">{title || 'Notification title'}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{body || 'Notification body will appear here…'}</p>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Recent Sent</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {history.map((n, i) => (
                  <div key={i} className="border rounded-md p-3 text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{n.title}</span>
                      {n.userId ? <Badge variant="outline" className="text-xs">{n.userId.slice(0, 8)}…</Badge> : <Badge variant="secondary">All</Badge>}
                    </div>
                    <p className="text-muted-foreground text-xs">{n.body}</p>
                    <p className="text-muted-foreground text-xs">{n.sentAt}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
