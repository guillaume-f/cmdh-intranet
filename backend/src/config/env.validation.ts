type NodeEnv = 'development' | 'test' | 'production';

const DEFAULT_DEV_CORS_ORIGINS = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
];

export interface AppEnvironment {
  NODE_ENV: NodeEnv;
  PORT: number;
  CORS_ORIGINS: string[];
  SWAGGER_ENABLED: boolean;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRATION: string;
  JWT_REFRESH_EXPIRATION: string;
  LOG_LEVEL: string;
  LOG_DIR: string;
  LOG_MAX_SIZE: string;
  LOG_APP_RETENTION_DAYS: number;
  LOG_ERROR_RETENTION_DAYS: number;
  LOG_BODY: boolean;
  ALLOW_SEED: boolean;
  SEED_DEFAULT_PASSWORD?: string;
}

export function validateEnvironment(
  rawEnv: Record<string, unknown>,
): AppEnvironment {
  const errors: string[] = [];
  const nodeEnv = readNodeEnv(rawEnv.NODE_ENV, errors);
  const jwtAccessSecret = readOptionalString(rawEnv.JWT_ACCESS_SECRET);
  const jwtRefreshSecret = readOptionalString(rawEnv.JWT_REFRESH_SECRET);
  const allowSeed = readBoolean('ALLOW_SEED', rawEnv.ALLOW_SEED, false, errors);
  const seedDefaultPassword = readOptionalString(rawEnv.SEED_DEFAULT_PASSWORD);
  const corsOrigins = readCsv(
    rawEnv.CORS_ORIGINS,
    nodeEnv === 'production' ? [] : DEFAULT_DEV_CORS_ORIGINS,
  );
  const dbPassword = readOptionalString(rawEnv.DB_PASSWORD) ?? '';
  const port = readNumber('PORT', rawEnv.PORT, 3000, errors);
  const swaggerEnabled = readBoolean(
    'SWAGGER_ENABLED',
    rawEnv.SWAGGER_ENABLED,
    nodeEnv !== 'production',
    errors,
  );
  const dbHost = readRequiredString(
    'DB_HOST',
    rawEnv.DB_HOST,
    'localhost',
    errors,
  );
  const dbPort = readNumber('DB_PORT', rawEnv.DB_PORT, 3306, errors);
  const dbName = readRequiredString(
    'DB_NAME',
    rawEnv.DB_NAME,
    'cmdh_intranet',
    errors,
  );
  const dbUser = readRequiredString('DB_USER', rawEnv.DB_USER, 'root', errors);
  const jwtAccessExpiration = readRequiredString(
    'JWT_ACCESS_EXPIRATION',
    rawEnv.JWT_ACCESS_EXPIRATION,
    '10m',
    errors,
  );
  const jwtRefreshExpiration = readRequiredString(
    'JWT_REFRESH_EXPIRATION',
    rawEnv.JWT_REFRESH_EXPIRATION,
    '7d',
    errors,
  );
  const logLevel = readRequiredString(
    'LOG_LEVEL',
    rawEnv.LOG_LEVEL,
    nodeEnv === 'production' ? 'log' : 'debug',
    errors,
  );
  const logDir = readRequiredString('LOG_DIR', rawEnv.LOG_DIR, 'logs', errors);
  const logMaxSize = readRequiredString(
    'LOG_MAX_SIZE',
    rawEnv.LOG_MAX_SIZE,
    '10M',
    errors,
  );
  const logAppRetentionDays = readNumber(
    'LOG_APP_RETENTION_DAYS',
    rawEnv.LOG_APP_RETENTION_DAYS,
    30,
    errors,
  );
  const logErrorRetentionDays = readNumber(
    'LOG_ERROR_RETENTION_DAYS',
    rawEnv.LOG_ERROR_RETENTION_DAYS,
    90,
    errors,
  );
  const logBody = readBoolean(
    'LOG_BODY',
    rawEnv.LOG_BODY,
    nodeEnv !== 'production',
    errors,
  );

  if (!jwtAccessSecret) {
    errors.push('JWT_ACCESS_SECRET is required.');
  } else if (
    jwtAccessSecret.length < 32 ||
    isPlaceholderSecret(jwtAccessSecret)
  ) {
    errors.push(
      'JWT_ACCESS_SECRET must be a unique random secret of at least 32 characters.',
    );
  }

  if (!jwtRefreshSecret) {
    errors.push('JWT_REFRESH_SECRET is required.');
  } else if (
    jwtRefreshSecret.length < 32 ||
    isPlaceholderSecret(jwtRefreshSecret)
  ) {
    errors.push(
      'JWT_REFRESH_SECRET must be a unique random secret of at least 32 characters.',
    );
  }

  if (
    jwtAccessSecret &&
    jwtRefreshSecret &&
    jwtAccessSecret === jwtRefreshSecret
  ) {
    errors.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different.');
  }
  if (nodeEnv === 'production' && corsOrigins.length === 0) {
    errors.push('CORS_ORIGINS is required in production.');
  }
  if (nodeEnv === 'production' && dbPassword.length === 0) {
    errors.push('DB_PASSWORD is required in production.');
  }
  if (nodeEnv === 'production' && allowSeed) {
    errors.push('ALLOW_SEED must stay false in production.');
  }
  if (allowSeed && !seedDefaultPassword) {
    errors.push('SEED_DEFAULT_PASSWORD is required when ALLOW_SEED=true.');
  }
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n- ${errors.join('\n- ')}`);
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    CORS_ORIGINS: corsOrigins,
    SWAGGER_ENABLED: swaggerEnabled,
    DB_HOST: dbHost,
    DB_PORT: dbPort,
    DB_NAME: dbName,
    DB_USER: dbUser,
    DB_PASSWORD: dbPassword,
    JWT_ACCESS_SECRET: jwtAccessSecret as string,
    JWT_REFRESH_SECRET: jwtRefreshSecret as string,
    JWT_ACCESS_EXPIRATION: jwtAccessExpiration,
    JWT_REFRESH_EXPIRATION: jwtRefreshExpiration,
    LOG_LEVEL: logLevel,
    LOG_DIR: logDir,
    LOG_MAX_SIZE: logMaxSize,
    LOG_APP_RETENTION_DAYS: logAppRetentionDays,
    LOG_ERROR_RETENTION_DAYS: logErrorRetentionDays,
    LOG_BODY: logBody,
    ALLOW_SEED: allowSeed,
    ...(seedDefaultPassword
      ? { SEED_DEFAULT_PASSWORD: seedDefaultPassword }
      : {}),
  };
}

function readNodeEnv(value: unknown, errors: string[]): NodeEnv {
  const normalized = readOptionalString(value);
  if (!normalized) return 'development';
  if (
    normalized === 'development' ||
    normalized === 'test' ||
    normalized === 'production'
  )
    return normalized;
  errors.push('NODE_ENV must be one of development, test or production.');
  return 'development';
}

function readRequiredString(
  name: string,
  value: unknown,
  fallback: string,
  errors: string[],
): string {
  const normalized = readOptionalString(value) ?? fallback;
  if (normalized.length === 0) errors.push(`${name} must not be empty.`);
  return normalized;
}

function readOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function isPlaceholderSecret(value: string): boolean {
  return /replace|change[_-]?me|example|secret/i.test(value);
}

function readNumber(
  name: string,
  value: unknown,
  fallback: number,
  errors: string[],
): number {
  if (value == null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    errors.push(`${name} must be a positive integer.`);
    return fallback;
  }
  return parsed;
}

function readBoolean(
  name: string,
  value: unknown,
  fallback: boolean,
  errors: string[],
): boolean {
  if (value == null || value === '') return fallback;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  errors.push(`${name} must be either true or false.`);
  return fallback;
}

function readCsv(value: unknown, fallback: string[]): string[] {
  if (typeof value !== 'string' || value.trim().length === 0) return fallback;
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}
