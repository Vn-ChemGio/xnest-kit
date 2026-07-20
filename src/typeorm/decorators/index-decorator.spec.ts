import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { HalfIndex } from './index-decorator';

type Constructor = new (...args: any[]) => unknown;

function getIndexMetadata(target: Constructor) {
  const storage = getMetadataArgsStorage();
  return storage.indices.filter(
    (i) => typeof i.target === 'function' && i.target === target,
  );
}

describe('HalfIndex', () => {
  describe('on columns', () => {
    @HalfIndex({ columns: ['email'] })
    class UserEmail {}

    it('should register index', () => {
      const indices = getIndexMetadata(UserEmail);
      expect(indices.length).toBeGreaterThan(0);
    });

    it('should set where clause to deleted_at IS NULL', () => {
      const indices = getIndexMetadata(UserEmail);
      expect(indices.some((i) => i.where === 'deleted_at IS NULL')).toBe(true);
    });
  });

  describe('with name', () => {
    @HalfIndex('idx_custom_email', { columns: ['email'] })
    class UserNamed {}

    it('should register index with name', () => {
      const indices = getIndexMetadata(UserNamed);
      expect(indices.some((i) => i.name === 'idx_custom_email')).toBe(true);
    });

    it('should set where clause', () => {
      const indices = getIndexMetadata(UserNamed);
      expect(indices.some((i) => i.where === 'deleted_at IS NULL')).toBe(true);
    });
  });

  describe('with unique', () => {
    @HalfIndex({ columns: ['email'], unique: true })
    class UniqueEmail {}

    it('should set unique', () => {
      const indices = getIndexMetadata(UniqueEmail);
      expect(indices.some((i) => i.unique === true)).toBe(true);
    });

    it('should set where clause', () => {
      const indices = getIndexMetadata(UniqueEmail);
      expect(indices.some((i) => i.where === 'deleted_at IS NULL')).toBe(true);
    });
  });

  describe('with string name only', () => {
    @HalfIndex('idx_status')
    class StatusEntity {}

    it('should register index with name', () => {
      const indices = getIndexMetadata(StatusEntity);
      expect(indices.some((i) => i.name === 'idx_status')).toBe(true);
    });

    it('should set where clause', () => {
      const indices = getIndexMetadata(StatusEntity);
      expect(indices.some((i) => i.where === 'deleted_at IS NULL')).toBe(true);
    });
  });

  describe('multiple indices', () => {
    @HalfIndex({ columns: ['email'] })
    @HalfIndex('idx_status', { columns: ['status'] })
    class MultiIndex {}

    it('should register multiple indices', () => {
      const indices = getIndexMetadata(MultiIndex);
      expect(indices.length).toBe(2);
    });

    it('all should have where clause', () => {
      const indices = getIndexMetadata(MultiIndex);
      expect(indices.every((i) => i.where === 'deleted_at IS NULL')).toBe(true);
    });
  });
});
