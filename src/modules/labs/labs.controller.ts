import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Req } from '@nestjs/common';
import { LabsService } from './labs.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { CreateCapabilityTagDto } from './dto/create-capability-tag.dto';
import { CreateLabCapabilityDto } from './dto/create-lab-capability.dto';
import { AddLabMemberDto } from './dto/lab-member.dto'; 
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { IRequest } from '../../common/interfaces/request.interface';

@UseGuards(JwtAuthGuard)
@Controller('labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Post()
  createLab(@Body() createLabDto: CreateLabDto, @Req() req: IRequest) {
    return this.labsService.createLab(createLabDto, req.user!.id);
  }

  @Get()
  findAll(
    @Query('domain') domain?: string,
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.labsService.findAllLabs({ domain, country, city, page, limit });
  }

  @Patch(':id')
  updateLab(@Param('id') id: string, @Body() updateDto: UpdateLabDto, @Req() req: IRequest) {
    return this.labsService.updateLab(id, updateDto, req.user!.id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddLabMemberDto, @Req() req: IRequest) {
    return this.labsService.addMember(id, dto, req.user!.id);
  }

  @Post('tags')
  @UseGuards(RolesGuard)
  @Roles('admin')
  createTag(@Body() dto: CreateCapabilityTagDto) {
    return this.labsService.createTag(dto);
  }

  @Post(':id/capabilities')
  addCapability(@Param('id') id: string, @Body() dto: CreateLabCapabilityDto, @Req() req: IRequest) {
    return this.labsService.addLabCapability(id, dto, req.user!.id);
  }
}