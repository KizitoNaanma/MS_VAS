import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdminUserStatus,
  Prisma,
  Religion,
  User,
  UserRole,
} from '@prisma/client';
import {
  AdminRole,
  AdminRoleResponseDto,
  AdminUserPaginatedResponseDto,
  AdminUserResponseDto,
  CreateAdminUserDto,
  IServiceResponse,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
  ReligionEnum,
  StandardUserResponseDto,
  UsersStatisticsResponseDto,
  UserWithSubscriptionResponseDto,
} from 'src/common';
import { FilterDto } from 'src/common/dto/filters';
import { PrismaService } from 'src/common/services/database/prisma';
import { UpdateUserDto } from 'src/shared/database/prisma/generated/update-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllUsers(
    pageOptionsDto: PageOptionsDto,
    filterDto: FilterDto,
  ): Promise<IServiceResponse<PageDto<StandardUserResponseDto>>> {
    let users: StandardUserResponseDto[] = [];
    let itemCount: number;
    let religion: Religion | undefined = undefined;
    const religionFilter = filterDto.religion;

    if (religionFilter) {
      religion = await this.prismaService.religion.findFirst({
        where: { code: religionFilter },
      });
    }

    if (filterDto.search?.trim().length > 0) {
      const searchKeywords = filterDto.search.trim().split(' ').join(' | ');
      const religionQuery = religion
        ? Prisma.sql`"User"."religion" = ${religion.code} AND`
        : Prisma.sql``;

      users = await this.prismaService.$queryRaw<User[]>(
        Prisma.sql`SELECT 
        "id", "firstName", "lastName", "email", 
        "phone", "profilePhoto", "religion",
        "createdAt", "updatedAt", "lastLogin",
        "dob", "roles", "isActive" FROM "User" WHERE ${religionQuery}
      (to_tsvector('english', "firstName") @@ to_tsquery(${searchKeywords})
      OR to_tsvector('english', "lastName") @@ to_tsquery(${searchKeywords})
      OR to_tsvector('english', "email") @@ to_tsquery(${searchKeywords})
      OR to_tsvector('english', "phone") @@ to_tsquery(${searchKeywords})
      OR "User"."firstName" ILIKE '%' || ${searchKeywords} || '%'
      OR "User"."lastName" ILIKE '%' || ${searchKeywords} || '%'
      OR "User"."email" ILIKE '%' || ${searchKeywords} || '%'
      OR "User"."phone" ILIKE '%' || ${searchKeywords} || '%')`,
      );

      itemCount = users.length;
    } else {
      const whereClause = religion
        ? {
            religion: religion?.code,
          }
        : {};
      users = await this.prismaService.user.findMany({
        where: whereClause,
        skip: pageOptionsDto.skip,
        take: pageOptionsDto.pageSize,
        orderBy: {
          createdAt: pageOptionsDto.order,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          profilePhoto: true,
          religion: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
          dob: true,
          roles: true,
          isActive: true,
        },
      });

      itemCount = await this.prismaService.user.count({
        where: whereClause,
      });
    }

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
    return {
      success: true,
      message: 'Users fetched successfully',
      data: new PageDto(users, pageMetaDto),
    };
  }

  async getUserById(
    id: string,
  ): Promise<IServiceResponse<UserWithSubscriptionResponseDto>> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profilePhoto: true,
        religion: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        dob: true,
        roles: true,
        isActive: true,
      },
    });
    const subscription = await this.prismaService.subscription.findFirst({
      where: { userId: id },
      orderBy: {
        startDate: 'desc',
      },
      select: {
        id: true,
        productId: true,
        productName: true,
        serviceId: true,
        serviceName: true,
        startDate: true,
        endDate: true,
        maxAccess: true,
        accessCount: true,
        status: true,
      },
    });
    return {
      success: true,
      message: 'User fetched successfully',
      data: {
        user,
        subscription,
      },
    };
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<IServiceResponse<StandardUserResponseDto>> {
    try {
      const user = await this.prismaService.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          profilePhoto: true,
          religion: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
          dob: true,
          roles: true,
          isActive: true,
        },
      });
      return {
        success: true,
        message: 'User updated successfully',
        data: user,
      };
    } catch (error) {
      // Check for unique constraint violation
      if (error.code === 'P2002') {
        const field = error.meta?.target[0];
        throw new BadRequestException(
          `A user with this ${field} already exists.`,
        );
      }

      // Handle other errors
      throw new BadRequestException(error.message);
    }
  }

  async deactivateUser(id: string): Promise<IServiceResponse> {
    await this.prismaService.user.update({
      where: { id },
      data: { isActive: false, deactivatedAt: new Date() },
    });
    return {
      success: true,
      message: 'User deactivated successfully',
    };
  }

  async activateUser(id: string): Promise<IServiceResponse> {
    await this.prismaService.user.update({
      where: { id },
      data: { isActive: true, deactivatedAt: null },
    });
    return {
      success: true,
      message: 'User activated successfully',
    };
  }

  async deleteUser(id: string): Promise<IServiceResponse> {
    await this.prismaService.user.delete({
      where: { id },
    });
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  async getAdminRoles(): Promise<IServiceResponse<AdminRoleResponseDto>> {
    return {
      success: true,
      message: 'Admin roles fetched successfully',
      data: {
        roles: Object.values(AdminRole),
      },
    };
  }

  async getAdminUsers(
    pageOptionsDto: PageOptionsDto,
  ): Promise<IServiceResponse<AdminUserPaginatedResponseDto>> {
    const users = await this.prismaService.user.findMany({
      where: { roles: { hasSome: ['ADMIN', 'SUPERADMIN'] } },
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.pageSize,
      orderBy: {
        createdAt: pageOptionsDto.order,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        adminStatus: true,
        roles: true,
      },
    });
    const itemCount = await this.prismaService.user.count({
      where: { roles: { hasSome: ['ADMIN', 'SUPERADMIN'] } },
    });
    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
    const adminUsers = users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      adminStatus: user.adminStatus,
      adminRole: user.roles.includes(AdminRole.ADMIN)
        ? AdminRole.ADMIN
        : AdminRole.SUPERADMIN,
    }));
    const adminUserPaginatedResponseDto = new AdminUserPaginatedResponseDto(
      adminUsers,
      pageMetaDto,
    );
    return {
      success: true,
      message: 'Admin users fetched successfully',
      data: adminUserPaginatedResponseDto,
    };
  }

  async getAdminUserDetails(
    id: string,
  ): Promise<IServiceResponse<AdminUserResponseDto>> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        adminStatus: true,
        roles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    if (
      !user.roles.includes(UserRole.ADMIN) &&
      !user.roles.includes(UserRole.SUPERADMIN)
    ) {
      throw new BadRequestException('User is not an admin');
    }

    let adminRole: AdminRole;

    if (user.roles.includes(UserRole.SUPERADMIN)) {
      adminRole = AdminRole.SUPERADMIN;
    } else if (user.roles.includes(UserRole.ADMIN)) {
      adminRole = AdminRole.ADMIN;
    }

    const adminUserResponseDto: AdminUserResponseDto = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      adminStatus: user.adminStatus,
      adminRole,
    };
    return {
      success: true,
      message: 'Admin user details fetched successfully',
      data: adminUserResponseDto,
    };
  }

  async suspendAdminUser(id: string): Promise<IServiceResponse> {
    await this.prismaService.user.update({
      where: { id },
      data: { adminStatus: AdminUserStatus.SUSPENDED },
    });
    return {
      success: true,
      message: 'Admin user suspended successfully',
    };
  }

  async reactivateAdminUser(id: string): Promise<IServiceResponse> {
    await this.prismaService.user.update({
      where: { id },
      data: { adminStatus: AdminUserStatus.ACTIVE },
    });
    return {
      success: true,
      message: 'Admin user reactivated successfully',
    };
  }

  async createAdminUser(
    createAdminUserDto: CreateAdminUserDto,
  ): Promise<IServiceResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { id: createAdminUserDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      user.roles.includes(UserRole.ADMIN) ||
      user.roles.includes(UserRole.SUPERADMIN)
    ) {
      throw new BadRequestException('User is already an admin');
    }

    await this.prismaService.user.update({
      where: { id: createAdminUserDto.userId },
      data: {
        roles: [...user.roles, createAdminUserDto.role],
      },
    });

    return {
      success: true,
      message: 'Admin user created successfully',
    };
  }

  private async filterStatsByReligion(
    stats: Array<{
      religion: string;
      subscription_count?: number;
      customer_count?: number;
    }>,
    religion: string,
  ): Promise<{
    religion: string;
    subscription_count?: number;
    customer_count?: number;
  }> {
    return (
      stats.filter((item) => item.religion === religion)[0] || {
        religion,
        subscription_count: 0,
        customer_count: 0,
      }
    );
  }

  async getUsersStatistics(): Promise<
    IServiceResponse<UsersStatisticsResponseDto>
  > {
    // Queries
    const subsCountRawResult = await this.prismaService.$queryRaw<
      Array<{
        religion: string;
        subscription_count: bigint;
      }>
    >`
    SELECT 
      u.religion,
      COUNT(s.id) as subscription_count
    FROM "Subscription" s
    INNER JOIN "User" u ON s."userId" = u.id
    WHERE u.religion IS NOT NULL
    GROUP BY u.religion
    ORDER BY subscription_count DESC
  `;

    const activeSubsCountRawResult = await this.prismaService.$queryRaw<
      Array<{
        religion: string;
        subscription_count: bigint;
      }>
    >`
    SELECT 
    u.religion,
    COUNT(s.id) as subscription_count
    FROM "Subscription" s
    INNER JOIN "User" u ON s."userId" = u.id
    WHERE u.religion IS NOT NULL AND s.status = 'ACTIVE'
    GROUP BY u.religion
    ORDER BY subscription_count DESC
    `;

    const customersCountRawResult = await this.prismaService.$queryRaw<
      Array<{
        religion: string;
        customer_count: bigint;
      }>
    >`
    SELECT 
      u.religion,
      COUNT(u.id) as customer_count
    FROM "User" u
    WHERE u.religion IS NOT NULL
    GROUP BY u.religion
    ORDER BY customer_count DESC
  `;

    const totalRevenueRawResult = await this.prismaService.$queryRaw<
      Array<{
        total_revenue: bigint;
      }>
    >`
    SELECT SUM(s.amount) as total_revenue FROM "Subscription" s
    `;

    const totalRevenueTodayRawResult = await this.prismaService.$queryRaw<
      Array<{
        total_revenue_today: bigint;
      }>
    >`
  SELECT SUM(s.amount) as total_revenue_today FROM "Subscription" s WHERE s."createdAt" >= NOW() - INTERVAL '1 day'
  `;

    const totalRevenueTodayResult = totalRevenueTodayRawResult.map((item) => ({
      total_revenue_today: Number(item.total_revenue_today),
    }))[0];

    // Result mapping
    const subsCountResult = subsCountRawResult.map((item) => ({
      religion: item.religion,
      subscription_count: Number(item.subscription_count),
    }));

    const activeSubsCountResult = activeSubsCountRawResult.map((item) => ({
      religion: item.religion,
      subscription_count: Number(item.subscription_count),
    }));

    const customersCountResult = customersCountRawResult.map((item) => ({
      religion: item.religion,
      customer_count: Number(item.customer_count),
    }));

    const totalRevenueResult = totalRevenueRawResult.map((item) => ({
      total_revenue: Number(item.total_revenue),
    }))[0];

    // subscriptions by religion
    const christianSubsCount = await this.filterStatsByReligion(
      subsCountResult,
      ReligionEnum.CHRISTIANITY,
    );

    const muslimSubsCount = await this.filterStatsByReligion(
      subsCountResult,
      ReligionEnum.ISLAM,
    );

    // active subscriptions
    const christianActiveSubsCount = await this.filterStatsByReligion(
      activeSubsCountResult,
      ReligionEnum.CHRISTIANITY,
    );

    const muslimActiveSubsCount = await this.filterStatsByReligion(
      activeSubsCountResult,
      ReligionEnum.ISLAM,
    );

    // customers by religion
    const christianCustomersCount = await this.filterStatsByReligion(
      customersCountResult,
      ReligionEnum.CHRISTIANITY,
    );

    const muslimCustomersCount = await this.filterStatsByReligion(
      customersCountResult,
      ReligionEnum.ISLAM,
    );

    const usersStatisticsResponseDto: UsersStatisticsResponseDto = {
      numberOfSubscribersByReligion: {
        christians: christianSubsCount.subscription_count,
        muslims: muslimSubsCount.subscription_count,
      },
      numberOfActiveSubscribersByReligion: {
        christians: christianActiveSubsCount.subscription_count,
        muslims: muslimActiveSubsCount.subscription_count,
      },
      numberOfCustomersByReligion: {
        christians: christianCustomersCount.customer_count,
        muslims: muslimCustomersCount.customer_count,
      },
      numberOfMonthlyAcquiredCustomers: {
        christians: 0,
        muslims: 0,
      },
      totalRevenueTillDate: totalRevenueResult.total_revenue,
      totalRevenueToday: totalRevenueTodayResult.total_revenue_today,
    };

    return {
      success: true,
      message: 'Users statistics fetched successfully',
      data: usersStatisticsResponseDto,
    };
  }
}
