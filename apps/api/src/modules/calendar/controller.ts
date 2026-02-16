import { Request, Response, NextFunction } from 'express';
import * as svc from './service';
export const listEvents   = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listEvents(req.user!.id) }); } catch (e) { next(e); } };
export const createEvent  = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json({ data: await svc.createEvent(req.user!.id, req.body) }); } catch (e) { next(e); } };
export const getEvent     = async (req: Request, res: Response, next: NextFunction) => { try { const { rows } = await (await import('../../config/database')).db.query('SELECT * FROM events WHERE id=$1',[req.params.id]); rows.length ? res.json({ data: rows[0] }) : res.status(404).json({ error: 'Not found' }); } catch (e) { next(e); } };
export const rsvp         = async (req: Request, res: Response, next: NextFunction) => { try { await svc.setRsvp(req.user!.id, req.params.id, req.body.status); res.json({ success: true }); } catch (e) { next(e); } };
