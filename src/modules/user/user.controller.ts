import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  Delete,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiErrorDecorator,
  AuthorizationRequired,
  UpdatePasswordDto,
  UpdatePasswordDtoResponse,
  IGetProfile,
  IToggleNotificationPreferences,
  IUserReligion,
  UpdateUserReligionDto,
  ToggleNotificationPreferencesDto,
  ToggleNotificationPreferencesDtoResponse,
  UpdatePersonalInfoDto,
  UpdatePersonalInfoDtoResponse,
  UserDtoResponse,
  CurrentUser,
  IUpdatePassword,
  UpdateUserProfilePhotoDto,
  ReligionMustMatch,
  UserAvailableQuizAttemptsResponseDto,
} from 'src/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';
import { ResponseUtilsService } from '../utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiStandardSuccessDecorator } from 'src/common/decorators/api-standard-success.decorator';
import {
  AddBankInformationDto,
  ValidateBankAccountDetailsResponseDto,
} from 'src/common/dto/payment';
import { PaymentService } from '../payment/payment.service';
import { SimpleBankAccountDto } from 'src/common/dto/bank-account';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
@ApiErrorDecorator(HttpStatus.UNAUTHORIZED, 'Unauthorized')
@ReligionMustMatch()
@AuthorizationRequired()
export class UserController {
  constructor(
    private readonly services: UserService,
    private readonly response: ResponseUtilsService,
    private readonly paymentService: PaymentService,
  ) {}

