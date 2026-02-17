import { ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';



declare const module: any


async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bodyParser: false // Desabilita o bodyParser padrão para configurarmos manualmente
    });

    // Configurar limite de tamanho do body para 50MB (para uploads de imagens)
    // IMPORTANTE: A ordem importa! Deve vir antes de qualquer rota
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    // Para multipart/form-data, o limite é configurado no Multer interceptor
    console.log('✅ Limite de upload configurado: 50MB');

    // Configurar arquivos estáticos
    const uploadsPath = join(__dirname, '..', 'uploads');
    console.log('Servindo arquivos estáticos de:', uploadsPath);

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

    console.log("Rodando já em localhost amigão > http://localhost:3000");

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();



