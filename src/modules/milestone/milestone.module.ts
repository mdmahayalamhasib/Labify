import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Milestone } from "./entities/milestone.entity";
import { Project } from "../project/entities/project.entity";

import { MilestoneController } from "./milestone.controller";
import { MilestoneService } from "./milestone.service";

@Module({
  imports: [TypeOrmModule.forFeature([Milestone, Project])],
  controllers: [MilestoneController],
  providers: [MilestoneService],
  exports: [MilestoneService],
})
export class MilestoneModule {}