import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { XId, XIncrementId } from './identity';
import { XCreatedAt, XUpdatedAt, XDeletedAt, XVersion } from './timestamps';
import {
  XUuid,
  XEmail,
  XPhone,
  XUrl,
  XIp,
  XJson,
  XMoney,
  XBoolean,
  XEnum,
} from './common';

type Constructor = new (...args: unknown[]) => unknown;

function getColumns(target: Constructor) {
  const storage = getMetadataArgsStorage();
  return storage.columns.filter(
    (c) => typeof c.target === 'function' && c.target === target,
  );
}

function findColumn(target: Constructor, propertyName: string) {
  return getColumns(target).find((c) => c.propertyName === propertyName);
}

function getModes(target: Constructor) {
  return getColumns(target).reduce(
    (acc, c) => {
      acc[c.propertyName] = c.mode;
      return acc;
    },
    {} as Record<string, string | undefined>,
  );
}

describe('Identity columns', () => {
  describe('XId', () => {
    class TestXId {
      @XId()
      id!: string;
    }

    it('should register id column', () => {
      expect(findColumn(TestXId, 'id')).toBeDefined();
    });
  });

  describe('XIncrementId', () => {
    class TestXIncrementId {
      @XIncrementId()
      id!: number;
    }

    it('should register id column', () => {
      expect(findColumn(TestXIncrementId, 'id')).toBeDefined();
    });
  });
});

describe('Timestamp columns', () => {
  describe('XCreatedAt', () => {
    class TestXCreatedAt {
      @XCreatedAt()
      createdAt!: Date;
    }

    it('should register createdAt column with createDate mode', () => {
      expect(getModes(TestXCreatedAt).createdAt).toBe('createDate');
    });
  });

  describe('XUpdatedAt', () => {
    class TestXUpdatedAt {
      @XUpdatedAt()
      updatedAt!: Date;
    }

    it('should register updatedAt column with updateDate mode', () => {
      expect(getModes(TestXUpdatedAt).updatedAt).toBe('updateDate');
    });
  });

  describe('XDeletedAt', () => {
    class TestXDeletedAt {
      @XDeletedAt()
      deletedAt!: Date | null;
    }

    it('should register deletedAt column with deleteDate mode', () => {
      expect(getModes(TestXDeletedAt).deletedAt).toBe('deleteDate');
    });
  });

  describe('XVersion', () => {
    class TestXVersion {
      @XVersion()
      version!: number;
    }

    it('should register version column with version mode', () => {
      expect(getModes(TestXVersion).version).toBe('version');
    });
  });
});

describe('Common columns', () => {
  class AllCommonColumns {
    @XUuid()
    trackingId!: string;

    @XEmail()
    email!: string;

    @XPhone()
    phone!: string;

    @XUrl()
    website!: string;

    @XIp()
    ipAddress!: string;

    @XJson()
    metadata!: Record<string, unknown>;

    @XMoney()
    price!: number;

    @XMoney(12, 4)
    preciseAmount!: number;

    @XBoolean()
    isActive!: boolean;

    @XEnum(['admin', 'user', 'guest'])
    role!: string;
  }

  it('should register all columns', () => {
    const columns = getColumns(AllCommonColumns);
    expect(columns.length).toBe(10);
  });

  it('should register XUuid', () => {
    expect(findColumn(AllCommonColumns, 'trackingId')).toBeDefined();
  });

  it('should register XEmail', () => {
    expect(findColumn(AllCommonColumns, 'email')).toBeDefined();
  });

  it('should register XPhone', () => {
    expect(findColumn(AllCommonColumns, 'phone')).toBeDefined();
  });

  it('should register XUrl', () => {
    expect(findColumn(AllCommonColumns, 'website')).toBeDefined();
  });

  it('should register XIp', () => {
    expect(findColumn(AllCommonColumns, 'ipAddress')).toBeDefined();
  });

  it('should register XJson', () => {
    expect(findColumn(AllCommonColumns, 'metadata')).toBeDefined();
  });

  it('should register XMoney', () => {
    expect(findColumn(AllCommonColumns, 'price')).toBeDefined();
    expect(findColumn(AllCommonColumns, 'preciseAmount')).toBeDefined();
  });

  it('should register XBoolean', () => {
    expect(findColumn(AllCommonColumns, 'isActive')).toBeDefined();
  });

  it('should register XEnum', () => {
    expect(findColumn(AllCommonColumns, 'role')).toBeDefined();
  });

  it('all should have regular mode', () => {
    const modes = getModes(AllCommonColumns);
    for (const col of [
      'trackingId',
      'email',
      'phone',
      'website',
      'ipAddress',
      'metadata',
      'price',
      'preciseAmount',
      'isActive',
      'role',
    ]) {
      expect(modes[col]).toBe('regular');
    }
  });
});

describe('ColumnOptions', () => {
  describe('nullable', () => {
    class TestNullable {
      @XPhone({ nullable: true })
      phone!: string;

      @XUrl({ nullable: true })
      website!: string;

      @XIp({ nullable: true })
      ipAddress!: string;

      @XJson({ nullable: true })
      metadata!: Record<string, unknown>;

      @XBoolean({ nullable: true })
      isActive!: boolean;
    }

    it('should register all nullable columns', () => {
      const columns = getColumns(TestNullable);
      expect(columns.length).toBe(5);
    });

    it('should register phone', () => {
      expect(findColumn(TestNullable, 'phone')).toBeDefined();
    });

    it('should register website', () => {
      expect(findColumn(TestNullable, 'website')).toBeDefined();
    });

    it('should register ipAddress', () => {
      expect(findColumn(TestNullable, 'ipAddress')).toBeDefined();
    });

    it('should register metadata', () => {
      expect(findColumn(TestNullable, 'metadata')).toBeDefined();
    });

    it('should register isActive', () => {
      expect(findColumn(TestNullable, 'isActive')).toBeDefined();
    });
  });

  describe('default', () => {
    class TestDefault {
      @XBoolean({ default: 'true' })
      isActive!: boolean;

      @XEnum(['a', 'b'], { default: 'a' })
      type!: string;

      @XEmail({ default: 'none@example.com' })
      email!: string;
    }

    it('should register all columns with defaults', () => {
      const columns = getColumns(TestDefault);
      expect(columns.length).toBe(3);
    });

    it('should register isActive', () => {
      expect(findColumn(TestDefault, 'isActive')).toBeDefined();
    });

    it('should register type', () => {
      expect(findColumn(TestDefault, 'type')).toBeDefined();
    });

    it('should register email', () => {
      expect(findColumn(TestDefault, 'email')).toBeDefined();
    });
  });

  describe('nullable + default combined', () => {
    class TestCombined {
      @XPhone({ nullable: true, default: '+1234567890' })
      phone!: string;

      @XEnum(['on', 'off'], { nullable: true, default: 'on' })
      switch!: string;
    }

    it('should register both columns', () => {
      const columns = getColumns(TestCombined);
      expect(columns.length).toBe(2);
    });

    it('should register phone', () => {
      expect(findColumn(TestCombined, 'phone')).toBeDefined();
    });

    it('should register switch', () => {
      expect(findColumn(TestCombined, 'switch')).toBeDefined();
    });
  });
});
