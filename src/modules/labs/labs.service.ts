import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, QueryFailedError, Repository } from 'typeorm';
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
import { LabMemberRole, LabVisibility } from './enums/lab.enums';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { AccountRole } from '../../common/enums/account-role.enum';
import { Equipment } from '../equipment/entities/equipment.entity';

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
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    private dataSource: DataSource,
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

  private isAdmin(user: AuthUser): boolean {
    const roles = user.roles ?? (user.role ? [user.role] : []);
    return roles.includes(AccountRole.ADMIN);
  }

  private async assertCanView(lab: Lab, user: AuthUser): Promise<void> {
    if (lab.visibility !== LabVisibility.PRIVATE || this.isAdmin(user)) return;
    const isMember = await this.memberRepository.exist({
      where: { labId: lab.labId, userId: user.id },
    });
    if (!isMember) throw new NotFoundException('Lab not found');
  }

 

  async createLab(createLabDto: CreateLabDto, userId: string): Promise<Lab> {
    const existing = await this.labRepository.findOne({ where: { name: createLabDto.name } });
    if (existing) {
      throw new ConflictException('A lab with this name already exists.');
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const savedLab = await manager.save(manager.create(Lab, createLabDto));
        await manager.save(
          manager.create(LabMember, {
            labId: savedLab.labId,
            userId,
            memberRole: LabMemberRole.OWNER,
          }),
        );
        return savedLab;
      });
    } catch (error) {
      if (this.isPgError(error, '23505')) {
        throw new ConflictException('A lab with this name already exists.');
      }
      throw error;
    }
  }

  private isPgError(error: unknown, code: string): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string })?.code === code
    );
  }

  async findAllLabs(
    query: {
      domain?: string;
      country?: string;
      city?: string;
      page?: number;
      limit?: number;
    },
    user: AuthUser,
  ) {
    const { domain, country, city } = query;
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 10, 1), MAX_PAGE_SIZE);

    const queryBuilder = this.labRepository.createQueryBuilder('lab');

    if (domain) queryBuilder.andWhere('lab.domain = :domain', { domain });
    if (country) queryBuilder.andWhere('lab.country = :country', { country });
    if (city) queryBuilder.andWhere('lab.city = :city', { city });

    if (!this.isAdmin(user)) {
      const memberQuery = queryBuilder
        .subQuery()
        .select('1')
        .from(LabMember, 'member')
        .where('member.labId = lab.labId')
        .andWhere('member.userId = :viewerId')
        .getQuery();
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('lab.visibility = :publicVisibility').orWhere(`EXISTS ${memberQuery}`);
        }),
        { publicVisibility: LabVisibility.PUBLIC, viewerId: user.id },
      );
    }

  
    queryBuilder
      .orderBy('lab.verifiedAt', 'DESC')
      .addOrderBy('lab.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [labs, total] = await queryBuilder.getManyAndCount();
    return {
      data: labs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findLabById(labId: string, user: AuthUser): Promise<Lab> {
    const lab = await this.labRepository.findOne({
      where: { labId },
      relations: { members: true, capabilities: { tag: true } },
    });
    if (!lab) throw new NotFoundException('Lab not found');
    await this.assertCanView(lab, user);
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

    const hasEquipment = await this.equipmentRepository.exist({
      where: { labId: id },
    });
    if (hasEquipment) {
      throw new ConflictException(
        'Lab still has equipment and cannot be deleted. Remove its equipment first.',
      );
    }

    try {
      await this.labRepository.delete({ labId: id });
    } catch (error) {
      if (this.isPgError(error, '23503')) {
        throw new ConflictException(
          'Lab still has equipment and cannot be deleted. Remove its equipment first.',
        );
      }
      throw error;
    }
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

  async findLabCapabilities(labId: string, user: AuthUser) {
    const lab = await this.labRepository.findOne({ where: { labId } });
    if (!lab) throw new NotFoundException('Lab not found');
    await this.assertCanView(lab, user);

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
