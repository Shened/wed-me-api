import { Controller, Get } from '@nestjs/common';
import { TemplatesService } from './templates.service';

@Controller('templates')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  async findAll() {
    return this.templatesService.findAll();
  }
}
