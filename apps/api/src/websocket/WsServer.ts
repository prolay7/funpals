/**
 * WsServer.ts — Custom WebSocket server (zero subscription, no Firebase/Pusher).
 * Uses the native 'ws' npm package. Shares the HTTP server with Express.
 * Redis pub/sub enables broadcast across multiple API instances (horizontal scaling).
 *
 * MESSAGE PROTOCOL (JSON over WebSocket):
 *   Client → Server:
 *     { type: "auth",     token: "<JWT>" }
 *     { type: "join",     channelId: "<uuid>" }
 *     { type: "message",  channelId: "<uuid>", content: "..." }
 *     { type: "typing",   channelId: "<uuid>", isTyping: boolean }
 *     { type: "presence", status: "online"|"away"|"oncall" }
 *     { type: "ping" }
 *
 *   Server → Client:
 *     { type: "auth_ok",     userId }
 *     { type: "new_message", message: {...} }
 *     { type: "typing",      userId, channelId, isTyping }
 *     { type: "presence",    userId, status }
 *     { type: "notification",title, body, data }
 *     { type: "pong" }
 */
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyToken } from '../middleware/auth';
import { redisPublisher, redisSubscriber } from '../config/redis';
import { saveMessage, getChannelMemberIds } from '../modules/channels/service';
import { updatePresence } from '../modules/nearby/service';
import { logger } from '../middleware/logger';

interface AuthedSocket extends WebSocket {
  userId?: string;
  channels: Set<string>;
  isAlive: boolean;
}

export class WsServer {
  private wss: WebSocketServer;
  /** userId → socket mapping for targeted sends */
  private clients = new Map<string, AuthedSocket>();

  constructor(httpServer: Server) {
    this.wss = new WebSocketServer({ server: httpServer, path: '/ws' });
    this.setupRedisSubscriber();
    this.startHeartbeat();
    this.wss.on('connection', this.onConnect.bind(this));
    logger.info('WebSocket server started on /ws');
  }

  private onConnect(ws: AuthedSocket): void {
    ws.channels = new Set();
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('message', (raw) => this.handleMessage(ws, raw.toString()));
    ws.on('close', () => this.handleDisconnect(ws));
    ws.on('error', (err) => logger.error({ err }, 'WS socket error'));
  }

  private async handleMessage(ws: AuthedSocket, raw: string): Promise<void> {
    let msg: Record<string, unknown>;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {
      case 'auth':     return this.handleAuth(ws, msg.token as string);
      case 'join':     ws.channels.add(msg.channelId as string); break;
      case 'message':  return this.handleChat(ws, msg);
      case 'typing':   return this.handleTyping(ws, msg);
      case 'presence': return this.handlePresence(ws, msg);
      case 'ping':     ws.send(JSON.stringify({ type: 'pong' })); break;
    }
  }

  /** Authenticate the WS connection using the app's JWT */
  private handleAuth(ws: AuthedSocket, token: string): void {
    const payload = verifyToken(token);
    if (!payload) { ws.close(4001, 'Unauthorized'); return; }
    ws.userId = payload.userId;
    this.clients.set(payload.userId, ws);
    updatePresence(payload.userId, { is_online: true }).catch(() => {});
    ws.send(JSON.stringify({ type: 'auth_ok', userId: payload.userId }));
  }

  /** Save message to DB, publish to Redis for all WS instances to broadcast */
  private async handleChat(ws: AuthedSocket, msg: Record<string, unknown>): Promise<void> {
    if (!ws.userId) { ws.close(4001, 'Unauthorized'); return; }
    try {
      const saved = await saveMessage({
        channelId: msg.channelId as string,
        senderId: ws.userId,
        content: msg.content as string,
        type: 'text',
      });
      redisPublisher.publish('ws:chat', JSON.stringify({ channelId: msg.channelId, message: saved }));
    } catch (err) { logger.error({ err }, 'Failed to save WS message'); }
  }

  private handleTyping(ws: AuthedSocket, msg: Record<string, unknown>): void {
    if (!ws.userId) return;
    redisPublisher.publish('ws:typing', JSON.stringify({ userId: ws.userId, channelId: msg.channelId, isTyping: msg.isTyping }));
  }

  private handlePresence(ws: AuthedSocket, msg: Record<string, unknown>): void {
    if (!ws.userId) return;
    const status = msg.status as string;
    const presence: Record<string, boolean> = {
      is_online: status === 'online',
      is_on_call: status === 'oncall',
      available_call: status === 'online',
    };
    updatePresence(ws.userId, presence).catch(() => {});
    redisPublisher.publish('ws:presence', JSON.stringify({ userId: ws.userId, status }));
  }

  /** Redis subscriber: receives chat/typing/presence/notification events from any API instance */
  private setupRedisSubscriber(): void {
    redisSubscriber.subscribe('ws:chat', 'ws:typing', 'ws:presence', 'ws:notification').catch(logger.error);
    redisSubscriber.on('message', async (channel, payload) => {
      const data = JSON.parse(payload);
      if (channel === 'ws:chat') {
        const memberIds = await getChannelMemberIds(data.channelId);
        memberIds.forEach(uid => this.sendToUser(uid, { type: 'new_message', message: data.message }));
      } else if (channel === 'ws:typing') {
        const memberIds = await getChannelMemberIds(data.channelId);
        memberIds.forEach(uid => { if (uid !== data.userId) this.sendToUser(uid, { type: 'typing', ...data }); });
      } else if (channel === 'ws:presence') {
        this.broadcast({ type: 'presence', ...data });
      } else if (channel === 'ws:notification') {
        this.sendToUser(data.userId, { type: 'notification', ...data });
      }
    });
  }

  /** Ping all clients every 30s; terminate those that miss 2 consecutive pings */
  private startHeartbeat(): void {
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const aws = ws as AuthedSocket;
        if (!aws.isAlive) { aws.terminate(); return; }
        aws.isAlive = false;
        aws.ping();
      });
    }, 30_000);
  }

  private handleDisconnect(ws: AuthedSocket): void {
    if (!ws.userId) return;
    this.clients.delete(ws.userId);
    updatePresence(ws.userId, { is_online: false }).catch(() => {});
    redisPublisher.publish('ws:presence', JSON.stringify({ userId: ws.userId, status: 'offline' }));
  }

  /** Send a message to a specific connected user */
  public sendToUser(userId: string, data: object): void {
    const client = this.clients.get(userId);
    if (client?.readyState === WebSocket.OPEN) client.send(JSON.stringify(data));
  }

  /** Broadcast to all connected clients */
  public broadcast(data: object): void {
    const msg = JSON.stringify(data);
    this.wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(msg); });
  }
}
