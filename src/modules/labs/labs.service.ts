import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lab } from './entities/lab.entity';
import { LabMember } from './entities/lab-member.entity';
import { CapabilityTag } from './entities/capability-tag.entity';
import { LabCapability } from './entities/lab-capability.entity';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { CreateCapabilityTagDto } from './dto/create-capability-tag.dto';
import { CreateLabCapabilityDto } from './dto/create-lab-capability.dto';
import { AddLabMemberDto } from './dto/lab-member.dto';

@Injectable()
export class LabsService {
  constructor(
    @InjectRepository(Lab)
    private labRepository: Repository<Lab>,
    @InjectRepository(LabMember)
    private memberRepository: Repository<LabMember>,
    @InjectRepository(CapabilityTag)
    private tagRepository: Repository<CapabilityTag>,
    @InjectRepository(LabCapability)
    private labCapabilityRepository: Repository<LabCapability>,
  ) {}


  async createLab(createLabDto: CreateLabDto, userId: string): Promise<Lab> {
    const existing = await this.labRepository.findOne({ where: { name: createLabDto.name } });
    if (existing) {
      throw new ConflictException('A lab with this name already exists.');
    }

    const lab = this.labRepository.create(createLabDto);
    const savedLab = (await this.labRepository.save(lab)) as Lab;


    const member = this.memberRepository.create({
      labId: savedLab.labId,
      userId,
      memberRole: 'OWNER',
    });
    await this.memberRepository.save(member);

    return savedLab;
  }

 
  async findAllLabs(query: { domain?: string; country?: string; city?: string; page?: number; limit?: number }) {
    const { domain, country, city, page = 1, limit = 10 } = query;
    const queryBuilder = this.labRepository.createQueryBuilder('lab');

    if (domain) queryBuilder.andWhere('lab.domain = :domain', { domain });
    if (country) queryBuilder.andWhere('lab.country = :country', { country });
    if (city) queryBuilder.andWhere('lab.city = :city', { city });

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, meta: { total, page, limit } };
  }

  async updateLab(id: string, updateDto: UpdateLabDto, userId: string): Promise<Lab> {
    const lab = await this.labRepository.findOne({ where: { labId: id }, relations: ['members'] });
    if (!lab) throw new NotFoundException('Lab not found');

    const isOwner = lab.members.some((m) => m.userId === userId && m.memberRole === 'OWNER');
    if (!isOwner) {
      throw new ForbiddenException('Only the lab owner can modify this lab.');
    }

    Object.assign(lab, updateDto);
    return this.labRepository.save(lab);
  }

  
  async addMember(labId: string, dto: AddLabMemberDto, userId: string) {
    const lab = await this.labRepository.findOne({ where: { labId }, relations: ['members'] });
    if (!lab) throw new NotFoundException('Lab not found');

    const isOwner = lab.members.some((m) => m.userId === userId && m.memberRole === 'OWNER');
    if (!isOwner) throw new ForbiddenException('Only the lab owner can add members.');

    const existingMember = await this.memberRepository.findOne({ where: { labId, userId: dto.userId } });
    if (existingMember) throw new ConflictException('User is already a member of this lab.');

    const member = this.memberRepository.create({
      labId,
      userId: dto.userId,
      memberRole: dto.memberRole,
      supervisorName: dto.supervisorName,
    });
    return this.memberRepository.save(member);
  }

  
  async createTag(dto: CreateCapabilityTagDto) {
    const existing = await this.tagRepository.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Capability tag already exists.');

    const tag = this.tagRepository.create(dto);
    return this.tagRepository.save(tag);
  }

  
  async addLabCapability(labId: string, dto: CreateLabCapabilityDto, userId: string) {
    const lab = await this.labRepository.findOne({ where: { labId }, relations: ['members'] });
    if (!lab) throw new NotFoundException('Lab not found');

    const isMember = lab.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('You must be a lab member to add capabilities.');

    const labCapability = this.labCapabilityRepository.create({
      labId,
      tagId: dto.tagId,
      kind: dto.kind,
      note: dto.note,
    });

    return this.labCapabilityRepository.save(labCapability);
  }
}