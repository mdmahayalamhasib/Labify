import { PartialType } from '@nestjs/mapped-types';
import { CreateCapabilityTagDto } from './create-capability-tag.dto';


export class UpdateCapabilityTagDto extends PartialType(CreateCapabilityTagDto) {}