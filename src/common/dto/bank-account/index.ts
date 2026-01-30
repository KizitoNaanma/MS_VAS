import { PickType } from '@nestjs/swagger';
import { BankAccountDto } from 'src/shared/database/prisma/generated/bankAccount.dto';

export class SimpleBankAccountDto extends PickType(BankAccountDto, [
  'bankName',
  'accountNumber',
  'accountName',
  'isDefault',
]) {}
