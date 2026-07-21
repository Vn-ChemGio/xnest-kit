import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { XEntity } from './entity';

type Constructor = new (...args: any[]) => unknown;

function getTableMetadata(target: Constructor) {
  const storage = getMetadataArgsStorage();
  return storage.tables.find((t) => t.target === target);
}

function getColumnMetadata(target: Constructor) {
  const storage = getMetadataArgsStorage();
  return storage.columns.filter(
    (c) => typeof c.target === 'function' && c.target === target,
  );
}

function hasColumn(target: Constructor, propertyName: string) {
  return getColumnMetadata(target).some((c) => c.propertyName === propertyName);
}

function getColumnMode(
  target: Constructor,
  propertyName: string,
): string | undefined {
  const col = getColumnMetadata(target).find(
    (c) => c.propertyName === propertyName,
  );
  return col?.mode;
}

describe('XEntity', () => {
  describe('with table name', () => {
    @XEntity('users')
    class User {}

    it('should register entity', () => {
      expect(getTableMetadata(User)).toBeDefined();
    });

    it('should set table name', () => {
      expect(getTableMetadata(User)?.name).toBe('users');
    });
  });

  describe('with options only', () => {
    @XEntity({ name: 'accounts' })
    class Account {}

    it('should set table name from options', () => {
      expect(getTableMetadata(Account)?.name).toBe('accounts');
    });
  });

  describe('with table name and options', () => {
    @XEntity('products', { name: 'catalog_products' })
    class Product {}

    it('should set table name', () => {
      expect(getTableMetadata(Product)?.name).toBe('products');
    });
  });

  describe('soft delete', () => {
    @XEntity('soft')
    class WithSoftDelete {}

    @XEntity('no_soft', { softDelete: false })
    class WithoutSoftDelete {}

    it('should have deletedAt column when softDelete is true', () => {
      expect(hasColumn(WithSoftDelete, 'deletedAt')).toBe(true);
    });

    it('should set deletedAt mode to deleteDate', () => {
      expect(getColumnMode(WithSoftDelete, 'deletedAt')).toBe('deleteDate');
    });

    it('should not have deletedAt column when softDelete is false', () => {
      expect(hasColumn(WithoutSoftDelete, 'deletedAt')).toBe(false);
    });
  });

  describe('timestamps', () => {
    @XEntity('with_ts')
    class WithTimestamps {}

    @XEntity('no_ts', { timestamps: false })
    class WithoutTimestamps {}

    it('should have createdAt column', () => {
      expect(hasColumn(WithTimestamps, 'createdAt')).toBe(true);
    });

    it('should set createdAt mode to createDate', () => {
      expect(getColumnMode(WithTimestamps, 'createdAt')).toBe('createDate');
    });

    it('should have updatedAt column', () => {
      expect(hasColumn(WithTimestamps, 'updatedAt')).toBe(true);
    });

    it('should set updatedAt mode to updateDate', () => {
      expect(getColumnMode(WithTimestamps, 'updatedAt')).toBe('updateDate');
    });

    it('should not have createdAt when timestamps is false', () => {
      expect(hasColumn(WithoutTimestamps, 'createdAt')).toBe(false);
    });

    it('should not have updatedAt when timestamps is false', () => {
      expect(hasColumn(WithoutTimestamps, 'updatedAt')).toBe(false);
    });
  });

  describe('both disabled', () => {
    @XEntity('config', { softDelete: false, timestamps: false })
    class Config {}

    it('should not have any auto columns', () => {
      expect(hasColumn(Config, 'createdAt')).toBe(false);
      expect(hasColumn(Config, 'updatedAt')).toBe(false);
      expect(hasColumn(Config, 'deletedAt')).toBe(false);
    });
  });

  describe('defaults', () => {
    @XEntity('default_entity')
    class DefaultEntity {}

    it('should have all auto columns by default', () => {
      expect(hasColumn(DefaultEntity, 'createdAt')).toBe(true);
      expect(hasColumn(DefaultEntity, 'updatedAt')).toBe(true);
      expect(hasColumn(DefaultEntity, 'deletedAt')).toBe(true);
    });
  });
});
