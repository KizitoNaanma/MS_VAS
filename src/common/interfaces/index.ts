import { Socket } from 'socket.io';
import { UserEntity } from 'src/shared/database/prisma/generated/user.entity';

interface AuthSocketData {
  user: UserEntity;
}

export interface AuthenticatedUserSocket
  extends Socket<any, any, any, AuthSocketData> {
  data: AuthSocketData;
}
