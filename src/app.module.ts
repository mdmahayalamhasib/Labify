import { Module } from "@nestjs/common";
import { TaskModule } from "./modules/task/task.module";
import { ConfigModule } from "@nestjs/config";
import { PostgresDatabaseProviderModule } from "@/providers/database/postgres/provider.module";
import { AppController } from "@/src/app.controller";
import { AppService } from "@/src/app.service";
import global_config from "@/config/global_config";
import { BullModule } from "@nestjs/bull";
import { ProjectModule } from "@/modules/project/project.module";
import { MilestoneModule } from "./modules/milestone/milestone.module";
import { CreditLedgerModule } from "./modules/credit-ledger/credit-ledger.module";
import { EquipmentModule } from "./modules/equipment/equipment.module";
import { EquipmentRuleModule } from "./modules/equipment-rule/equipment-rule.module";
import { MaintenanceTicketModule } from "./modules/maintenance-ticket/maintenance-ticket.module";
import { BookingModule } from "./modules/booking/booking.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { labModule } from "@/modules/labs/labs.module";

@Module({
  imports: [
    PostgresDatabaseProviderModule,
    ProjectModule,
    MilestoneModule,
    TaskModule,
    CreditLedgerModule,
    EquipmentModule,
    EquipmentRuleModule,
    MaintenanceTicketModule,
    BookingModule,
    AuthModule,

    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),

    BullModule.forRoot({
      url: process.env.REDIS_URL,
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [global_config],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
