import { ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { join } from 'path';
import * as express from 'express';


declare const module: any


async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Configurar arquivos estáticos
    const uploadsPath = join(__dirname, '..', 'uploads');
    console.log('Servindo arquivos estáticos de:', uploadsPath);

    // Use Express para arquivos estáticos se necessário
    app.use('/uploads', express.static(uploadsPath));

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



