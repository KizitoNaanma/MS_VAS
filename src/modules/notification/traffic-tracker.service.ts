import { Injectable } from '@nestjs/common';
import { TrafficData } from 'src/common';
import { RedisService } from 'src/shared/cache/redis/redis.service';

@Injectable()
export class TrafficTrackerService {
  private readonly DATASYNC_KEY = 'traffic:datasync:lastHit';
  private readonly SECURED_KEY = 'traffic:secured:lastHit';

  constructor(private readonly redisService: RedisService) {}

  async recordDatasyncHit(): Promise<void> {
    const timestamp = new Date().toISOString();
    // Set TTL to 7 days (7 * 24 * 60 * 60 * 1000 = 604800000 ms)
    await this.redisService.set(this.DATASYNC_KEY, timestamp, 604800000);
  }

  async recordSecureDHit(): Promise<void> {
    const timestamp = new Date().toISOString();
    // Set TTL to 7 days (7 * 24 * 60 * 60 * 1000 = 604800000 ms)
    await this.redisService.set(this.SECURED_KEY, timestamp, 604800000);
  }

  async getTrafficData(): Promise<TrafficData> {
    const [datasyncTimestamp, securedTimestamp] = await Promise.all([
      this.redisService.get(this.DATASYNC_KEY),
      this.redisService.get(this.SECURED_KEY),
    ]);

    return {
      lastDatasyncHit: datasyncTimestamp ? new Date(datasyncTimestamp) : null,
      lastSecureDHit: securedTimestamp ? new Date(securedTimestamp) : null,
    };
  }
}
