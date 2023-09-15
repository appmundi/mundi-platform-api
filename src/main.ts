import { ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"

declare const module: any

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.useGlobalPipes(new ValidationPipe())

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
        .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("api", app, document)

    await app.listen(3000)

    if (module.hot) {
        module.hot.accept()
        module.hot.dispose(() => app.close())
    }
}
bootstrap()
