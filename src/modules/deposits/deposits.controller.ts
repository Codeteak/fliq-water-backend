import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { DepositsService } from './deposits.service';
import { UpdateDepositConfigDto } from './dto/update-deposit-config.dto';
import { TopUpDepositDto } from './dto/top-up-deposit.dto';
import { AdminAdjustDepositDto } from './dto/admin-adjust-deposit.dto';

interface RequestWithUser extends Request {
  user: { id: string };
}

@ApiTags('Deposits')
@Controller()
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @Get('deposits/config')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current can deposit config (owner/admin)' })
  getConfig() {
    return this.depositsService.getConfig();
  }

  @Patch('deposits/config')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update can deposit config and promo tiers (owner/admin)' })
  @ApiResponse({ status: 200, description: 'Config updated' })
  updateConfig(@Body() dto: UpdateDepositConfigDto) {
    return this.depositsService.updateConfig(dto);
  }

  @Get('deposits/wallet/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my deposit wallet balance' })
  getMyWallet(@Req() req: RequestWithUser) {
    return this.depositsService.getMyWallet(req.user.id);
  }

  @Post('deposits/wallet/me/top-up')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Top-up my deposit wallet balance' })
  topUp(@Req() req: RequestWithUser, @Body() dto: TopUpDepositDto) {
    return this.depositsService.topUpMyWallet(req.user.id, dto);
  }

  @Post('admin/deposits/wallet/:userId/add')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add deposit amount to customer wallet (owner/admin)' })
  addByAdmin(@Req() req: RequestWithUser, @Param('userId') userId: string, @Body() dto: AdminAdjustDepositDto) {
    return this.depositsService.adminAddToWallet(req.user.id, userId, dto);
  }
}
