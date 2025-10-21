import fetch from 'node-fetch';

async function testLoginPage() {
  try {
    console.log('🧪 Testing login page...\n');
    
    // Test 1: Check if login page loads
    console.log('1. Testing login page accessibility...');
    const response = await fetch('http://localhost:3000/login');
    
    if (response.ok) {
      console.log('✅ Login page loads successfully (HTTP 200)');
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      console.log(`   Content-Length: ${response.headers.get('content-length')} bytes\n`);
    } else {
      console.log(`❌ Login page failed (HTTP ${response.status})`);
      console.log(`   Status: ${response.statusText}\n`);
      return;
    }
    
    // Test 2: Check if login page has expected content
    console.log('2. Testing login page content...');
    const html = await response.text();
    
    if (html.includes('Sign In') || html.includes('Login')) {
      console.log('✅ Login page contains expected content');
    } else {
      console.log('❌ Login page missing expected content');
    }
    
    if (html.includes('admin@example.com')) {
      console.log('✅ Login page references admin user');
    } else {
      console.log('ℹ️  Login page does not reference admin user (this is normal)');
    }
    
    if (html.includes('password')) {
      console.log('✅ Login page has password field');
    } else {
      console.log('❌ Login page missing password field');
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Open http://localhost:3000/login in your browser');
    console.log('2. Try logging in with:');
    console.log('   Email: admin@example.com');
    console.log('   Password: 1AmTheArchitect');
    console.log('3. Check if you see Level 99, 9999 XP, etc.');
    
  } catch (error) {
    console.error('❌ Error testing login page:', error);
  }
}

testLoginPage();







