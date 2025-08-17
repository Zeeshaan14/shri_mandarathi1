// Test script to verify API responses
const API_URL = "http://localhost:5000";

async function testAPI() {
  console.log('Testing API responses...\n');

  try {
    // Test products endpoint
    console.log('1. Testing /api/products...');
    const productsResponse = await fetch(`${API_URL}/api/products`);
    const productsData = await productsResponse.json();
    console.log('Status:', productsResponse.status);
    console.log('Response:', JSON.stringify(productsData, null, 2));
    console.log('Has products field:', 'products' in productsData);
    console.log('Products count:', productsData.products?.length || 0);
    console.log('---\n');

    // Test categories endpoint
    console.log('2. Testing /api/categories...');
    const categoriesResponse = await fetch(`${API_URL}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('Status:', categoriesResponse.status);
    console.log('Response:', JSON.stringify(categoriesData, null, 2));
    console.log('Has categories field:', 'categories' in categoriesData);
    console.log('Categories count:', categoriesData.categories?.length || 0);
    console.log('---\n');

    // Test auth endpoint (should fail with validation error)
    console.log('3. Testing /api/auth/login (should fail)...');
    const authResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const authData = await authResponse.json();
    console.log('Status:', authResponse.status);
    console.log('Response:', JSON.stringify(authData, null, 2));
    console.log('Has status field:', 'status' in authData);
    console.log('---\n');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI();
