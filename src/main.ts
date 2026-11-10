import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/index.js';
import morgan from 'morgan';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });
  app.setGlobalPrefix('/api');
  app.useBodyParser('json', { limit: '20mb' });
  app.use(morgan(':date[iso] :method :url :status :response-time ms'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT!);
}
await bootstrap();
