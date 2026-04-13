import axios from 'axios';
import { AUTH_BASE_URL, MEMBERS_BASE_URL, ACCESS_BASE_URL } from '@utils/constants';
import { createApiClient } from './client';

export const authClient = createApiClient(AUTH_BASE_URL);
export const membersClient = createApiClient(MEMBERS_BASE_URL);
export const accessClient = createApiClient(ACCESS_BASE_URL);

// Public client without auth interceptors (for login/register)
export const publicAuthClient = axios.create({ baseURL: AUTH_BASE_URL });