import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { SharedModule } from "src/shared/shared.module";

@Module({
  imports: [SharedModule],
  controllers: [HealthController],
})
export class HealthModule {}
