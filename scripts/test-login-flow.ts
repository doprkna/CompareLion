import fetch from 'node-fetch';

async function testLoginFlow() {
  try {
    console.log('🧪 Testing complete login flow...\n');
    
    // Step 1: Test login page
    console.log('1. Testing login page...');
    const loginPageResponse = await fetch('http://localhost:3000/login');
    if (loginPageResponse.ok) {
      console.log('✅ Login page loads successfully');
    } else {
      console.log(`❌ Login page failed: ${loginPageResponse.status}`);
      return;
    }
    
    // Step 2: Test admin debug endpoint (no auth required)
    console.log('\n2. Testing admin user in database...');
    const adminResponse = await fetch('http://localhost:3000/api/debug/admin');
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      if (adminData.success) {
        console.log('✅ Admin user found in database');
        console.log(`   Level: ${adminData.adminUser.level}`);
        console.log(`   XP: ${adminData.adminUser.xp}`);
      } else {
        console.log('❌ Admin user not found in database');
        return;
      }
    } else {
      console.log(`❌ Admin debug endpoint failed: ${adminResponse.status}`);
      return;
    }
    
    // Step 3: Test user summary (requires auth)
    console.log('\n3. Testing user summary (requires authentication)...');
    const summaryResponse = await fetch('http://localhost:3000/api/user/summary');
    if (summaryResponse.status === 401) {
      console.log('✅ User summary correctly returns 401 (no session)');
      console.log('   This is expected - you need to log in first');
    } else if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.log('✅ User summary returned data:');
      console.log(`   User: ${summaryData.user?.name || 'Unknown'}`);
      console.log(`   Level: ${summaryData.user?.level || 'Unknown'}`);
    } else {
      console.log(`❌ User summary failed: ${summaryResponse.status}`);
    }
    
    console.log('\n🎯 SOLUTION:');
    console.log('1. Open http://localhost:3000/login in your browser');
    console.log('2. Login with: admin@example.com / 1AmTheArchitect');
    console.log('3. After login, you should see Level 99, 9999 XP, etc.');
    console.log('4. If you still see "Demo User", clear browser cookies and try again');
    
  } catch (error) {
    console.error('❌ Error testing login flow:', error);
  }
}

testLoginFlow();

























