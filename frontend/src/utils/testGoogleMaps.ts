// Test utility to verify Google Maps API configuration
export const testGoogleMapsConfig = () => {
  console.log('🗺️ Testing Google Maps Configuration...');
  
  // Check API key
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
  
  if (!apiKey) {
    console.error('❌ REACT_APP_GOOGLE_MAPS_API_KEY is not set in .env file');
    return false;
  }
  
  if (apiKey.length < 30) {
    console.error('❌ API key appears to be invalid (too short)');
    return false;
  }
  
  console.log('✅ API key format looks correct');
  
  console.log('🔧 Correct HTTP Referrer formats for Google Cloud Console:');
  console.log('  - http://localhost:3000/*');
  console.log('  - http://localhost:3001/*'); 
  console.log('  - http://127.0.0.1:3000/*');
  console.log('  - http://127.0.0.1:3001/*');
  console.log('  - Or remove referrer restrictions for development');
  
  // Check if Google Maps loads
  const checkGoogleMaps = () => {
    if (window.google?.maps) {
      console.log('✅ Google Maps API loaded successfully');
      return true;
    } else {
      console.error('❌ Google Maps API failed to load');
      console.log('🔧 Troubleshooting:');
      console.log('  1. Check browser console for specific error');
      console.log('  2. Verify API key restrictions in Google Cloud Console');
      console.log('  3. Ensure all required APIs are enabled');
      console.log('  4. Check that billing is enabled');
      return false;
    }
  };
  
  // Wait a moment for API to load
  setTimeout(checkGoogleMaps, 3000);
  
  return true;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testGoogleMaps = testGoogleMapsConfig;
}
