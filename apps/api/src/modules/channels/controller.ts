import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const listChannels  = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await svc.listChannels(req.user!.id) }); } catch (e) { next(e); }
};
export const createChannel = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json({ data: await svc.createChannel(req.user!.id, req.body.name, req.body.description) }); } catch (e) { next(e); }
};
export const getChannel    = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await (await import('../../config/database')).db.query('SELECT * FROM channels WHERE id=$1 AND deleted_at IS NULL',[req.params.id]);
    if (!rows.length) { res.status(404).json({ error: 'Channel not found' }); return; }
    res.json({ data: rows[0] });
  } catch (e) { next(e); }
};
export const joinChannel   = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { db } = await import('../../config/database');
    await db.query(`INSERT INTO channel_members (channel_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,[req.params.id,req.user!.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};
export const leaveChannel  = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { db } = await import('../../config/database');
    await db.query('DELETE FROM channel_members WHERE channel_id=$1 AND user_id=$2',[req.params.id,req.user!.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};
export const toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { db } = await import('../../config/database');
    const { rows } = await db.query('SELECT is_favorite FROM channel_members WHERE channel_id=$1 AND user_id=$2',[req.params.id,req.user!.id]);
    if (!rows.length) { res.status(400).json({ error: 'Not a member' }); return; }
    const newVal = !rows[0].is_favorite;
    await db.query('UPDATE channel_members SET is_favorite=$1 WHERE channel_id=$2 AND user_id=$3',[newVal,req.params.id,req.user!.id]);
    res.json({ data: { is_favorite: newVal } });
  } catch (e) { next(e); }
};
export const getMessages   = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await svc.getMessages(req.params.id, req.query as Record<string,unknown>) }); } catch (e) { next(e); }
};
export const listConversations = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await svc.listConversations(req.user!.id) }); } catch (e) { next(e); }
};
