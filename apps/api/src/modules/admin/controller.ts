import { Request, Response, NextFunction } from 'express';
import * as svc from './service';
import * as actSvc from '../activities/service';
import { sendPushNotification } from '../notifications/service';

export const getStats        = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.getDashboardStats() }); } catch (e) { next(e); } };
export const listUsers       = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listUsersAdmin(req.query.search as string) }); } catch (e) { next(e); } };
export const banUser         = async (req: Request, res: Response, next: NextFunction) => { try { await svc.setBanStatus(req.params.id, req.body.banned); res.json({ success: true }); } catch (e) { next(e); } };
export const listActivities  = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await actSvc.listActivities() }); } catch (e) { next(e); } };
export const createActivity  = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { db } = await import('../../config/database');
    const { rows } = await db.query(`INSERT INTO activities (category_id,title,description,image_url,address,external_url,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.body.category_id,req.body.title,req.body.description,req.body.image_url,req.body.address,req.body.external_url,req.body.sort_order??0]);
    res.status(201).json({ data: rows[0] });
  } catch (e) { next(e); }
};
export const updateActivity  = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { db } = await import('../../config/database');
    const fields = Object.keys(req.body).map((k,i)=>`${k}=$${i+2}`).join(',');
    const { rows } = await db.query(`UPDATE activities SET ${fields} WHERE id=$1 RETURNING *`, [req.params.id, ...Object.values(req.body)]);
    res.json({ data: rows[0] });
  } catch (e) { next(e); }
};
export const deleteActivity  = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { db } = await import('../../config/database');
    await db.query('UPDATE activities SET is_active=FALSE WHERE id=$1',[req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};
export const sendNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id, title, body } = req.body;
    await sendPushNotification(user_id, { title, body });
    res.json({ success: true });
  } catch (e) { next(e); }
};
export const getSettings    = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.getAppSettings() }); } catch (e) { next(e); } };
export const updateSettings = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.updateAppSettings(req.body) }); } catch (e) { next(e); } };
export const listMaterials  = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listMaterials(req.query.search as string) }); } catch (e) { next(e); } };
export const createMaterial = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json({ data: await svc.createMaterial(req.body) }); } catch (e) { next(e); } };
export const updateMaterial = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.updateMaterial(req.params.id, req.body) }); } catch (e) { next(e); } };
export const deleteMaterial = async (req: Request, res: Response, next: NextFunction) => { try { await svc.deleteMaterial(req.params.id); res.json({ success: true }); } catch (e) { next(e); } };
