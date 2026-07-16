# Examples

## Swagger

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configSwagger } from 'xnest-kit/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configSwagger(app, {
    title: 'My API',
    description: 'API documentation',
    version: '1.0.0',
    provider: 'swagger',
  });

  await app.listen(3000);
}
bootstrap();
```

## Cache

```typescript
import { CacheModule } from 'xnest-kit/cache';

@Module({
  imports: [
    CacheModule.register({
      store: 'redis',
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ttl: 60,
    }),
  ],
})
export class AppModule {}
```

## Excel

```typescript
import { Controller, Post, UploadedFile } from '@nestjs/common';
import { parseExcel, ExcelUpload } from 'xnest-kit/excel';

@Controller('import')
export class ImportController {
  @Post('users')
  async importUsers(
    @ExcelUpload({ allowedExtensions: ['.xlsx', '.xls'] })
    file: Express.Multer.File,
  ) {
    const data = await parseExcel(file.buffer, {
      sheetName: 'Users',
      headerRow: 1,
    });
    return { imported: data.length };
  }
}
```

## TypeORM

```typescript
import { XEntity, XColumn } from 'xnest-kit/typeorm';

@Entity('users')
export class User {
  @XColumn({ primary: true, generated: true })
  id: number;

  @XColumn()
  name: string;

  @XColumn({ unique: true })
  email: string;
}
```
