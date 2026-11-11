
import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Project } from "./entities/project.entity";
import {
  CreateProjectDto,
  UpdateProjectDto,
} from "./dto/project.dto";

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async createProject(dto: CreateProjectDto) {
    try {
      const project = this.projectRepository.create(dto);
      return await this.projectRepository.save(project);
    } catch (error) {
      throw error;
    }
  }
}
