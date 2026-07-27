import { expect, type APIRequestContext } from '@playwright/test';
import type {
  Profile,
  ProfileInput,
} from '../data/schemas/api.types';

export class ProfileClient {
  constructor(private readonly request: APIRequestContext) {}

  async list(): Promise<Profile[]> {
    const response = await this.request.get('/api/v1/profiles');
    expect(response.ok(), 'list profiles').toBeTruthy();
    return response.json() as Promise<Profile[]>;
  }

  async create(profile: ProfileInput): Promise<Profile> {
    const response = await this.request.post('/api/v1/profiles', {
      data: profile,
    });

    expect(response.status(), 'create profile').toBe(201);
    return response.json() as Promise<Profile>;
  }

  async delete(profileId: string): Promise<void> {
    const response = await this.request.delete(
      `/api/v1/profiles/${profileId}`,
    );

    expect(
      [204, 404],
      'cleanup accepts deleted or already-missing data',
    ).toContain(response.status());
  }
}
