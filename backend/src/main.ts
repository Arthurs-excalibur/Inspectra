import "reflect-metadata";
import "module-alias/register";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const frontendOrigin = config.get<string>("FRONTEND_ORIGIN") ?? "http://localhost:3000";

  app.enableCors({
    origin: frontendOrigin.split(",").map((origin) => origin.trim()),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = config.get<number>("PORT") ?? 4000;
  await app.listen(port);
}

void bootstrap();
