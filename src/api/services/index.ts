import { authClient, membersClient, accessClient, publicAuthClient } from '@api/index';
import { MembersService } from './MembersService';
import { PlansService } from './PlansService';
import { AccessService } from './AccessService';
import { AuthService } from './AuthService';

export const membersService = new MembersService(membersClient);
export const plansService = new PlansService(membersClient);
export const accessService = new AccessService(accessClient);
export const authService = new AuthService(publicAuthClient, authClient);
