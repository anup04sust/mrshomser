/**
 * Structured Logging System
 * 
 * Provides consistent, context-aware logging across the application.
 * Replaces scattered console.log statements with structured logs.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  chatId?: string;
  messageId?: string;
  path?: string;
  method?: string;
  duration?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private minLevel: LogLevel;
  private debugAI: boolean;
  
  constructor() {
    // Determine log level from environment
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    this.minLevel = LogLevel[envLevel as keyof typeof LogLevel] || LogLevel.INFO;
    
    // Enable AI debugging if flag is set
    this.debugAI = process.env.DEBUG_AI === 'true' || process.env.DEBUG_AI === '1';
  }
  
  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const minIndex = levels.indexOf(this.minLevel);
    const currentIndex = levels.indexOf(level);
    return currentIndex >= minIndex;
  }
  
  /**
   * Sanitize context to remove sensitive data
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;
    
    const sanitized = { ...context };
    
    // List of sensitive keys to redact
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'authorization',
      'cookie',
      'apiKey',
      'api_key',
      'jwt',
    ];
    
    // Redact sensitive fields
    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
  
  /**
   * Format and output a log entry
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeContext(context),
    };
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }
    
    // Format output based on environment
    if (process.env.NODE_ENV === 'development') {
      // Pretty-print for development
      const color = this.getLevelColor(level);
      const reset = '\x1b[0m';
      console.log(`${color}[${entry.timestamp}] ${level}${reset}: ${message}`);
      
      if (entry.context && Object.keys(entry.context).length > 0) {
        console.log('  Context:', JSON.stringify(entry.context, null, 2));
      }
      
      if (entry.error) {
        console.error('  Error:', entry.error.message);
        if (entry.error.stack) {
          console.error('  Stack:', entry.error.stack);
        }
      }
    } else {
      // JSON output for production (easier for log aggregators)
      console.log(JSON.stringify(entry));
    }
  }
  
  /**
   * Get ANSI color code for log level
   */
  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '\x1b[36m'; // Cyan
      case LogLevel.INFO: return '\x1b[32m'; // Green
      case LogLevel.WARN: return '\x1b[33m'; // Yellow
      case LogLevel.ERROR: return '\x1b[31m'; // Red
      default: return '\x1b[0m'; // Reset
    }
  }
  
  // Public API
  
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }
  
  error(message: string, contextOrError?: LogContext | Error, error?: Error): void {
    if (contextOrError instanceof Error) {
      this.log(LogLevel.ERROR, message, undefined, contextOrError);
    } else {
      this.log(LogLevel.ERROR, message, contextOrError, error);
    }
  }
  
  /**
   * AI-specific logging (only outputs if DEBUG_AI is enabled)
   */
  ai(message: string, context?: LogContext): void {
    if (this.debugAI) {
      this.debug(`[AI] ${message}`, context);
    }
  }
  
  /**
   * Create a child logger with preset context
   */
  child(context: LogContext): ChildLogger {
    return new ChildLogger(this, context);
  }
  
  /**
   * Log request start
   */
  requestStart(method: string, path: string, context?: LogContext): void {
    this.info(`${method} ${path}`, {
      ...context,
      method,
      path,
    });
  }
  
  /**
   * Log request completion
   */
  requestEnd(method: string, path: string, status: number, duration: number, context?: LogContext): void {
    const level = status >= 500 ? LogLevel.ERROR : status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `${method} ${path} ${status}`, {
      ...context,
      method,
      path,
      status,
      duration,
    });
  }
}

/**
 * Child logger with preset context
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private baseContext: LogContext
  ) {}
  
  private mergeContext(context?: LogContext): LogContext {
    return { ...this.baseContext, ...context };
  }
  
  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, this.mergeContext(context));
  }
  
  info(message: string, context?: LogContext): void {
    this.parent.info(message, this.mergeContext(context));
  }
  
  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, this.mergeContext(context));
  }
  
  error(message: string, contextOrError?: LogContext | Error, error?: Error): void {
    if (contextOrError instanceof Error) {
      this.parent.error(message, undefined, contextOrError);
    } else {
      this.parent.error(message, this.mergeContext(contextOrError), error);
    }
  }
  
  ai(message: string, context?: LogContext): void {
    this.parent.ai(message, this.mergeContext(context));
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for child loggers
export type { ChildLogger };

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a logger for an API route with request context
 */
export function createRouteLogger(req: Request): ChildLogger {
  const url = new URL(req.url);
  return logger.child({
    requestId: generateRequestId(),
    method: req.method,
    path: url.pathname,
  });
}
