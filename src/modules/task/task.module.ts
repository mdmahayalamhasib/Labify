import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Task } from "./entities/task.entity";
import { Project } from "../project/entities/project.entity";
import { Milestone } from "../milestone/entities/milestone.entity";

import { TaskService } from "./task.service";
import { TaskController } from "./task.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Project, Milestone]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [],
})
export class TaskModule {}