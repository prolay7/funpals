/**
 * app.ts — Funpals API entry point.
 * Boots Express HTTP server + WebSocket server on the same port.
 * All routes versioned under /api/v1.
 */
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'http';
import path from 'path';

import { env } from './config/env';
import { requestLogger, logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimit } from './middleware/rateLimiter';

import { authRouter }           from './modules/auth/routes';
import { userRouter }           from './modules/users/routes';
import { nearbyRouter }         from './modules/nearby/routes';
import { channelRouter, conversationRouter } from './modules/channels/routes';
import { activityRouter }       from './modules/activities/routes';
import { calendarRouter }       from './modules/calendar/routes';
import { postRouter }           from './modules/posts/routes';
import { questionRouter }       from './modules/questions/routes';
import { shareRouter }          from './modules/share/routes';
import { notifRouter }          from './modules/notifications/routes';
import { adminRouter }          from './modules/admin/routes';
import { groupRouter }          from './modules/groups/routes';
import { meetingRouter }        from './modules/meetings/routes';
import { skillRouter }          from './modules/skills/routes';
import { goalRouter }           from './modules/goals/routes';
import { favoriteRouter }       from './modules/favorites/routes';
import { categoryRouter }       from './modules/categories/routes';
import { verificationRouter }   from './modules/verification/routes';
import { searchRouter }         from './modules/search/routes';
import { materialRouter }       from './modules/materials/routes';
import { locationRouter }       from './modules/location/routes';
import { reportRouter }         from './modules/reports/routes';
import { WsServer }             from './websocket/WsServer';

const app = express();

// ── Security & performance ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.ALLOWED_ORIGINS.split(','), credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);
app.use(rateLimit(200, 60)); // Global: 200 req/min per IP

// ── Static media (served by Nginx in production, Express in dev) ──────────────
app.use('/media', express.static(path.resolve(env.MEDIA_UPLOAD_PATH)));

// ── API routes ────────────────────────────────────────────────────────────────
const V1 = '/api/v1';
app.use(`${V1}/auth`,          authRouter);
app.use(`${V1}/users`,         userRouter);
app.use(`${V1}/nearby`,        nearbyRouter);
app.use(`${V1}/channels`,      channelRouter);
app.use(`${V1}/activities`,    activityRouter);
app.use(`${V1}/calendar`,      calendarRouter);
app.use(`${V1}/posts`,         postRouter);
app.use(`${V1}/questions`,     questionRouter);
app.use(`${V1}/share`,         shareRouter);
app.use(`${V1}/notifications`, notifRouter);
app.use(`${V1}/admin`,         adminRouter);
app.use(`${V1}/groups`,        groupRouter);
app.use(`${V1}/meetings`,      meetingRouter);
app.use(`${V1}/skills`,        skillRouter);
app.use(`${V1}/goals`,         goalRouter);
app.use(`${V1}/favorites`,     favoriteRouter);
app.use(`${V1}/categories`,    categoryRouter);
app.use(`${V1}/verification`,  verificationRouter);
app.use(`${V1}/search`,        searchRouter);
app.use(`${V1}/materials`,     materialRouter);
app.use(`${V1}/location`,      locationRouter);
app.use(`${V1}/reports`,       reportRouter);
app.use(`${V1}/conversations`, conversationRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Start HTTP + WebSocket server ─────────────────────────────────────────────
const httpServer = createServer(app);
export const wsServer = new WsServer(httpServer);

const PORT = parseInt(env.PORT, 10);
httpServer.listen(PORT, () => logger.info(`🚀 Funpals API running on port ${PORT}`));

export default app;
