import { authClient, membersClient, accessClient, publicAuthClient } from '@api/index';
import { MembersService } from './MembersService';
import { PlansService } from './PlansService';
import { SubscriptionsService } from './SubscriptionsService';
import { AccessService } from './AccessService';
import { AuthService } from './AuthService';
import { StatisticsService } from './StatisticsService';
import { DevicesService } from './DevicesService';
import { AuditService } from './AuditService';

export const membersService = new MembersService(membersClient);
export const plansService = new PlansService(membersClient);
export const subscriptionsService = new SubscriptionsService(membersClient);
export const accessService = new AccessService(accessClient);
export const authService = new AuthService(publicAuthClient, authClient);
export const statisticsService = new StatisticsService(membersClient);
export const devicesService = new DevicesService(membersClient);
export const auditService = new AuditService(membersClient);
