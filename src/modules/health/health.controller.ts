import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';
import { PrismaOrmHealthIndicator } from './indicators/prismaorm-health.indicator';
import { ApiTags } from '@nestjs/swagger';
import { PORT } from 'src/common';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaOrmHealthIndicator: PrismaOrmHealthIndicator,
  ) {}

  @Get('check')
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.http.pingCheck(
          'Application (API) State',
          `http://localhost:${PORT}/api/v1`,
        ),
      () => this.prismaOrmHealthIndicator.pingCheck('DB & PrismaORM State'),
    ]);
  }
}
