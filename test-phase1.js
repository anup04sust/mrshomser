#!/usr/bin/env node

/**
 * Automated Phase 1 Test Suite
 * 
 * Tests config validation, Zod schemas, and API endpoints
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const USE_HTTPS = BASE_URL.startsWith('https');

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function success(message) { log(colors.green, '✓', message); }
function error(message) { log(colors.red, '✗', message); }
function info(message) { log(colors.blue, 'ℹ', message); }
function warn(message) { log(colors.yellow, '⚠', message); }

// Simple HTTP request wrapper
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const lib = USE_HTTPS ? https : http;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Test suite
const tests = {
  async testZodValidation() {
    info('Testing Zod schema validation...');
    
    // Test 1: Invalid email format
    try {
      const res = await request('POST', '/api/auth/register', {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      });
      
      if (res.status === 400 && res.data.error && res.data.error.includes('Invalid email')) {
        success('Invalid email rejected');
      } else {
        error(`Invalid email should be rejected (got ${res.status})`);
      }
    } catch (e) {
      error(`Invalid email test failed: ${e.message}`);
    }
    
    // Test 2: Short password
    try {
      const res = await request('POST', '/api/auth/register', {
        email: 'test@example.com',
        password: 'short',
        name: 'Test User',
      });
      
      if (res.status === 400 && res.data.error && res.data.error.includes('at least 8 characters')) {
        success('Short password rejected');
      } else {
        error(`Short password should be rejected (got ${res.status})`);
      }
    } catch (e) {
      error(`Short password test failed: ${e.message}`);
    }
    
    // Test 3: Missing fields
    try {
      const res = await request('POST', '/api/auth/register', {
        email: 'test@example.com',
        // missing password and name
      });
      
      if (res.status === 400 && res.data.error) {
        success('Missing fields rejected');
      } else {
        error(`Missing fields should be rejected (got ${res.status})`);
      }
    } catch (e) {
      error(`Missing fields test failed: ${e.message}`);
    }
    
    // Test 4: Invalid login credentials format
    try {
      const res = await request('POST', '/api/auth/login', {
        email: 'not-an-email',
        password: '',
      });
      
      if (res.status === 400) {
        success('Invalid login format rejected');
      } else {
        error(`Invalid login format should be rejected (got ${res.status})`);
      }
    } catch (e) {
      error(`Invalid login format test failed: ${e.message}`);
    }
  },
  
  async testApiEndpoints() {
    info('Testing API endpoints availability...');
    
    // Test 1: GET /api/chats (should work for guest)
    try {
      const res = await request('GET', '/api/chats');
      
      if (res.status === 200 && res.data.chats !== undefined) {
        success('GET /api/chats returns 200 with chats array');
      } else {
        warn(`GET /api/chats returned ${res.status}`);
      }
    } catch (e) {
      error(`GET /api/chats failed: ${e.message}`);
    }
    
    // Test 2: POST /api/chats (create chat)
    try {
      const res = await request('POST', '/api/chats', {
        title: 'Test Chat from Automated Test',
      });
      
      if (res.status === 200 && res.data.chat) {
        success('POST /api/chats creates chat successfully');
        return res.data.chat.id; // Return chat ID for further tests
      } else {
        warn(`POST /api/chats returned ${res.status}`);
      }
    } catch (e) {
      error(`POST /api/chats failed: ${e.message}`);
    }
    
    return null;
  },
  
  async testChatOwnership(chatId) {
    if (!chatId) {
      warn('Skipping ownership test (no chat ID)');
      return;
    }
    
    info('Testing chat ownership...');
    
    // Test: GET /api/chats/[id] should return the created chat
    try {
      const res = await request('GET', `/api/chats/${chatId}`);
      
      if (res.status === 200 && res.data.chat) {
        success(`GET /api/chats/${chatId} returns chat`);
      } else if (res.status === 404) {
        warn('Chat not found (might be ownership issue)');
      } else {
        warn(`GET /api/chats/[id] returned ${res.status}`);
      }
    } catch (e) {
      error(`GET /api/chats/[id] failed: ${e.message}`);
    }
  },
  
  async testAuthEndpoints() {
    info('Testing authentication endpoints...');
    
    // Test: POST /api/auth/me without token
    try {
      const res = await request('GET', '/api/auth/me');
      
      if (res.status === 401) {
        success('GET /api/auth/me returns 401 without token');
      } else {
        warn(`Expected 401 for unauthenticated /api/auth/me, got ${res.status}`);
      }
    } catch (e) {
      error(`GET /api/auth/me failed: ${e.message}`);
    }
  },
};

// Run all tests
async function runTests() {
  console.log('\n' + colors.cyan + '╔═══════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + '║   Phase 1 Automated Test Suite       ║' + colors.reset);
  console.log(colors.cyan + '╚═══════════════════════════════════════╝' + colors.reset);
  console.log(`\n${colors.blue}Target:${colors.reset} ${BASE_URL}\n`);
  
  try {
    // Test server availability
    info('Checking server availability...');
    const healthCheck = await request('GET', '/api/chats').catch(() => null);
    
    if (!healthCheck) {
      error('Server is not responding. Make sure dev server is running:');
      console.log('  ddev exec pnpm dev');
      process.exit(1);
    }
    
    success('Server is responding\n');
    
    // Run test suites
    await tests.testZodValidation();
    console.log('');
    
    await tests.testAuthEndpoints();
    console.log('');
    
    const chatId = await tests.testApiEndpoints();
    console.log('');
    
    await tests.testChatOwnership(chatId);
    console.log('');
    
    console.log(colors.green + '✓ Automated tests complete!' + colors.reset);
    console.log('\n' + colors.yellow + 'Note: Manual testing still required for:' + colors.reset);
    console.log('  • Guest-to-user chat migration');
    console.log('  • Cross-device continuity');
    console.log('  • Browser cookie handling');
    console.log('  • UI interactions');
    console.log(`\nSee ${colors.cyan}PHASE1_TEST_PLAN.md${colors.reset} for full test suite.\n`);
    
  } catch (err) {
    error(`Test suite failed: ${err.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests, request };
