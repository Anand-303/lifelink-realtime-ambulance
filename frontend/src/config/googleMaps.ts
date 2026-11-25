// Google Maps configuration for @react-google-maps/api
// API key must be set in .env as REACT_APP_GOOGLE_MAPS_API_KEY
const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  if (process.env.NODE_ENV === 'development') {
    console.error(
      '❌ REACT_APP_GOOGLE_MAPS_API_KEY is not set in .env file!\n' +
      'Please add: REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here\n' +
      'Get your API key from: https://console.cloud.google.com/google/maps-apis'
    );
  }
} else if (apiKey.length < 30) {
  console.warn(
    '⚠️ Google Maps API key appears to be invalid (too short). Please verify your API key.'
  );
}

export const googleMapsConfig = {
  googleMapsApiKey: apiKey || '',
  libraries: ['places', 'geometry'] as const,
  id: 'google-map-script',
  version: 'weekly',
  language: 'en',
  region: 'US',
} as const;

// This ensures we only load the Google Maps script once
declare global {
  interface Window {
    googleMapsInitialized?: boolean;
  }
}

export const initializeGoogleMaps = () => {
  if (typeof window !== 'undefined' && !window.googleMapsInitialized) {
    window.googleMapsInitialized = true;
    return true;
  }
  return false;
};
