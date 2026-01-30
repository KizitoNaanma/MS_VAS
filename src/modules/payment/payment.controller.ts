import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthorizationRequired } from 'src/common/decorators/auth.decorator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorDecorator, CurrentUser, ReligionMustMatch } from 'src/common';

import { Response } from 'express';

import { PaymentService } from './payment.service';
import { ResponseUtilsService } from '../utils';
import {
  BankInformationResponseDto,
  WebhookPayloadDto,
} from 'src/common/dto/onionpay';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { WithdrawalRequestDto } from 'src/common/dto/payment';
import { ApiStandardSuccessDecorator } from 'src/common/decorators/api-standard-success.decorator';

@ApiTags('Payments')
@Controller('payments')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly response: ResponseUtilsService,
  ) {}

  @Get('banks')
  @AuthorizationRequired()
  @ApiOperation({ summary: 'Get banks' })
  @ApiOkResponse({
    description: 'Banks fetched successfully',
    type: BankInformationResponseDto,
  })
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Banks not found')
  @ApiBearerAuth()
  @AuthorizationRequired()
  @ReligionMustMatch()
  async getBanks(@Res() res: Response) {
    const serviceResponse = await this.paymentService.getBanks();
    return this.response.sendResponse(res, serviceResponse);
  }

  @Post('withdraw')
  @AuthorizationRequired()
  @ApiOperation({ summary: 'Create withdrawal request' })
  @ApiStandardSuccessDecorator('Withdrawal request created successfully')
  @ApiErrorDecorator(
    HttpStatus.BAD_REQUEST,
    'Failed to create withdrawal request',
  )
  @ApiBearerAuth()
  @AuthorizationRequired()
  @ReligionMustMatch()
  async createWithdrawalRequest(
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
    @Body() withdrawalRequestDto: WithdrawalRequestDto,
  ) {
    const serviceResponse = await this.paymentService.createWithdrawalRequest(
      user,
      withdrawalRequestDto,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle OnionPay webhook' })
  @ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Invalid signature')
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Invalid webhook payload')
  async handleWebhook(
    @Headers('x-onionpay-signature') signature: string,
    @Body() payload: WebhookPayloadDto,
    @Res() res: Response,
  ) {
    await this.paymentService.handleWebhook(payload, signature);

    // Always return 200 status as required by OnionPay
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });
  }
}
