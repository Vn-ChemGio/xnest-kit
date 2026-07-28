import { NotificationLogEntity } from './notification-log.entity';

describe('NotificationLogEntity', () => {
  it('should create an entity instance', () => {
    const entity = new NotificationLogEntity();
    expect(entity).toBeDefined();
  });

  it('should have correct column metadata', () => {
    const entity = new NotificationLogEntity();
    entity.id = 'test-id';
    entity.channels = ['email', 'sms'];
    entity.status = 'sent';
    entity.results = '[]';
    entity.input = '{}';
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    expect(entity.id).toBe('test-id');
    expect(entity.channels).toEqual(['email', 'sms']);
    expect(entity.status).toBe('sent');
    expect(entity.results).toBe('[]');
    expect(entity.input).toBe('{}');
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow setting all properties', () => {
    const entity = new NotificationLogEntity();
    entity.id = 'test-id';
    entity.channels = ['email', 'sms'];
    entity.status = 'pending';
    entity.results = '[]';
    entity.input = '{}';
    entity.createdAt = new Date('2024-01-01');
    entity.updatedAt = new Date('2024-01-02');

    expect(entity.id).toBe('test-id');
    expect(entity.channels).toEqual(['email', 'sms']);
    expect(entity.status).toBe('pending');
    expect(entity.results).toBe('[]');
    expect(entity.input).toBe('{}');
    expect(entity.createdAt).toEqual(new Date('2024-01-01'));
    expect(entity.updatedAt).toEqual(new Date('2024-01-02'));
  });
});
