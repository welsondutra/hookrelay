import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateEndpointDto {
  @IsUrl({ require_tld: false, protocols: ['http', 'https'], require_protocol: true })
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
