import { expect, type APIRequestContext } from '@playwright/test';
import type {
  Credentials,
  SessionUser,
} from '../data/schemas/api.types';

export class AuthClient {
  constructor(private readonly request: APIRequestContext) {}

  async signIn(credentials: Credentials): Promise<SessionUser> {
    const response = await this.request.post('/api/v1/auth/sign-in', {
      data: credentials,
    });

    expect(response.status(), 'subscriber API sign-in').toBe(200);
    return response.json() as Promise<SessionUser>;
  }

  async session(): Promise<SessionUser> {
    const response = await this.request.get('/api/v1/auth/session');
    expect(response.ok(), 'authenticated session lookup').toBeTruthy();
    return response.json() as Promise<SessionUser>;
  }
}
