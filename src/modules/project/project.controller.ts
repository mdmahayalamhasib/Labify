
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from "@nestjs/common";

import { ProjectService } from "./project.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
} from "./dto/project.dto";

@Controller("projects")
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
  ) {}

  @Post()
  createProject(@Body() dto: CreateProjectDto) {
    return this.projectService.createProject(dto);
  }

  @Get()
  getAllProjects(
  @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
) {
  if (page < 1) {
    throw new BadRequestException("Page must be greater than 0");
  }

  if (limit < 1) {
    throw new BadRequestException("Limit must be greater than 0");
  }

  if (limit > 100) {
    limit = 100;
  }

  return this.projectService.getAllProjects(page, limit);
}


  @Get(":id")
  getProjectById(@Param("id") id: string) {
    return this.projectService.getProjectById(id);
  }

  @Patch(":id")
  updateProject(
    @Param("id") id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.updateProject(id, dto);
  }

  @Delete(":id")
  deleteProject(@Param("id") id: string) {
    return this.projectService.deleteProject(id);
  }
}
