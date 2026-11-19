import { IsObject, IsString, Matches, MaxLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9][a-z0-9_.-]*$/i, { message: 'type may only contain letters, numbers, dots, dashes and underscores' })
  type!: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
