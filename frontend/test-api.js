// Simple test to verify axios-based API is working
import { AuthApi, ProductsApi } from './lib/api-axios.js';

console.log('Testing axios-based API...');

// Test login (this will fail with authentication error, but should show proper error handling)
try {
  const result = await AuthApi.login('test@example.com', 'password123');
  console.log('Login successful:', result);
} catch (error) {
  console.log('Login failed as expected:', error.message);
}

// Test getting products (this should work)
try {
  const products = await ProductsApi.list();
  console.log('Products fetched successfully:', products);
} catch (error) {
  console.log('Failed to fetch products:', error.message);
}

console.log('API test completed');
