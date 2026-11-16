import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lab } from './entities/lab.entity';
import { LabMember } from './entities/lab-member.entity';
import { CapabilityTag } from './entities/capability-tag.entity';
import { LabCapability } from './entities/lab-capability.entity';
import { User } from '../users/entities/user.entity';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { CreateCapabilityTagDto } from './dto/create-capability-tag.dto';
import { UpdateCapabilityTagDto } from './dto/update-capability-tag.dto';
import { CreateLabCapabilityDto } from './dto/create-lab-capability.dto';
import { AddLabMemberDto } from './dto/lab-member.dto';
import { LabMemberRole } from './enums/lab.enums';

const MAX_PAGE_SIZE = 100;

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
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}


 
  private async getLabWithMembers(labId: string): Promise<Lab> {
    const lab = await this.labRepository.findOne({
      where: { labId },
      relations: ['members'],
    });
    if (!lab) throw new NotFoundException('Lab not found');
    return lab;
  }

  private assertOwner(lab: Lab, userId: string, message: string): void {
    const isOwner = lab.members.some(
      (m) => m.userId === userId && m.memberRole === LabMemberRole.OWNER,
    );
    if (!isOwner) throw new ForbiddenException(message);
  }

  private assertMember(lab: Lab, userId: string, message: string): void {
    const isMember = lab.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException(message);
  }

 

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
      memberRole: LabMemberRole.OWNER,
    });
    await this.memberRepository.save(member);

    return savedLab;
  }

  async findAllLabs(query: {
    domain?: string;
    country?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) {
    const { domain, country, city } = query;
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 10, 1), MAX_PAGE_SIZE);

    const queryBuilder = this.labRepository.createQueryBuilder('lab');

    if (domain) queryBuilder.andWhere('lab.domain = :domain', { domain });
    if (country) queryBuilder.andWhere('lab.country = :country', { country });
    if (city) queryBuilder.andWhere('lab.city = :city', { city });

  
    queryBuilder
      .orderBy('lab.verifiedAt', 'DESC')
      .addOrderBy('lab.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, meta: { total, page, limit } };
  }

  async findLabById(labId: string): Promise<Lab> {
    const lab = await this.labRepository.findOne({
      where: { labId },
      relations: { members: true, capabilities: { tag: true } },
    });
    if (!lab) throw new NotFoundException('Lab not found');
    return lab;
  }

  async updateLab(id: string, updateDto: UpdateLabDto, userId: string): Promise<Lab> {
    const lab = await this.getLabWithMembers(id);
    this.assertOwner(lab, userId, 'Only the lab owner can modify this lab.');

  
    if (updateDto.name && updateDto.name !== lab.name) {
      const nameTaken = await this.labRepository.findOne({ where: { name: updateDto.name } });
      if (nameTaken) throw new ConflictException('A lab with this name already exists.');
    }

    Object.assign(lab, updateDto);
    return this.labRepository.save(lab);
  }

  async deleteLab(id: string, userId: string) {
    const lab = await this.getLabWithMembers(id);
    this.assertOwner(lab, userId, 'Only the lab owner can delete this lab.');

  
    await this.labRepository.delete({ labId: id });
    return { message: 'Lab deleted successfully' };
  }

 

  async addMember(labId: string, dto: AddLabMemberDto, userId: string) {
    const lab = await this.getLabWithMembers(labId);
    this.assertOwner(lab, userId, 'Only the lab owner can add members.');

  
    const user = await this.userRepository.findOne({ where: { userId: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const existingMember = await this.memberRepository.findOne({
      where: { labId, userId: dto.userId },
    });
    if (existingMember) throw new ConflictException('User is already a member of this lab.');

    const member = this.memberRepository.create({
      labId,
      userId: dto.userId,
      memberRole: dto.memberRole,
      supervisorName: dto.supervisorName,
    });
    return this.memberRepository.save(member);
  }

  async removeMember(labId: string, memberUserId: string, userId: string) {
    const lab = await this.getLabWithMembers(labId);
    this.assertOwner(lab, userId, 'Only the lab owner can remove members.');

    const member = lab.members.find((m) => m.userId === memberUserId);
    if (!member) throw new NotFoundException('Member not found in this lab');
.
    if (member.memberRole === LabMemberRole.OWNER) {
      throw new BadRequestException('The lab owner cannot be removed. Delete the lab instead.');
    }

    await this.memberRepository.delete({ labMemberId: member.labMemberId });
    return { message: 'Member removed successfully' };
  }


  async createTag(dto: CreateCapabilityTagDto) {
    const existing = await this.tagRepository.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Capability tag already exists.');

    const tag = this.tagRepository.create(dto);
    return this.tagRepository.save(tag);
  }

  async findAllTags() {
    return this.tagRepository.find({ order: { category: 'ASC', name: 'ASC' } });
  }

  async findTagById(tagId: string): Promise<CapabilityTag> {
    const tag = await this.tagRepository.findOne({ where: { tagId } });
    if (!tag) throw new NotFoundException('Capability tag not found');
    return tag;
  }

  async updateTag(tagId: string, dto: UpdateCapabilityTagDto) {
    const tag = await this.findTagById(tagId);

    if (dto.name && dto.name !== tag.name) {
      const nameTaken = await this.tagRepository.findOne({ where: { name: dto.name } });
      if (nameTaken) throw new ConflictException('Capability tag already exists.');
    }

    Object.assign(tag, dto);
    return this.tagRepository.save(tag);
  }

  async deleteTag(tagId: string) {
    await this.findTagById(tagId); 

   
    await this.tagRepository.delete({ tagId });
    return { message: 'Capability tag deleted successfully' };
  }



  async addLabCapability(labId: string, dto: CreateLabCapabilityDto, userId: string) {
    const lab = await this.getLabWithMembers(labId);
    this.assertMember(lab, userId, 'You must be a lab member to add capabilities.');

    const tag = await this.tagRepository.findOne({ where: { tagId: dto.tagId } });
    if (!tag) throw new NotFoundException('Capability tag not found');

    const duplicate = await this.labCapabilityRepository.findOne({
      where: { labId, tagId: dto.tagId, kind: dto.kind },
    });
    if (duplicate) {
      throw new ConflictException('This lab already has this capability with the same kind.');
    }

    const labCapability = this.labCapabilityRepository.create({
      labId,
      tagId: dto.tagId,
      kind: dto.kind,
      note: dto.note,
    });

    return this.labCapabilityRepository.save(labCapability);
  }

  async findLabCapabilities(labId: string) {
    const labExists = await this.labRepository.exist({ where: { labId } });
    if (!labExists) throw new NotFoundException('Lab not found');

    return this.labCapabilityRepository.find({
      where: { labId },
      relations: { tag: true },
    });
  }

  async removeLabCapability(labId: string, capabilityId: string, userId: string) {
    const lab = await this.getLabWithMembers(labId);
    this.assertMember(lab, userId, 'You must be a lab member to remove capabilities.');

    
    const capability = await this.labCapabilityRepository.findOne({
      where: { id: capabilityId, labId },
    });
    if (!capability) throw new NotFoundException('Capability not found for this lab');

    await this.labCapabilityRepository.delete({ id: capabilityId });
    return { message: 'Capability removed successfully' };
  }
}