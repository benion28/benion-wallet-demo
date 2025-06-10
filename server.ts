import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './src/common/filters/http-exception.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Global prefix
    app.setGlobalPrefix('api');

    // Enable CORS
    app.enableCors({
      origin: configService.get('CORS_ORIGIN', '*'),
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Wallet API')
      .setDescription('Wallet API documentation')
      .setVersion('1.0')
      .addBearerAuth(
        { 
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    // Start server
    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port);
    
    console.log(`🚀 NestJS Server running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    
    return app;
  } catch (err) {
    console.error('❌ Failed to start NestJS server:', err);
    process.exit(1);
  }
}

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  bootstrap().catch(err => {
    console.error('❌ Error during bootstrap:', err);
    process.exit(1);
  });
}

// Export the bootstrap function for testing
export { bootstrap };