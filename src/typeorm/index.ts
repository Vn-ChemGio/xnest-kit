import { isPackageInstalled } from '../utils';

if (!isPackageInstalled('typeorm') || !isPackageInstalled('@nestjs/typeorm')) {
  throw new Error(
    'xnest-kit/typeorm requires typeorm and @nestjs/typeorm to be installed',
  );
}

export { configTypeOrm } from './config/config-typeorm';
export { TypeOrmModule } from './typeorm.module';
export {
  XEntity,
  HalfIndex,
  XId,
  XIncrementId,
  XCreatedAt,
  XUpdatedAt,
  XDeletedAt,
  XVersion,
  XUuid,
  XEmail,
  XPhone,
  XUrl,
  XIp,
  XJson,
  XMoney,
  XBoolean,
  XEnum,
} from './decorators';
export type {
  XEntityOptions,
  HalfIndexOptions,
  ColumnOptions,
} from './decorators';
