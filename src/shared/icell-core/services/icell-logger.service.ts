import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IcellLoggerService {
  constructor() {}

  public async logString(message: string): Promise<void> {
    await this.sendLogToSiberia(message);
  }

  public async logJson(
    message: string,
    data: Record<string, any>,
  ): Promise<void> {
    const jsonString = JSON.stringify(data, null, 2);
    await this.sendLogToSiberia(`${message}: ${jsonString}`);
  }

  private async sendLogToSiberia(message: string): Promise<void> {
    const url =
      'https://discord.com/api/webhooks/1364221680586592378/zCYg9xm40JzGpsiMUGM8PJQ8et5IZmn0dUofD2wuo20-yp_Jfyk16IK0FkwI9p3K7lA5';

    try {
      await axios.post(
        url,
        { content: message },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        },
      );
    } catch (error) {
      console.error('Failed to send log to Discord:', error);
    }
  }
}
