import { TypeOrmNotificationStore } from './typeorm-notification.store';
import type { Repository } from 'typeorm';
import type { NotificationLogEntity } from './notification-log.entity';
import type { ChannelType, ChannelResult } from '../notification.type';

const mockCreate = jest.fn();
const mockSave = jest.fn();
const mockFindOneBy = jest.fn();
const mockUpdate = jest.fn();
const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockRepo = {
  create: mockCreate,
  save: mockSave,
  findOneBy: mockFindOneBy,
  update: mockUpdate,
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
} as unknown as Repository<NotificationLogEntity>;

describe('TypeOrmNotificationStore', () => {
  let store: TypeOrmNotificationStore;

  beforeEach(() => {
    jest.clearAllMocks();
    store = new TypeOrmNotificationStore(mockRepo);
  });

  describe('save', () => {
    it('should save a notification record', async () => {
      const inputRecord = {
        channels: ['email'] as ChannelType[],
        status: 'sent' as const,
        results: [{ channel: 'email', results: [] }] as ChannelResult[],
        input: {
          email: { to: 'test@test.com', subject: 'Hi', body: 'Hello' },
        },
      };

      const savedEntity = {
        id: 'uuid-1',
        channels: ['email'],
        status: 'sent',
        results: JSON.stringify(inputRecord.results),
        input: JSON.stringify(inputRecord.input),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreate.mockReturnValue(savedEntity);
      mockSave.mockResolvedValue(savedEntity);

      const result = await store.save(inputRecord);

      expect(mockCreate).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(result.id).toBe('uuid-1');
      expect(result.channels).toEqual(['email']);
      expect(result.status).toBe('sent');
    });

    it('should serialize results and input as JSON', async () => {
      const inputRecord = {
        channels: ['sms'] as ChannelType[],
        status: 'pending' as const,
        results: [{ channel: 'sms', results: [] }] as ChannelResult[],
        input: { sms: { to: '+123', body: 'Hi' } },
      };

      const savedEntity = {
        id: 'uuid-2',
        channels: ['sms'],
        status: 'pending',
        results: JSON.stringify(inputRecord.results),
        input: JSON.stringify(inputRecord.input),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCreate.mockReturnValue(savedEntity);
      mockSave.mockResolvedValue(savedEntity);

      await store.save(inputRecord);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          results: JSON.stringify(inputRecord.results),
          input: JSON.stringify(inputRecord.input),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a record when found', async () => {
      const entity = {
        id: 'uuid-1',
        channels: ['email'],
        status: 'sent',
        results: JSON.stringify([{ channel: 'email', results: [] }]),
        input: JSON.stringify({ email: { to: 'test@test.com' } }),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockFindOneBy.mockResolvedValue(entity);

      const result = await store.findById('uuid-1');

      expect(result).not.toBeNull();
      expect(result.id).toBe('uuid-1');
      expect(result.channels).toEqual(['email']);
      expect(result.results).toEqual([{ channel: 'email', results: [] }]);
    });

    it('should return null when not found', async () => {
      mockFindOneBy.mockResolvedValue(null);

      const result = await store.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByChannel', () => {
    it('should find records by channel', async () => {
      const entities = [
        {
          id: 'uuid-1',
          channels: ['email'],
          status: 'sent',
          results: '[]',
          input: '{}',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      const result = await store.findByChannel('email', 10);

      expect(result).toHaveLength(1);
      expect(result[0].channels).toEqual(['email']);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'n.channels LIKE :channel',
        { channel: '%email%' },
      );
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should use default limit of 20', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await store.findByChannel('sms');

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a record', async () => {
      mockUpdate.mockResolvedValue(undefined);

      await store.updateStatus('uuid-1', 'sent');

      expect(mockUpdate).toHaveBeenCalledWith('uuid-1', { status: 'sent' });
    });

    it('should update to failed status', async () => {
      mockUpdate.mockResolvedValue(undefined);

      await store.updateStatus('uuid-2', 'failed');

      expect(mockUpdate).toHaveBeenCalledWith('uuid-2', { status: 'failed' });
    });
  });
});
