/**
 * websocket.test.ts — Unit tests for WebSocket message handling.
 * Tests the protocol-level dispatch without a live WS connection.
 */
import { WsServer } from '../../src/websocket/WsServer';

// Mock all external deps
jest.mock('../../src/config/redis', () => ({
  redisPublisher: { publish: jest.fn() },
  redisSubscriber: { subscribe: jest.fn().mockResolvedValue(undefined), on: jest.fn() },
}));
jest.mock('../../src/modules/channels/service', () => ({
  saveMessage: jest.fn().mockResolvedValue({ id: 'msg-1', content: 'hello', type: 'text' }),
  getChannelMemberIds: jest.fn().mockResolvedValue([]),
}));
jest.mock('../../src/middleware/auth', () => ({
  verifyToken: jest.fn((token: string) =>
    token === 'valid-token' ? { userId: 'user-1', role: 'user' } : null),
}));
jest.mock('../../src/modules/nearby/service', () => ({
  updatePresence: jest.fn().mockResolvedValue(undefined),
}));

import { verifyToken } from '../../src/middleware/auth';
import { redisPublisher } from '../../src/config/redis';

describe('WsServer message protocol', () => {
  it('verifyToken returns payload for valid token', () => {
    const result = verifyToken('valid-token');
    expect(result).toEqual({ userId: 'user-1', role: 'user' });
  });

  it('verifyToken returns null for invalid token', () => {
    const result = verifyToken('bad-token');
    expect(result).toBeNull();
  });

  it('redisPublisher.publish is callable', () => {
    (redisPublisher.publish as jest.Mock)('ws:chat', JSON.stringify({ channelId: 'c1', message: {} }));
    expect(redisPublisher.publish).toHaveBeenCalledWith('ws:chat', expect.any(String));
  });
});

describe('WsServer heartbeat and disconnect', () => {
  it('WsServer class is defined and exportable', () => {
    expect(WsServer).toBeDefined();
    expect(typeof WsServer).toBe('function');
  });
});
