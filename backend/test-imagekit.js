// Simple test script to verify ImageKit configuration
import dotenv from 'dotenv';
import ImageKit from 'imagekit';

dotenv.config();

const { 
  IMAGEKIT_PUBLIC_KEY, 
  IMAGEKIT_PRIVATE_KEY, 
  IMAGEKIT_URL_ENDPOINT 
} = process.env;

console.log('🧪 Testing ImageKit Configuration...\n');

console.log('Environment Variables:');
console.log('IMAGEKIT_PUBLIC_KEY:', IMAGEKIT_PUBLIC_KEY ? '✅ Set' : '❌ Missing');
console.log('IMAGEKIT_PRIVATE_KEY:', IMAGEKIT_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
console.log('IMAGEKIT_URL_ENDPOINT:', IMAGEKIT_URL_ENDPOINT ? '✅ Set' : '❌ Missing');

if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
  console.log('\n❌ ImageKit configuration incomplete. Please check your .env file.');
  process.exit(1);
}

console.log('\n🖼️ Initializing ImageKit...');

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

console.log('✅ ImageKit configured');

// Test connection
console.log('\n🧪 Testing connection...');

try {
  // Test by getting file list (empty folder)
  const result = await imagekit.listFiles({
    path: '/test',
    limit: 1
  });
  
  console.log('✅ Connection successful:', result);
  
  // Test upload with a simple text file
  console.log('\n🧪 Testing upload...');
  
  const testBuffer = Buffer.from('Hello ImageKit! This is a test file.');
  const uploadResult = await imagekit.upload({
    file: testBuffer,
    fileName: 'test-file.txt',
    folder: 'test',
    useUniqueFileName: true,
  });
  
  console.log('✅ Upload successful:', uploadResult.url);
  
  // Clean up test file
  console.log('\n🧹 Cleaning up test file...');
  await imagekit.deleteFile(uploadResult.fileId);
  console.log('✅ Test file cleaned up');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All tests passed! ImageKit is working correctly.');
