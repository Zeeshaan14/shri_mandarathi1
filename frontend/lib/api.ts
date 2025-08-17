// Re-export all APIs from the new axios-based implementation
export * from './api-axios';

// Keep the old API_URL export for backward compatibility
export { API_URL } from './api-axios';