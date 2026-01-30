import { ApiProperty } from '@nestjs/swagger';

export class QuizWinningsNotificationResponseDto {
  @ApiProperty({
    description: 'Whether the user has new quiz winnings to claim',
    example: false,
  })
  hasNewWinnings: boolean;

  @ApiProperty({
    description: 'The message to display to the user',
    example: 'You have no new quiz winnings to claim at this time.',
  })
  message: string;
}
