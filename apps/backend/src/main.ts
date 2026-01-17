import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger Configuration
  // ⚠️ GANTI NAMA_LENGKAP dan NIM dengan data Anda
  const config = new DocumentBuilder()
    .setTitle('Avalanche Simple Storage API')
    .setDescription(
      `Backend API untuk membaca data dari Smart Contract SimpleStorage di Avalanche Fuji Testnet.
      
**Peserta:**
- **NAMA LENGKAP:** TIRTA ADHI SAMSARA
- **NIM:** 221011402154

**Fitur:**
- Read contract value
- Fetch ValueUpdated events dengan pagination
- Error handling untuk RPC failures`,
    )
    .setVersion('1.0')
    .addTag('blockchain', 'Endpoints untuk interaksi dengan blockchain')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Avalanche Backend API',
    customCss: `
      /* Hide topbar */
      .swagger-ui .topbar { display: none; }
      
      /* Main container styling */
      .swagger-ui {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      
      /* Info section - make it stand out */
      .swagger-ui .info {
        margin: 30px 0;
        padding: 25px;
        background-color: #1e293b;
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
      }
      
      .swagger-ui .info .title {
        color: #3b82f6;
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 15px;
      }
      
      .swagger-ui .info .description {
        color: #e2e8f0;
        line-height: 1.6;
        font-size: 15px;
      }
      
      .swagger-ui .info .description strong {
        color: #60a5fa;
        font-weight: 600;
      }
      
      /* Endpoint sections */
      .swagger-ui .opblock-tag {
        background-color: #0f172a;
        border: 1px solid #334155;
        border-radius: 6px;
        margin: 15px 0;
        padding: 15px;
      }
      
      .swagger-ui .opblock-tag .opblock-tag-section {
        color: #f1f5f9;
      }
      
      .swagger-ui .opblock-tag .opblock-tag-no-desc {
        color: #cbd5e1;
        font-size: 16px;
        font-weight: 600;
      }
      
      /* Operation blocks */
      .swagger-ui .opblock {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 6px;
        margin: 10px 0;
      }
      
      .swagger-ui .opblock.opblock-get {
        border-left: 4px solid #10b981;
      }
      
      .swagger-ui .opblock.opblock-get .opblock-summary {
        background-color: #064e3b;
      }
      
      .swagger-ui .opblock.opblock-get .opblock-summary-method {
        background-color: #10b981;
        color: #ffffff;
        font-weight: 700;
      }
      
      /* Response sections */
      .swagger-ui .response-col_status {
        color: #10b981;
        font-weight: 600;
      }
      
      .swagger-ui .response-col_description {
        color: #cbd5e1;
      }
      
      /* Try it out button */
      .swagger-ui .btn.execute {
        background-color: #3b82f6;
        border-color: #3b82f6;
        color: #ffffff;
        font-weight: 600;
      }
      
      .swagger-ui .btn.execute:hover {
        background-color: #2563eb;
        border-color: #2563eb;
      }
      
      /* Code blocks */
      .swagger-ui .highlight-code {
        background-color: #0f172a;
        border: 1px solid #334155;
        border-radius: 4px;
      }
      
      /* Schema sections */
      .swagger-ui .model-box {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 4px;
      }
      
      /* Text colors */
      .swagger-ui .prop-name {
        color: #60a5fa;
      }
      
      .swagger-ui .prop-type {
        color: #fbbf24;
      }
      
      /* Overall background */
      .swagger-ui .wrapper {
        background-color: #0f172a;
        color: #e2e8f0;
      }
      
      /* Headers */
      .swagger-ui h1, .swagger-ui h2, .swagger-ui h3, .swagger-ui h4 {
        color: #f1f5f9;
      }
      
      /* Links */
      .swagger-ui a {
        color: #60a5fa;
      }
      
      .swagger-ui a:hover {
        color: #3b82f6;
      }
    `,
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `🚀 Backend API is running on: http://localhost:${process.env.PORT ?? 3001}`,
  );
  console.log(
    `📚 Swagger UI available at: http://localhost:${process.env.PORT ?? 3001}/api`,
  );
}
bootstrap();