  @ApiOperation({ summary: 'Get profile' })
  @ApiOkResponse({
    description: 'Get profile successful',
    type: UserDtoResponse,
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Get profile failed')
  @Get('/')
  async getProfile(@CurrentUser() user: UserEntity, @Res() res: Response) {
    const payload: IGetProfile = { id: user.id };
    const serviceResponse = await this.services.getProfile(payload);
    return this.response.sendResponse(res, serviceResponse);
  }

  @ApiOperation({ summary: 'Update personal info' })
  @ApiOkResponse({
    description: 'Update personal info successful',
    type: UpdatePersonalInfoDtoResponse,
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Update personal info failed')
  @Patch('/update-personal-info')
  async updatePersonalInfo(
    @Body() payload: UpdatePersonalInfoDto,
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.services.updatePersonalInfo(
      user,
      payload,
    );
    return this.response.sendResponse(res, serviceResponse);
  }

  @ApiOperation({ summary: 'Update password' })
  @ApiOkResponse({
    description: 'Password updated successfully',
    type: UpdatePasswordDtoResponse,
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Updating password failed')
  @Patch('/update-password')
  async updatePassword(
    @Body() body: UpdatePasswordDto,
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const payload: IUpdatePassword = {
      user,
      passwordHash: user.passwordHash,
      ...body,
    };

    const serviceResponse = await this.services.updatePassword(payload);

    return this.response.sendResponse(res, serviceResponse);
  }

  @ApiOperation({ summary: 'Toggle notification preferences' })
  @ApiOkResponse({
    description: 'Toggle notification preferences successful',
    type: ToggleNotificationPreferencesDtoResponse,
  })
  @ApiErrorDecorator(
    HttpStatus.BAD_REQUEST,
    'Toggle notification preferences failed',
  )
  @Patch('/toggle-notification-preferences')
  async toggleNotificationPreferences(
    @Body() body: ToggleNotificationPreferencesDto,
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const payload: IToggleNotificationPreferences = {
      id: user.id,
      ...body,
    };

    const serviceResponse =
      await this.services.toggleNotificationPreferences(payload);
    return this.response.sendResponse(res, serviceResponse);
  }

  @ApiOperation({ summary: 'Update user religion' })
  @ApiOkResponse({
    description: 'User religion updated successfully',
    type: null,
  })
  @ApiErrorDecorator(HttpStatus.BAD_REQUEST, 'Updating user religion failed')
  @Patch('/update-religion')
  async updateUserReligion(
    @Body() body: UpdateUserReligionDto,
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const payload: IUserReligion = {
      userId: user.id,
      ...body,
    };
    const serviceResponse = await this.services.updateUserReligion(payload);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Patch('/update-profile-photo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateUserProfilePhotoDto, required: true })
  @ApiOperation({ summary: 'Update user profile photo' })
  @ApiOkResponse({
    description: 'User profile photo updated successfully',
    type: null,
  })
  @ApiErrorDecorator(
    HttpStatus.BAD_REQUEST,
    'Updating user profile photo failed',
  )
  async updateUserProfilePhoto(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.services.updateUserProfilePhoto(
      user,
      file,
    );

    return this.response.sendResponse(res, serviceResponse);
  }

  @ApiOperation({ summary: 'Get user available quiz attempts' })
  @ApiOkResponse({
    description: 'User available quiz attempts retrieved successfully',
    type: UserAvailableQuizAttemptsResponseDto,
  })
  @ApiErrorDecorator(
    HttpStatus.BAD_REQUEST,
    'Getting user available quiz attempts failed',
  )
  @Get('/get-available-quiz-attempts')
  async getUserAvailableQuizAttempts(
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const serviceResponse =
      await this.services.getUserAvailableQuizAttempts(user);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('bank-accounts')
  @ApiOperation({ summary: 'Get bank accounts' })
  @ApiOkResponse({
    description: 'Bank accounts retrieved successfully',
    type: [SimpleBankAccountDto],
  })
  async getBankAccounts(@CurrentUser() user: UserEntity, @Res() res: Response) {
    const serviceResponse = await this.paymentService.getBankAccounts(user);
    return this.response.sendResponse(res, serviceResponse);
  }

  @Post('bank-accounts')
  @ApiOperation({ summary: 'Add bank account' })
  @ApiStandardSuccessDecorator('Successfully added bank account')
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Bank account not found')
  @ApiErrorDecorator(HttpStatus.CONFLICT, 'Bank account already exists')
  async addBankAccount(
    @Body() addBankInformationDto: AddBankInformationDto,
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.paymentService.addBankInformation(
      addBankInformationDto,
      user,
    );

    return this.response.sendResponse(res, serviceResponse);
  }

  @Get('bank-accounts/validate')
  @ApiOperation({ summary: 'Validate bank account details' })
  @ApiOkResponse({
    description: 'Bank account details validated successfully',
    type: ValidateBankAccountDetailsResponseDto,
  })
  @ApiErrorDecorator(
    HttpStatus.BAD_REQUEST,
    'Validating bank account details failed',
  )
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Bank account details not found')
  async validateBankAccountDetails(
    @Res() res: Response,
    @Query('accountNumber') accountNumber: string,
    @Query('bankCode') bankCode: string,
  ) {
    const serviceResponse =
      await this.paymentService.validateBankAccountDetails(
        accountNumber,
        bankCode,
      );

    return this.response.sendResponse(res, serviceResponse);
  }

  @Patch('bank-accounts/:id/set-default')
  @ApiOperation({ summary: 'Set bank account as default' })
  @ApiStandardSuccessDecorator('Successfully set bank account as default')
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Bank account not found')
  async setDefaultBankAccount(
    @Param('id') bankAccountId: string,
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.paymentService.setDefaultBankAccount(
      user.id,
      bankAccountId,
    );

    return this.response.sendResponse(res, serviceResponse);
  }

  @Delete('bank-accounts/:id')
  @ApiOperation({ summary: 'Delete bank account' })
  @ApiStandardSuccessDecorator('Successfully deleted bank account')
  @ApiErrorDecorator(HttpStatus.NOT_FOUND, 'Bank account not found')
  @ApiErrorDecorator(
    HttpStatus.BAD_REQUEST,
    'Cannot delete bank account with pending withdrawal requests',
  )
  async deleteBankAccount(
    @Param('id') bankAccountId: string,
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const serviceResponse = await this.paymentService.deleteBankAccount(
      user.id,
      bankAccountId,
    );

    return this.response.sendResponse(res, serviceResponse);
  }
}
