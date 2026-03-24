// Environment configuration validation
// Ensures required environment variables are set and secure

const WEAK_SECRETS = [
  'your-secret-key-change-in-production',
  'your-super-secret-jwt-key-change-this-in-production-123456',
  'change-me',
  'secret',
  'jwt-secret',
];

export function validateEnvConfig() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // JWT_SECRET validation
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    errors.push('JWT_SECRET is required but not set');
  } else if (jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  } else if (WEAK_SECRETS.includes(jwtSecret)) {
    errors.push('JWT_SECRET is using a default/weak value. Generate a secure secret!');
  }

  // Ollama configuration
  if (!process.env.OLLAMA_API_URL) {
    warnings.push('OLLAMA_API_URL not set, using default: http://ollama:11434');
  }

  if (!process.env.OLLAMA_MODEL) {
    warnings.push('OLLAMA_MODEL not set, using default: phi3:mini');
  }

  // MongoDB configuration
  if (!process.env.MONGODB_URI) {
    errors.push('MONGODB_URI is required but not set');
  }

  if (!process.env.MONGODB_DB) {
    warnings.push('MONGODB_DB not set, using default: mrshomser');
  }

  // In production, be strict
  if (process.env.NODE_ENV === 'production') {
    if (warnings.length > 0) {
      errors.push(...warnings.map(w => `PRODUCTION ERROR: ${w}`));
    }
  }

  return { errors, warnings };
}

export function getConfig() {
  const validation = validateEnvConfig();

  // Log warnings
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Configuration warnings:');
    validation.warnings.forEach(w => console.warn(`  - ${w}`));
  }

  // Fail if errors exist
  if (validation.errors.length > 0) {
    console.error('❌ Configuration errors:');
    validation.errors.forEach(e => console.error(`  - ${e}`));
    throw new Error('Invalid configuration. Check environment variables.');
  }

  return {
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: '30d',
    },
    ollama: {
      apiUrl: process.env.OLLAMA_API_URL || 'http://ollama:11434',
      model: process.env.OLLAMA_MODEL || 'phi3:mini',
    },
    mongodb: {
      uri: process.env.MONGODB_URI!,
      db: process.env.MONGODB_DB || 'mrshomser',
    },
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'Mr Shomser',
      nodeEnv: process.env.NODE_ENV || 'development',
      isProduction: process.env.NODE_ENV === 'production',
    },
  };
}

// Export validated config
export const config = getConfig();
