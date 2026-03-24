/**
 * Zod schemas for request/response validation
 * 
 * These schemas provide:
 * - Runtime validation of API inputs
 * - Type-safe TypeScript types derived from schemas
 * - Clear error messages for invalid data
 * - Single source of truth for data structures
 */

import { z } from 'zod';

// ============================================================================
// User Schemas
// ============================================================================

/**
 * User registration request
 */
export const registerRequestSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

/**
 * User login request
 */
export const loginRequestSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

/**
 * User response (safe to send to client)
 */
export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.number().optional(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

/**
 * User document in database (includes password hash)
 */
export const userDocumentSchema = userResponseSchema.extend({
  password: z.string(), // hashed password
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type UserDocument = z.infer<typeof userDocumentSchema>;

// ============================================================================
// Chat Schemas
// ============================================================================

/**
 * Message role enum
 */
export const messageRoleSchema = z.enum(['user', 'assistant', 'system']);

export type MessageRole = z.infer<typeof messageRoleSchema>;

/**
 * Message status enum (for streaming persistence)
 */
export const messageStatusSchema = z.enum(['pending', 'streaming', 'complete', 'failed']);

export type MessageStatus = z.infer<typeof messageStatusSchema>;

/**
 * Chat message
 */
export const messageSchema = z.object({
  id: z.string(),
  role: messageRoleSchema,
  content: z.string(),
  timestamp: z.number(),
  status: messageStatusSchema.optional().default('complete'),
  error: z.string().optional(), // Error message if status is 'failed'
});

export type Message = z.infer<typeof messageSchema>;

/**
 * Chat document
 */
export const chatSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(messageSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
  // Ownership fields (exclusive - either userId OR sessionId, not both)
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type Chat = z.infer<typeof chatSchema>;

/**
 * Chat creation request
 */
export const createChatRequestSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim()
    .optional()
    .default('New Chat'),
  message: z.string()
    .min(1, 'Message is required')
    .max(10000, 'Message must be less than 10,000 characters')
    .optional(),
});

export type CreateChatRequest = z.infer<typeof createChatRequestSchema>;

/**
 * Chat update request
 */
export const updateChatRequestSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim()
    .optional(),
  messages: z.array(messageSchema).optional(),
});

export type UpdateChatRequest = z.infer<typeof updateChatRequestSchema>;

/**
 * Send message request
 */
export const sendMessageRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(10000, 'Message must be less than 10,000 characters'),
  chatId: z.string().optional(),
  model: z.string().optional(),
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).optional(), // For backward compatibility with direct message array
});

export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>;

// ============================================================================
// API Response Schemas
// ============================================================================

/**
 * Standard success response
 */
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any().optional(),
  message: z.string().optional(),
});

export type SuccessResponse = z.infer<typeof successResponseSchema>;

/**
 * Standard error response
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Auth response (login/register)
 */
export const authResponseSchema = z.object({
  success: z.boolean(),
  user: userResponseSchema.optional(),
  migratedChats: z.number().optional(),
  error: z.string().optional(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates request body against a schema
 * Returns parsed data on success, throws on failure
 */
export async function validateRequestBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new ValidationError(messages.join('; '));
    }
    throw error;
  }
}

/**
 * Validates data against a schema
 * Returns parsed data on success, throws on failure
 */
export function validateData<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new ValidationError(messages.join('; '));
    }
    throw error;
  }
}

/**
 * Safely parses data against a schema
 * Returns { success: true, data } or { success: false, error }
 */
export function safeValidateData<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const messages = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
  return { success: false, error: messages.join('; ') };
}

/**
 * Custom validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// MongoDB Object ID Validation
// ============================================================================

/**
 * Validates MongoDB ObjectId format
 */
export const objectIdSchema = z.string().regex(
  /^[0-9a-fA-F]{24}$/,
  'Invalid ObjectId format'
);

export type ObjectId = z.infer<typeof objectIdSchema>;

// ============================================================================
// Environment Variable Schemas
// ============================================================================

/**
 * Environment configuration schema
 */
export const envConfigSchema = z.object({
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  
  // Ollama
  OLLAMA_API_URL: z.string().url('OLLAMA_API_URL must be a valid URL'),
  OLLAMA_MODEL: z.string().min(1, 'OLLAMA_MODEL is required'),
  
  // MongoDB
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB: z.string().min(1, 'MONGODB_DB is required'),
  
  // App
  NEXT_PUBLIC_APP_NAME: z.string().optional().default('Mr Shomser'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
});

export type EnvConfig = z.infer<typeof envConfigSchema>;
