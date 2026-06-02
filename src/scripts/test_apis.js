/**
 * test_apis.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated API verification script.
 * Performs a comprehensive test suite of ~80+ API endpoint scenarios.
 * Captures status codes, checks responses, and summarizes the results beautifully.
 *
 * Runs locally using Node's native fetch API.
 * Ensure the server is running on http://localhost:5000 before executing.
 */

import 'dotenv/config';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = 'http://localhost:5000';
const __dirname = dirname(fileURLToPath(import.meta.url));

// We'll store test results here
const results = [];
let userToken = null;
let testAppId = 3057270; // From Seafarer's Gambit in the seeded DB
let testReviewId = null;

// Helpers for gorgeous logs
const logPass = (name) => console.log(`  ✅  PASS: ${name}`);
const logFail = (name, err) => {
  console.error(`  ❌  FAIL: ${name}`);
  if (err) console.error(`      Detail: ${err}`);
};

/**
 * Perform a single request and log results
 */
async function testRequest(category, name, path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const method = options.method || 'GET';
  
  if (userToken && !options.headers?.['Authorization'] && !options.noAuth) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${userToken}`
    };
  }

  const result = {
    category,
    name,
    method,
    path,
    status: null,
    passed: false,
    error: null
  };

  try {
    const res = await fetch(url, options);
    result.status = res.status;
    
    let body = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json') && method !== 'HEAD') {
      body = await res.json();
    } else if (method !== 'HEAD') {
      body = await res.text();
    }

    // Custom assertion conditions per test case
    let passed = res.ok;
    
    // Explicit expectations
    if (options.expectedStatuses !== undefined) {
      passed = options.expectedStatuses.includes(res.status);
    } else if (options.expectedStatus !== undefined) {
      passed = res.status === options.expectedStatus;
    }

    if (passed && options.validateBody) {
      passed = options.validateBody(body, res);
    }

    result.passed = passed;
    result.responseBody = body;

    if (passed) {
      logPass(`${category} - ${name} (${method} ${path}) [Status: ${res.status}]`);
    } else {
      const errorMsg = body && typeof body === 'object' ? JSON.stringify(body) : String(body);
      result.error = `Status: ${res.status}, Body: ${errorMsg}`;
      logFail(`${category} - ${name} (${method} ${path})`, result.error);
    }

    // Extract dynamic variables
    if (options.extractData) {
      options.extractData(body);
    }

  } catch (err) {
    result.error = err.message;
    logFail(`${category} - ${name} (${method} ${path})`, err.message);
  }

  results.push(result);
  return result;
}

/** Promote test user to admin directly in MongoDB using a script invocation */
async function promoteUserToAdmin() {
  console.log('\n👑  Promoting test user to admin in DB...');
  try {
    const connectDB = (await import('../config/db.js')).default;
    const User = (await import('../models/User.js')).default;
    
    await connectDB();
    const updated = await User.findOneAndUpdate(
      { email: 'test_user_verify@example.com' },
      { $set: { role: 'admin', isAdmin: true } },
      { new: true }
    );
    if (updated) {
      console.log(`    Successfully promoted ${updated.email} to ${updated.role}`);
    } else {
      console.log('    ⚠️  Could not promote user: User not found in DB.');
    }
  } catch (err) {
    console.error('    ⚠️  Failed to connect and promote user via DB driver:', err.message);
  }
}

async function runTests() {
  console.log('=====================================================');
  console.log('🚀  STARTING STEAM DATA API VERIFICATION TEST SUITE  ');
  console.log('=====================================================');

  // ──── 1. PUBLIC SYSTEM & HEALTH ────
  console.log('\n📁  Group 1: Public System & Health Check');
  await testRequest('System', 'Root endpoint', '/');
  await testRequest('System', 'Health endpoint', '/api/v1/health');
  await testRequest('System', 'System info', '/api/v1/system/info');
  await testRequest('System', 'System version', '/api/v1/system/version');

  // ──── 2. AUTH FLOW (Registration & Login) ────
  console.log('\n📁  Group 2: Auth Flow');
  
  // Register a test user
  const email = `test_user_verify@example.com`;
  const registerBody = {
    name: 'Verification Tester',
    email,
    password: 'password123',
    username: 'verifier_test'
  };

  await testRequest('Auth', 'Register new user', '/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerBody),
    expectedStatuses: [201, 409],
    validateBody: (body, res) => {
      if (res.status === 201) return body.success === true;
      if (res.status === 409) return body.success === false && body.message.includes('already exists');
      return false;
    },
    extractData: (body) => {
      if (body?.data?.token) {
        userToken = body.data.token;
      }
    }
  });

  // If registration failed because they already exist, try to log in
  if (!userToken) {
    console.log('    ℹ️  User already exists, attempting to log in...');
    await testRequest('Auth', 'Login existing user', '/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
      expectedStatus: 200,
      validateBody: (body) => body.success === true,
      extractData: (body) => {
        if (body?.data?.token) {
          userToken = body.data.token;
        }
      }
    });
  }

  // Get and check profile
  if (userToken) {
    await testRequest('Auth', 'Fetch User Profile', '/api/v1/auth/profile', {
      validateBody: (body) => body.success === true && body.data.email === email
    });

    await testRequest('Auth', 'Update User Profile', '/api/v1/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Verification Tester Updated' }),
      validateBody: (body) => body.success === true && body.data.name === 'Verification Tester Updated'
    });

    await testRequest('Auth', 'Send OTP', '/api/v1/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      validateBody: (body) => body.success === true && body.data?.otpCode !== undefined
    });

    await testRequest('Auth', 'Forgot Password', '/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      validateBody: (body) => body.success === true && body.data?.resetToken !== undefined
    });
  }

  // ──── 3. LEGACY USER CRUD ────
  console.log('\n📁  Group 3: Legacy Users');
  await testRequest('Legacy Users', 'Fetch legacy users', '/api/users', {
    noAuth: true,
    expectedStatus: 405
  });

  // ──── 4. CORE GAMES RETRIEVAL ────
  console.log('\n📁  Group 4: Core Games Retrieval');
  await testRequest('Games', 'Get games list', '/api/games', {
    noAuth: true,
    validateBody: (body) => body.data && Array.isArray(body.data.data) && body.data.data.length > 0
  });

  await testRequest('Games', 'Get game by valid appid', `/api/games/${testAppId}`, {
    noAuth: true,
    validateBody: (body) => body.data && body.data.appid === testAppId
  });

  await testRequest('Games', 'Get game by non-existent appid (404 check)', '/api/games/999999', {
    noAuth: true,
    expectedStatus: 404,
    validateBody: (body) => body.success === false
  });

  // ──── 5. FILTERS ────
  console.log('\n📁  Group 5: Filter Endpoints');
  const filters = [
    'free-to-play', 'paid', 'discounted', 'early-access', 'vr-only',
    'controller-support', 'multiplayer', 'singleplayer', 'coop',
    'open-world', 'survival', 'horror', 'anime', 'indie', 'top-rated'
  ];
  for (const f of filters) {
    await testRequest('Filters', `Filter: ${f}`, `/api/games/filter/${f}`, { noAuth: true });
  }

  // ──── 6. SORTS ────
  console.log('\n📁  Group 6: Sort Endpoints');
  const sorts = ['price-desc', 'rating-desc', 'downloads-desc', 'releaseDate-desc', 'popularity-desc'];
  for (const s of sorts) {
    await testRequest('Sorts', `Sort: ${s}`, `/api/games/sort/${s}`, { noAuth: true });
  }

  // ──── 7. PARAMETER SEARCHES ────
  console.log('\n📁  Group 7: Parameter Searches');
  const paramTests = [
    { name: 'Genre: Action', path: '/api/games/genre/Action' },
    { name: 'Developer: Valve', path: '/api/games/developer/Valve' },
    { name: 'Publisher: Valve', path: '/api/games/publisher/Valve' },
    { name: 'Platform: windows', path: '/api/games/platform/windows' },
    { name: 'Tag: Indie', path: '/api/games/tag/Indie' },
    { name: 'Release Year: 2024', path: '/api/games/release-year/2024' },
    { name: 'Min Rating: 8', path: '/api/games/rating/8' },
    { name: 'Max Price: 10', path: '/api/games/price/10' },
    { name: 'Feature: Coop', path: '/api/games/feature/coop' }
  ];
  for (const p of paramTests) {
    await testRequest('Parameters', p.name, p.path, { noAuth: true });
  }

  // ──── 8. SEARCH ────
  console.log('\n📁  Group 8: Search');
  await testRequest('Search', 'Search for Gambit', '/api/v1/search?q=Gambit', { noAuth: true });

  // ──── 9. SUB-RESOURCES ────
  console.log('\n📁  Group 9: Per-Game Sub-resources');
  const subResources = [
    'exists', 'summary', 'update-history', 'related', 'screenshots', 'trailers',
    'reviews', 'system-requirements', 'dlc', 'achievements', 'leaderboard',
    'updates', 'news'
  ];
  for (const sr of subResources) {
    await testRequest('Sub-resources', `Sub-resource: ${sr}`, `/api/games/${testAppId}/${sr}`, { noAuth: true });
  }

  // Add review to a game
  await testRequest('Sub-resources', 'Add a review', `/api/games/${testAppId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review: 'This is a great test review!', rating: 9, author: 'Verifier' }),
    noAuth: true,
    expectedStatus: 201,
    extractData: (body) => {
      // Find the last review ID
      if (body?.reviews && body.reviews.length > 0) {
        testReviewId = body.reviews[body.reviews.length - 1]._id;
      }
    }
  });

  if (testReviewId) {
    await testRequest('Sub-resources', 'Update a review', `/api/games/${testAppId}/reviews/${testReviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review: 'Updated test review content!', rating: 10 }),
      noAuth: true,
      expectedStatus: 200
    });

    await testRequest('Sub-resources', 'Delete a review', `/api/games/${testAppId}/reviews/${testReviewId}`, {
      method: 'DELETE',
      noAuth: true,
      expectedStatus: 200
    });
  }

  // ──── 10. GAMES CRUD OPERATIONS (Single Resource) ────
  console.log('\n📁  Group 10: Game CRUD Operations');
  const dummyAppid = 999999;
  const dummyGame = {
    appid: dummyAppid,
    title: 'Verification Sandbox Game',
    developer: 'QA Labs',
    publisher: 'QA Labs',
    price: 4.99, // Plain number — now successfully normalized by gameService
    rating: 8.5,
    genres: ['Action', 'Indie']
  };

  // POST create
  await testRequest('CRUD', 'Create game', '/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dummyGame),
    noAuth: true,
    expectedStatus: 201
  });

  // PUT replace
  await testRequest('CRUD', 'Replace game (PUT)', `/api/games/${dummyAppid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...dummyGame, developer: 'QA Labs Updated' }),
    noAuth: true,
    expectedStatus: 200
  });

  // PATCH update
  await testRequest('CRUD', 'Update game (PATCH)', `/api/games/${dummyAppid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: 9.9 }),
    noAuth: true,
    expectedStatus: 200
  });

  // DELETE
  await testRequest('CRUD', 'Delete game', `/api/games/${dummyAppid}`, {
    method: 'DELETE',
    noAuth: true,
    expectedStatus: 200
  });

  // ──── 11. MIDDLEWARE DEMOS ────
  console.log('\n📁  Group 11: Middleware Demos');
  await testRequest('Middleware Demo', 'Logger endpoint', '/api/v1/middleware/logger', { noAuth: true });
  await testRequest('Middleware Demo', 'Auth limiter', '/api/v1/middleware/auth', { noAuth: true });
  await testRequest('Middleware Demo', 'General limiter', '/api/v1/middleware/rate-limit', { noAuth: true });
  
  // Custom error handler paths
  const errorTypes = ['validation', 'cast', 'duplicate', 'custom', 'default'];
  for (const t of errorTypes) {
    let expectedCode = 500;
    if (t === 'custom') expectedCode = 418;
    else if (t === 'validation' || t === 'cast') expectedCode = 400;
    else if (t === 'duplicate') expectedCode = 409;

    await testRequest('Middleware Demo', `Error test: ${t}`, `/api/v1/middleware/error-handler?type=${t}`, {
      noAuth: true,
      expectedStatus: expectedCode
    });
  }

  // ──── 12. ADVANCED ROUTES ────
  console.log('\n📁  Group 12: Advanced Endpoints');
  await testRequest('Advanced', 'Random Game', '/api/v1/games/random', { noAuth: true });
  await testRequest('Advanced', 'Trending Games', '/api/v1/trending/games', { noAuth: true });
  await testRequest('Advanced', 'Latest News', '/api/v1/news/latest', { noAuth: true });
  await testRequest('Advanced', 'Trending News', '/api/v1/news/trending', { noAuth: true });
  await testRequest('Advanced', 'Activity logs', '/api/v1/activity/logs', { noAuth: true });
  await testRequest('Advanced', 'Recommendations', `/api/v1/recommendations/games/${testAppId}`, { noAuth: true });
  await testRequest('Advanced', 'Game Timeline', `/api/v1/timeline/game/${testAppId}`, { noAuth: true });
  await testRequest('Advanced', 'Compare Games', `/api/v1/compare/games/${testAppId}/${testAppId}`, { noAuth: true });

  // ──── 13. NOTIFICATIONS (IN-MEMORY) ────
  console.log('\n📁  Group 13: In-Memory Notifications');
  let testNotificationId = null;
  await testRequest('Notifications', 'Get notifications', '/api/v1/notifications', {
    noAuth: true,
    validateBody: (body) => {
      const items = body?.data?.items || [];
      if (items.length > 0) {
        testNotificationId = items[0].id;
        return true;
      }
      return false;
    }
  });

  if (testNotificationId) {
    await testRequest('Notifications', 'Mark notification read', `/api/v1/notifications/read/${testNotificationId}`, {
      method: 'PATCH',
      noAuth: true,
      expectedStatus: 200
    });

    await testRequest('Notifications', 'Delete notification', `/api/v1/notifications/${testNotificationId}`, {
      method: 'DELETE',
      noAuth: true,
      expectedStatus: 200
    });
  }

  // ──── 14. JWT SPECIAL ENDPOINTS ────
  console.log('\n📁  Group 14: JWT Protected Endpoints');
  if (userToken) {
    await testRequest('JWT', 'JWT Profile (auth-guarded)', '/api/v1/jwt/profile');
    await testRequest('JWT', 'JWT Dashboard (auth-guarded)', '/api/v1/jwt/dashboard');
    await testRequest('JWT', 'JWT Private Games list', '/api/v1/jwt/private-games');
    await testRequest('JWT', 'JWT Private Analytics', '/api/v1/jwt/private-analytics');
    
    await testRequest('JWT', 'JWT Verify Token', '/api/v1/jwt/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: userToken })
    });

    await testRequest('JWT', 'JWT Refresh Token', '/api/v1/jwt/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: userToken }),
      validateBody: (body) => body.success === true && body.data?.token !== undefined
    });
  }

  // ──── 15. ADMIN OPERATIONS (Role-Guarded) ────
  console.log('\n📁  Group 15: Admin Endpoints');
  // Promote the test user to admin directly in MongoDB first so that their token carries the admin role
  await promoteUserToAdmin();

  // Relogin the test user so the new JWT includes role: admin
  let adminToken = null;
  await testRequest('Admin', 'Login admin user to get upgraded token', '/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
    expectedStatus: 200,
    extractData: (body) => {
      if (body?.data?.token) {
        adminToken = body.data.token;
      }
    }
  });

  if (adminToken) {
    // Admin routes
    await testRequest('Admin', 'Admin games list (incl. archived)', '/api/v1/admin/games', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    await testRequest('Admin', 'Admin aggregated analytics', '/api/v1/admin/analytics', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    await testRequest('Admin', 'Admin reports summary', '/api/v1/admin/reports', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    // JWT Admin-only endpoint
    await testRequest('Admin', 'JWT Generate arbitrary token', '/api/v1/jwt/generate-token', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ payload: { test: 'arbitrary' }, expiresIn: '15m' }),
      expectedStatus: 201
    });
  }

  // ──── 16. REVOKE / DE-AUTH ────
  console.log('\n📁  Group 16: Revocation');
  if (userToken) {
    await testRequest('Revocation', 'Revoke active token', '/api/v1/jwt/revoke-token', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
  }

  // ──── 17. HTTP METHODS (HEAD & OPTIONS) ────
  console.log('\n📁  Group 17: HTTP Methods (HEAD + OPTIONS)');
  
  await testRequest('HTTP Methods', 'OPTIONS games collection', '/api/games', {
    method: 'OPTIONS',
    noAuth: true,
    expectedStatus: 204
  });

  await testRequest('HTTP Methods', 'HEAD games collection', '/api/games', {
    method: 'HEAD',
    noAuth: true,
    expectedStatus: 200
  });

  await testRequest('HTTP Methods', 'OPTIONS health check', '/api/v1/health', {
    method: 'OPTIONS',
    noAuth: true,
    expectedStatus: 204
  });

  await testRequest('HTTP Methods', 'HEAD health check', '/api/v1/health', {
    method: 'HEAD',
    noAuth: true,
    expectedStatus: 200
  });

  // =====================================================
  // 🏁  VERIFICATION RUN SUMMARY
  // =====================================================
  console.log('\n=====================================================');
  console.log('🏁  VERIFICATION TEST SUMMARY                        ');
  console.log('=====================================================');
  
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  
  console.log(`📊  Total Tests: ${total}`);
  console.log(`✅  Passed:      ${passed}`);
  console.log(`❌  Failed:      ${failed}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Failing tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.category} → ${r.name} (${r.method} ${r.path})`);
      console.log(`     Error: ${r.error}`);
    });
  } else {
    console.log('\n🎉  ALL TESTS PASSED! Project API is 100% healthy and compliant!  ');
  }
  console.log('=====================================================');
  
  // Write report to artifacts folder or root
  const summaryText = results.map(r => 
    `[${r.passed ? 'PASS' : 'FAIL'}] [Status: ${r.status || 'ERR'}] ${r.category} - ${r.name} (${r.method} ${r.path})`
  ).join('\n');
  
  writeFileSync(resolve(__dirname, '..', '..', 'api_test_results.txt'), summaryText);
  console.log('💾  Verification test results saved to api_test_results.txt\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Fatal testing exception:', err);
  process.exit(1);
});
