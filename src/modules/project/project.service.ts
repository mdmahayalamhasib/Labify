
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

  
async getAllProjects(page: number, limit: number) {
  const [projects, total] = await this.projectRepository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: projects,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

  async getProjectById(id: string) {
    const project = await this.projectRepository.findOne({
      where: { projectId: id },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    return project;
  }

  async updateProject(id: string, dto: UpdateProjectDto) {
    const project = await this.projectRepository.findOne({
      where: { projectId: id },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    Object.assign(project, dto);

    return await this.projectRepository.save(project);
  }
  async deleteProject(id: string) {
  const project = await this.projectRepository.findOne({
    where: { projectId: id },
  });

  if (!project) {
    throw new NotFoundException("Project not found");
  }

  await this.projectRepository.delete(id);

  return {
    message: "Project deleted successfully",
  };
}
}
