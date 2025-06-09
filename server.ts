import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

// Add this to handle module paths
import * as tsConfigPaths from 'tsconfig-paths';

// This will read the paths from tsconfig.json and register them
const tsConfig = require('./tsconfig.json');
const baseUrl = path.resolve(__dirname, '.');

// Register path aliases
tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
  
    app.enableCors();
    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
      .setTitle('Bill Vending API')
      .setDescription('API for wallet funding and bill payment')
      .setVersion('1.0')
      .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = configService.get<number>('PORT') || 3001;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`API Documentation: http://localhost:${port}/api/docs`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();