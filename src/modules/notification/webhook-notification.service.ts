import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { format } from 'date-fns';
import { TrafficData } from 'src/common';

@Injectable()
export class WebhookNotificationService {
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

  public async sendTrafficNotifications(
    url: string,
    trafficData: TrafficData,
  ): Promise<void> {
    const message = this.formatTrafficMessage(trafficData);

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
      console.error('Failed to send traffic notification:', error);
    }
  }

  private formatTrafficMessage(trafficData: TrafficData): string {
    const { lastDatasyncHit, lastSecureDHit, environment } = trafficData;

    const formatTime = (date: Date | null): string => {
      if (!date) return 'No traffic recorded';
      return date.toISOString();
    };

    return (
      `=========================================================\n` +
      `🚦 **Traffic Report - ${environment.toUpperCase()}**\n` +
      `📊 **Datasync Endpoint**: Last hit at ${formatTime(lastDatasyncHit)}\n` +
      `📊 **SecureD Endpoint**: Last hit at ${formatTime(lastSecureDHit)}\n` +
      `⏰ **Report Time**: ${format(new Date(), 'yyyy-MM-dd HH:mm')}\n` +
      `=========================================================\n`
    );
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
