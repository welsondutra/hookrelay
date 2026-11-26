import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';
import { EVENT_TYPE_PATTERN } from '../../events/event-filter.js';

export class CreateEndpointDto {
  @IsUrl({ require_tld: false, protocols: ['http', 'https'], require_protocol: true })
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  @Matches(EVENT_TYPE_PATTERN, {
    each: true,
    message: 'each event type must be a name like order.created, a namespace like order.* or *',
  })
  eventTypes?: string[];
}
