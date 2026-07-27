import { expect, type APIRequestContext } from '@playwright/test';
import type { CatalogResponse } from '../data/schemas/api.types';

export class CatalogClient {
  constructor(private readonly request: APIRequestContext) {}

  async search(search: string): Promise<CatalogResponse> {
    const response = await this.request.get('/api/v1/titles', {
      params: { search },
    });

    expect(response.ok(), `search catalog for "${search}"`).toBeTruthy();
    return response.json() as Promise<CatalogResponse>;
  }
}
