import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { LabsService } from './labs.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { CreateCapabilityTagDto } from './dto/create-capability-tag.dto';
import { UpdateCapabilityTagDto } from './dto/update-capability-tag.dto';
import { CreateLabCapabilityDto } from './dto/create-lab-capability.dto';
import { AddLabMemberDto } from './dto/lab-member.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AccountRole } from '../../common/enums/account-role.enum';
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
    @Req() req: IRequest,
    @Query('domain') domain?: string,
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1) throw new BadRequestException('Limit must be greater than 0');

    return this.labsService.findAllLabs({ domain, country, city, page, limit }, req.user!);
  }

 

  @Post('tags')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  createTag(@Body() dto: CreateCapabilityTagDto) {
    return this.labsService.createTag(dto);
  }

  @Get('tags')
  findAllTags() {
    return this.labsService.findAllTags();
  }

  @Get('tags/:id')
  findTagById(@Param('id', ParseUUIDPipe) id: string) {
    return this.labsService.findTagById(id);
  }

  @Patch('tags/:id')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  updateTag(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCapabilityTagDto) {
    return this.labsService.updateTag(id, dto);
  }

  @Delete('tags/:id')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  deleteTag(@Param('id', ParseUUIDPipe) id: string) {
    return this.labsService.deleteTag(id);
  }


  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: IRequest) {
    return this.labsService.findLabById(id, req.user!);
  }

  @Patch(':id')
  updateLab(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateLabDto,
    @Req() req: IRequest,
  ) {
    return this.labsService.updateLab(id, updateDto, req.user!.id);
  }

  @Delete(':id')
  deleteLab(@Param('id', ParseUUIDPipe) id: string, @Req() req: IRequest) {
    return this.labsService.deleteLab(id, req.user!.id);
  }



  @Post(':id/members')
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddLabMemberDto,
    @Req() req: IRequest,
  ) {
    return this.labsService.addMember(id, dto, req.user!.id);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: IRequest,
  ) {
    return this.labsService.removeMember(id, userId, req.user!.id);
  }

 
  @Post(':id/capabilities')
  addCapability(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateLabCapabilityDto,
    @Req() req: IRequest,
  ) {
    return this.labsService.addLabCapability(id, dto, req.user!.id);
  }

  @Get(':id/capabilities')
  findCapabilities(@Param('id', ParseUUIDPipe) id: string, @Req() req: IRequest) {
    return this.labsService.findLabCapabilities(id, req.user!);
  }

  @Delete(':id/capabilities/:capabilityId')
  removeCapability(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('capabilityId', ParseUUIDPipe) capabilityId: string,
    @Req() req: IRequest,
  ) {
    return this.labsService.removeLabCapability(id, capabilityId, req.user!.id);
  }
}