import { ValidationPipe, Logger } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';



declare const module: any

const logger = new Logger('Bootstrap')

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({ origin: '*' });

    // Configurar arquivos estáticos
    const uploadsPath = join(__dirname, '..', 'uploads');
    logger.log(`Servindo arquivos estáticos de: ${uploadsPath}`);

    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });

    // Configurar validação global
    app.useGlobalPipes(new ValidationPipe());

    // Configurar Swagger
    const config = new DocumentBuilder()
        .setTitle("Mundi")
        .setDescription("mundi api")
        .setVersion("1.0")
        .addTag("scheduling")
        .addTag("entrepreneur")
        .addTag("user")
        .addTag("avaliation")
        .addTag("geolocation")
        .addTag("work")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);

    await app.listen(3000);

    logger.log('API rodando em http://localhost:3000');

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();
