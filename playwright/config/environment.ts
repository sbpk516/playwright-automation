export type TestEnvironment = {
  name: string;
  webBaseUrl: string;
  apiBaseUrl: string;
};

export function loadEnvironment(): TestEnvironment {
  return {
    name: process.env.TEST_ENV ?? 'local',
    webBaseUrl: process.env.BASE_URL ?? 'http://127.0.0.1:3000',
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://127.0.0.1:8000',
  };
}
