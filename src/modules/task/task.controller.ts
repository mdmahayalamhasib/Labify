import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  Query,
} from "@nestjs/common";

import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TaskService } from "./task.service";

@Controller("tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}
  @Post()
  createTask(@Body() dto: CreateTaskDto) {
    return this.taskService.createTask(dto);
  }

  @Get()
  getAllTasks(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) 
  {
    if (page < 1) {
      throw new BadRequestException("Page must be greater than 0");
    }

    if (limit < 1) {
      throw new BadRequestException("Limit must be greater than 0");
    }

    if (limit > 100) {
      limit = 100;
    }

    return this.taskService.getAllTasks(page, limit);

  }

  @Get(":id")
  getTaskById(@Param("id") id: string) {
    return this.taskService.getTaskById(id);
  }

  @Patch(":id")
  updateTask(
    @Param("id") id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(id, dto);
  }

  @Delete(":id")
  deleteTask(@Param("id") id: string) {
    return this.taskService.deleteTask(id);
  }
}