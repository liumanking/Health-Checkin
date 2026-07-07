export type AppEnv = 'development' | 'production';

export const appConfig = {
  env: (import.meta.env.MODE === 'production' ? 'production' : 'development') as AppEnv,
  isDev: import.meta.env.DEV,
  appVersion: '0.1.0',
} as const;
