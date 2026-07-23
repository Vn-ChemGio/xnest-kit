import { isPackageInstalled } from '../../utils';

if (!isPackageInstalled('typeorm') || !isPackageInstalled('@nestjs/typeorm')) {
  throw new Error(
    'xnest-kit/notification/typeorm requires typeorm and @nestjs/typeorm to be installed',
  );
}

export { NotificationLogEntity } from './notification-log.entity';
export { TypeOrmNotificationStore } from './typeorm-notification.store';
export { TransactionInterceptor } from './transaction.interceptor';
