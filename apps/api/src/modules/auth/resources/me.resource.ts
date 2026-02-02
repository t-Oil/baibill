import { ResourceDto } from '@resources/paginate.resource';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResourceDto } from '@resources/base.resource';

export class PlanDto {
  @Expose()
  @ApiProperty()
  uid: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  displayName: string;

  @Expose()
  @ApiProperty()
  uploadLimit: number;

  @Expose()
  @ApiProperty()
  canCreateOrg: boolean;

  @Expose()
  @ApiProperty()
  maxOrganizations: number;
}

export class MeDto extends BaseResourceDto {
  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty({ type: PlanDto })
  @Type(() => PlanDto)
  plan: PlanDto;
}

export class MeResource extends ResourceDto {
  @Expose()
  @ApiProperty()
  @Type(() => MeDto)
  data: MeDto;
}
