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

import { MilestoneService } from "./milestone.service";

import {
  CreateMilestoneDto,
  UpdateMilestoneDto,
} from "./dto/milestone.dto";

@Controller("milestones")
export class MilestoneController {
  constructor(
    private readonly milestoneService: MilestoneService,
  ) {}

  @Post()
  createMilestone(@Body() dto: CreateMilestoneDto) {
    return this.milestoneService.createMilestone(dto);
  }

 @Get()
  getAllMilestones(
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

    return this.milestoneService.getAllMilestones(page, limit);
  }

  @Get(":id")
  getMilestoneById(@Param("id") id: string) {
    return this.milestoneService.getMilestoneById(id);
  }

  @Patch(":id")
  updateMilestone(
    @Param("id") id: string,
    @Body() dto: UpdateMilestoneDto,
  ) {
    return this.milestoneService.updateMilestone(id, dto);
  }

  @Delete(":id")
  deleteMilestone(@Param("id") id: string) {
    return this.milestoneService.deleteMilestone(id);
  }
}