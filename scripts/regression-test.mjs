/**
 * Comprehensive Automated Regression Test Suite for Al-Souq
 * Validates production readiness, authentication, database persistence, security, and smart features.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failedCount++;
  }
}

async function runTests() {
  console.log(`\n=======================================================`);
  console.log(`🚀 Starting Al-Souq Regression Test Suite on ${BASE_URL}`);
  console.log(`=======================================================\n`);

  // -------------------------------------------------------------------------
  // Test 1: Static Assets & Favicons
  // -------------------------------------------------------------------------
  console.log(`🔍 1. Static Assets, Favicon & Manifest`);
  try {
    const resIcon = await fetch(`${BASE_URL}/icon.svg`);
    assert(
      resIcon.status === 200 && resIcon.headers.get('content-type')?.includes('svg'),
      'Favicon /icon.svg returns HTTP 200 with image/svg+xml'
    );

    const resManifest = await fetch(`${BASE_URL}/manifest.json`);
    const manifest = await resManifest.json();
    assert(
      resManifest.status === 200 && manifest.name?.includes('Al-Souq'),
      'PWA manifest /manifest.json is valid and branded'
    );
  } catch (err) {
    assert(false, 'Static assets check', err.message);
  }

  // -------------------------------------------------------------------------
  // Test 2: Security Headers
  // -------------------------------------------------------------------------
  console.log(`\n🔍 2. Production Security Headers`);
  try {
    const res = await fetch(`${BASE_URL}/`);
    assert(
      res.headers.get('x-content-type-options') === 'nosniff',
      'X-Content-Type-Options is nosniff'
    );
    assert(
      res.headers.get('x-frame-options') === 'SAMEORIGIN',
      'X-Frame-Options is SAMEORIGIN'
    );
    assert(
      res.headers.get('referrer-policy') === 'strict-origin-when-cross-origin',
      'Referrer-Policy is strict-origin-when-cross-origin'
    );
  } catch (err) {
    assert(false, 'Security headers check', err.message);
  }

  // -------------------------------------------------------------------------
  // Test 3: Diagnostic Endpoint Protection
  // -------------------------------------------------------------------------
  console.log(`\n🔍 3. Public Diagnostic Protection`);
  try {
    const resDiag = await fetch(`${BASE_URL}/api/diag`);
    const diagData = await resDiag.json();
    assert(resDiag.status === 200, 'Diagnostic endpoint returns HTTP 200');
    assert(diagData.users === undefined, 'No raw user list or emails exposed in /api/diag');

    const resCleanUnauthorized = await fetch(`${BASE_URL}/api/diag?clean=true`);
    assert(
      resCleanUnauthorized.status === 401,
      'Unauthenticated data wipe (?clean=true) is blocked with HTTP 401'
    );
  } catch (err) {
    assert(false, 'Diagnostic protection check', err.message);
  }

  // -------------------------------------------------------------------------
  // Test 4: Password Security & Leak Prevention
  // -------------------------------------------------------------------------
  console.log(`\n🔍 4. Authentication Security & Zero Password Leaks`);
  try {
    const resBadLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'nonexistent@community.org',
        password: 'wrongpassword',
      }),
    });
    const badLoginData = await resBadLogin.json();
    assert(resBadLogin.status === 401, 'Invalid login rejected with HTTP 401');
    assert(
      !JSON.stringify(badLoginData).includes('Mumin@123') &&
        !JSON.stringify(badLoginData).includes('123456'),
      'Error message does not leak default passwords or OTP codes'
    );
  } catch (err) {
    assert(false, 'Password leak check', err.message);
  }

  // -------------------------------------------------------------------------
  // Test 5: User Registration with KYC Proofs
  // -------------------------------------------------------------------------
  console.log(`\n🔍 5. Registration Flow with ITS & Live Selfie Proofs`);
  const tsSuffix = String(Date.now()).slice(-7);
  const testUserEmail = `qa.test.${Date.now()}@mumineen.org`;
  const testPhone = `+91 982${tsSuffix}`;
  const testIts = `5${tsSuffix}`;
  const testPassword = 'SecurePassword123';
  let sessionCookie = '';

  try {
    // Invalid email validation
    const resBadEmail = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Mumin User',
        email: 'not-an-email',
        phone: testPhone,
        password: testPassword,
        itsNumber: testIts,
      }),
    });
    assert(resBadEmail.status === 400, 'Invalid email rejected with HTTP 400');

    // Invalid phone validation
    const resBadPhone = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Mumin User',
        email: testUserEmail,
        phone: '12345',
        password: testPassword,
        itsNumber: testIts,
      }),
    });
    assert(resBadPhone.status === 400, 'Invalid phone number rejected with HTTP 400');

    // Missing KYC should fail
    const resFail = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Mumin User',
        email: testUserEmail,
        phone: testPhone,
        password: testPassword,
        itsNumber: testIts,
        // omitting itsCardProofUrl and livePhotoUrl
      }),
    });
    assert(resFail.status === 400, 'Registration without KYC proofs rejected with HTTP 400');

    // Complete registration
    const resReg = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Mumin User',
        email: testUserEmail,
        phone: testPhone,
        password: testPassword,
        cityId: 'mumbai',
        cityName: 'Mumbai',
        jamaatName: 'Mazgaon Jamaat (Hasanabad / Saifee Park)',
        itsNumber: testIts,
        itsCardProofUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=500',
        livePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
      }),
    });
    const regData = await resReg.json();
    assert(resReg.status === 200 && regData.success, 'Registration with complete KYC succeeds');
    assert(
      regData.user.verificationStatus === 'PENDING',
      'New user correctly enters PENDING verification status'
    );

    // Duplicate ITS registration check
    const resDupIts = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Duplicate ITS User',
        email: `dup.${Date.now()}@mumineen.org`,
        phone: `+91 983${tsSuffix}`,
        password: testPassword,
        cityId: 'mumbai',
        cityName: 'Mumbai',
        jamaatName: 'Mazgaon Jamaat (Hasanabad / Saifee Park)',
        itsNumber: testIts,
        itsCardProofUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=500',
        livePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
      }),
    });
    assert(resDupIts.status === 409, 'Duplicate 8-digit ITS number blocked with HTTP 409 Conflict');

    // Forgot Password flow
    const resForgot = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail }),
    });
    assert(resForgot.status === 200, 'Forgot password endpoint accepts valid email (HTTP 200)');

    // Wrong OTP on reset password
    const resBadReset = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        otp: '000000',
        newPassword: 'NewPassword123',
      }),
    });
    assert(resBadReset.status === 400, 'Invalid reset OTP rejected with HTTP 400');

    // WhatsApp OTP request & invalid OTP check
    const resWaOtp = await fetch(`${BASE_URL}/api/auth/whatsapp-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: testUserEmail }),
    });
    assert(resWaOtp.status === 200, 'WhatsApp OTP endpoint accepts valid account identifier (HTTP 200)');

    const resBadWaLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: testUserEmail, otp: '000000' }),
    });
    assert(resBadWaLogin.status === 401, 'Invalid WhatsApp OTP login rejected with HTTP 401');

    const rawCookie = resReg.headers.get('set-cookie');
    if (rawCookie) {
      sessionCookie = rawCookie.split(';')[0];
    }

    // Verify session
    const resMe = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: sessionCookie ? { Cookie: sessionCookie } : {},
    });
    const meData = await resMe.json();
    assert(
      meData.authenticated && meData.user.email === testUserEmail,
      'Session token grants authenticated access to user profile'
    );
  } catch (err) {
    assert(false, 'Registration flow check', err.message);
  }

  // -------------------------------------------------------------------------
  // Test 6: Admin RBAC & Route Protection
  // -------------------------------------------------------------------------
  console.log(`\n🔍 6. Admin Role-Based Access Control (RBAC)`);
  try {
    // Regular pending user attempting admin verifications queue
    const resForbidden = await fetch(`${BASE_URL}/api/admin/verifications`, {
      headers: sessionCookie ? { Cookie: sessionCookie } : {},
    });
    assert(
      resForbidden.status === 403,
      'Non-admin user accessing /api/admin/verifications receives HTTP 403 Forbidden'
    );

    // Unauthenticated user attempting admin PATCH
    const resPatchForbidden = await fetch(`${BASE_URL}/api/admin/verifications/verif-1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'VERIFIED' }),
    });
    assert(
      resPatchForbidden.status === 403,
      'Unauthenticated approval mutation receives HTTP 403 Forbidden'
    );
  } catch (err) {
    assert(false, 'Admin RBAC check', err.message);
  }

  // -------------------------------------------------------------------------
  // Test 7: Classifieds Marketplace Lifecycle
  // -------------------------------------------------------------------------
  console.log(`\n🔍 7. Classifieds Marketplace Lifecycle`);
  let createdListingId = '';
  try {
    const resList = await fetch(`${BASE_URL}/api/classifieds`);
    const listData = await resList.json();
    assert(resList.status === 200 && Array.isArray(listData.classifieds), 'GET /api/classifieds returns list');

    // Create a new listing
    const resCreate = await fetch(`${BASE_URL}/api/classifieds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sellerId: 'user-qa-1',
        sellerName: 'QA Tester',
        sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        sellerPhone: '+919820011223',
        cityId: 'mumbai',
        cityName: 'Mumbai',
        mohallaName: 'Mazgaon',
        category: 'REAL_ESTATE_RENT',
        title: 'Spacious 2BHK Near Uzri Masjid (Zero Brokerage)',
        description: 'Direct owner Bohra listing. WhatsApp wa.me/919820011223 or see https://instagram.com/mazgaon_flats',
        price: 55000,
        isNegotiable: true,
        condition: 'NOT_APPLICABLE',
        mediaUrls: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'],
        status: 'ACTIVE',
        realEstateMeta: {
          bhk: '2 BHK',
          carpetArea: 800,
          nearMasjid: 'Uzri Masjid (2 mins)',
          thaaliFriendly: true,
          brokerage: 'ZERO_BROKERAGE',
          deposit: 150000,
        },
      }),
    });
    const createData = await resCreate.json();
    assert(resCreate.status === 201 && createData.listing?.id, 'POST /api/classifieds creates listing');
    createdListingId = createData.listing?.id;
  } catch (err) {
    assert(false, 'Classifieds check', err.message);
  }

  // -------------------------------------------------------------------------
  // Test 8: Visual Souq Feed & Stories
  // -------------------------------------------------------------------------
  console.log(`\n🔍 8. Visual Souq Feed & Stories`);
  let createdPostId = '';
  try {
    const resFeed = await fetch(`${BASE_URL}/api/feed`);
    const feedData = await resFeed.json();
    assert(resFeed.status === 200 && Array.isArray(feedData.posts), 'GET /api/feed returns posts');

    const resStories = await fetch(`${BASE_URL}/api/stories`);
    const storiesData = await resStories.json();
    assert(resStories.status === 200 && Array.isArray(storiesData.stories), 'GET /api/stories returns stories');

    const resPostCreate = await fetch(`${BASE_URL}/api/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: 'biz-qa-1',
        businessName: 'Burhani Catering QA',
        businessAvatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100',
        hasRazaBadge: true,
        authorId: 'user-qa-1',
        postType: 'PHOTO_CAROUSEL',
        mediaUrls: ['https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600'],
        caption: 'Special Friday Bohra Thaali Box. Order wa.me/919820011223 or visit https://burhanithaali.com',
        priceInr: 1800,
        isAvailableToday: true,
        cityName: 'Mumbai',
        mohallaName: 'Mazgaon',
        category: 'FOOD_CATERING',
        tags: ['Thaali', 'Special'],
        whatsappNumber: '+919820011223',
      }),
    });
    const postData = await resPostCreate.json();
    assert(resPostCreate.status === 201 && postData.post?.id, 'POST /api/feed creates community drop');
    createdPostId = postData.post?.id;
  } catch (err) {
    assert(false, 'Feed check', err.message);
  }

  // -------------------------------------------------------------------------
  // Test 9: Leads Recording & WhatsApp Inquiry Counters
  // -------------------------------------------------------------------------
  console.log(`\n🔍 9. Lead Generation & WhatsApp Click Counters`);
  try {
    const targetItemId = createdListingId || 'listing-sample';
    const resLead = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: targetItemId,
        itemType: 'CLASSIFIED',
        itemTitle: 'Spacious 2BHK Near Uzri Masjid',
        sellerId: 'user-qa-1',
        buyerName: 'Murtuza Buyer',
        buyerIts: '50294812',
        buyerMohalla: 'Mazgaon',
      }),
    });
    const leadData = await resLead.json();
    assert(resLead.status === 201 && leadData.lead?.id, 'POST /api/leads records buyer inquiry lead event');
  } catch (err) {
    assert(false, 'Leads check', err.message);
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log(`\n=======================================================`);
  console.log(`📊 Test Results: ${passedCount} Passed | ${failedCount} Failed`);
  console.log(`=======================================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
