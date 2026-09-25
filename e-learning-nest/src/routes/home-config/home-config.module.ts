import { Module } from "@nestjs/common";
import { HomeConfigController } from "./home-config.controller";
import { HomeConfigService } from "./home-config.service";

@Module({ controllers: [HomeConfigController], providers: [HomeConfigService] })
export class HomeConfigModule {}
