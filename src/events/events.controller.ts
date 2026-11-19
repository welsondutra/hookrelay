import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto.js';
import { EventsService, type IngestResult } from './events.service.js';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post()
  @HttpCode(202)
  ingest(@Body() dto: CreateEventDto): Promise<IngestResult> {
    return this.events.ingest(dto);
  }
}
