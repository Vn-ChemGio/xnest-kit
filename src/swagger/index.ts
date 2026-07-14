/* eslint-disable @typescript-eslint/no-require-imports */

import { isPackageInstalled } from '../utils';

if (!isPackageInstalled('@nestjs/swagger')) {
  throw new Error('xnest-kit/swagger requires @nestjs/swagger to be installed');
}

// @nestjs/swagger is guaranteed — safe to load config
const config = require('./config') as typeof import('./config');

export const { configSwagger } = config;

export * from './decorators';
