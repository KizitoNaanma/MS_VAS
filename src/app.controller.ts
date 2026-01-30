import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorDecorator } from './common';

@ApiTags('Root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get the status of the application' })
  @ApiOkResponse({
    description: 'The status of the application',
    type: String,
  })
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Application not found')
  getStatus(): string {
    return this.appService.getStatus();
  }
}
