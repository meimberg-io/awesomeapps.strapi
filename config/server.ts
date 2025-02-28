export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('SERVER_URL'),
  public_url: env('PUBLIC_URL'),

  admin: {
    url: env('ADMIN_URL'),
  },
  app: {
    keys: env.array('APP_KEYS'),
  },
  logger: { config: { level: 'debug' }}
  });
