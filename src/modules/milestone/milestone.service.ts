import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateMilestoneDto,UpdateMilestoneDto, } from "./dto/milestone.dto";
import { Milestone } from "./entities/milestone.entity";
import { Project } from "../project/entities/project.entity";


@Injectable()
export class MilestoneService {
  constructor(
  @InjectRepository(Milestone)
  private readonly milestoneRepository: Repository<Milestone>,

  @InjectRepository(Project)
  private readonly projectRepository: Repository<Project>,
) {}

async createMilestone(dto: CreateMilestoneDto) {
  const project = await this.projectRepository.findOne({
    where: { projectId: dto.projectId },
  });

  if (!project) {
    throw new NotFoundException("Project not found");
  }

  const milestone = this.milestoneRepository.create(dto);

  return await this.milestoneRepository.save(milestone);
}
async getAllMilestones(page: number, limit: number) {
  const [milestones, total] =
    await this.milestoneRepository.findAndCount({
      relations: {
        project: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

  return {
    data: milestones,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
async getMilestoneById(id: string) {
  const milestone = await this.milestoneRepository.findOne({
    where: { milestoneId: id },
    relations: {
      project: true,
    },
  });

  if (!milestone) {
    throw new NotFoundException("Milestone not found");
  }

  return milestone;
}
async updateMilestone(id: string, dto: UpdateMilestoneDto) {
  const milestone = await this.milestoneRepository.findOne({
    where: { milestoneId: id },
  });

  if (!milestone) {
    throw new NotFoundException("Milestone not found");
  }

  Object.assign(milestone, dto);

  return await this.milestoneRepository.save(milestone);
}
async deleteMilestone(id: string) {
  const milestone = await this.milestoneRepository.findOne({
    where: { milestoneId: id },
  });

  if (!milestone) {
    throw new NotFoundException("Milestone not found");
  }

  await this.milestoneRepository.delete(id);

  return {
    message: "Milestone deleted successfully",
  };
}

}