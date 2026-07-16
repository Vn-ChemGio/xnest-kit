import Keyv from 'keyv';
import { createMemoryStore } from './memory';

describe('createMemoryStore', () => {
  it('should create a memory store with default namespace', () => {
    const result = createMemoryStore();
    expect(result.provider).toBe('memory');
    expect(result.namespace).toBe('memory');
    expect(result.store).toBeInstanceOf(Keyv);
  });

  it('should create a memory store with custom namespace', () => {
    const result = createMemoryStore('sessions');
    expect(result.provider).toBe('memory');
    expect(result.namespace).toBe('sessions');
  });

  it('should create a memory store with ttl', () => {
    const result = createMemoryStore('cache', 60_000);
    expect(result.provider).toBe('memory');
    expect(result.namespace).toBe('cache');
    expect(result.store).toBeInstanceOf(Keyv);
  });

  it('should support set/get operations', async () => {
    const { store } = createMemoryStore('test');
    await store.set('foo', 'bar');
    const value = await store.get<string>('foo');
    expect(value).toBe('bar');
  });
});
