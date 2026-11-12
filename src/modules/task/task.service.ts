import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateTaskDto } from "./dto/create-task.dto";

import { Task } from "./entities/task.entity";
import { Project } from "../project/entities/project.entity";
import { Milestone } from "../milestone/entities/milestone.entity";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Milestone)
    private readonly milestoneRepository: Repository<Milestone>,
  ) {}

  async createTask(dto: CreateTaskDto) {
    const project = await this.projectRepository.findOne({
      where: { projectId: dto.projectId },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    const milestone = await this.milestoneRepository.findOne({
      where: {
        milestoneId: dto.milestoneId,
        projectId: dto.projectId,
      },
    });

    if (!milestone) {
      throw new NotFoundException("Milestone not found in this project");
    }

    const task = this.taskRepository.create(dto);

    return await this.taskRepository.save(task);
  }

  async getAllTasks(page: number, limit: number) {
    const [tasks, total] = await this.taskRepository.findAndCount({
      relations: {
        project: true,
        milestone: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getTaskById(id: string) {
    const task = await this.taskRepository.findOne({
      where: { taskId: id },
      relations: {
        project: true,
        milestone: true,
      },
    });
    if (!task) {
      throw new NotFoundException("Task not found");
    }
    return task;
  }
  async updateTask(id: string, dto: UpdateTaskDto) {
    const task = await this.taskRepository.findOne({
      where: { taskId: id },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    Object.assign(task, dto);
    return await this.taskRepository.save(task);
  }

  async deleteTask(id: string) {
    const task = await this.taskRepository.findOne({
      where: { taskId: id },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.taskRepository.delete(id);
    return { message: "Task deleted successfully" };
  }
}