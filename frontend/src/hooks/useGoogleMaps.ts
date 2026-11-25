import { useState, useCallback, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { googleMapsConfig } from '../config/googleMaps';

// This is now the single place where Google Maps is loaded
export const useGoogleMaps = () => {
  const [mapsAuthError, setMapsAuthError] = useState<string | null>(null);

  // Validate API key before loading
  useEffect(() => {
    if (!googleMapsConfig.googleMapsApiKey) {
      const msg =
        'Google Maps API key is missing. Set REACT_APP_GOOGLE_MAPS_API_KEY in frontend/.env and restart the dev server.';
      setMapsAuthError(msg);
      console.error(
        '❌ Google Maps API Key is missing!\n' +
          'Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file.\n' +
          'Get your API key from: https://console.cloud.google.com/google/maps-apis'
      );
    }
  }, []);

  // Catch Google Maps authentication failures (invalid key, referrer restriction, billing, etc.)
  useEffect(() => {
    // Google Maps calls this global when auth fails.
    // See: https://developers.google.com/maps/documentation/javascript/events#auth-errors
    (window as any).gm_authFailure = () => {
      setMapsAuthError(
        'Google Maps authentication failed. This usually means your API key is invalid, restricted (HTTP referrer not allowed), billing is disabled, or required APIs are not enabled.'
      );
    };
    return () => {
      // Avoid leaking handlers across hot reloads
      try {
        delete (window as any).gm_authFailure;
      } catch {
        // ignore
      }
    };
  }, []);

  // First, load the Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: googleMapsConfig.id,
    googleMapsApiKey: googleMapsConfig.googleMapsApiKey,
    libraries: [...googleMapsConfig.libraries],
    language: googleMapsConfig.language,
    region: googleMapsConfig.region,
    version: googleMapsConfig.version
  });

  // Log detailed error information
  useEffect(() => {
    if (loadError) {
      console.error('Google Maps Load Error:', {
        message: loadError.message,
        apiKeyPresent: !!googleMapsConfig.googleMapsApiKey,
        apiKeyLength: googleMapsConfig.googleMapsApiKey?.length || 0,
        apiKeyPrefix: googleMapsConfig.googleMapsApiKey?.substring(0, 10) || 'N/A'
      });
    }
  }, [loadError]);

  // Then, manage location state
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const apiKey = googleMapsConfig.googleMapsApiKey;

  // Get current location with fallback strategy
  const getCurrentLocation = useCallback((useHighAccuracy = true, retryCount = 0) => {
    if (navigator.geolocation) {
      const options: PositionOptions = {
        enableHighAccuracy: useHighAccuracy,
        timeout: useHighAccuracy ? 30000 : 20000, // Longer timeout for high accuracy
        maximumAge: useHighAccuracy ? 0 : 60000, // Accept cached location if not using high accuracy
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error: GeolocationPositionError) => {
          // If timeout with high accuracy, retry with lower accuracy (only once)
          if (error.code === 3 && useHighAccuracy && retryCount === 0) {
            console.log('High accuracy timed out, retrying with lower accuracy...');
            getCurrentLocation(false, 1);
            return;
          }

          const message =
            error.code === 1 // PERMISSION_DENIED
              ? 'Location access was denied. Please enable location in your browser to see your position and nearby hospitals.'
              : error.code === 2 // POSITION_UNAVAILABLE
                ? 'Location is unavailable. Please check your device settings.'
                : error.code === 3 // TIMEOUT
                  ? 'Location request timed out. Please try again or check your GPS signal.'
                  : `Error getting location: ${error.message}`;
          setLocationError(message);
          console.error('Error getting current location:', error);
        },
        options
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Get address from coordinates (reverse geocoding)
  const getAddressFromCoordinates = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      if (!isLoaded) return 'Maps API not loaded';

      try {
        const geocoder = new window.google.maps.Geocoder();
        const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(status);
            }
          });
        });

        if (response && response[0]) {
          return response[0].formatted_address;
        }
        return 'Address not found';
      } catch (error) {
        console.error('Error in reverse geocoding:', error);
        return 'Error getting address';
      }
    },
    [isLoaded]
  );

  // Get coordinates from address (geocoding)
  const getCoordinatesFromAddress = useCallback(
    async (address: string): Promise<{ lat: number; lng: number } | null> => {
      if (!isLoaded) return null;

      try {
        const geocoder = new window.google.maps.Geocoder();
        const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(status);
            }
          });
        });

        if (response && response[0] && response[0].geometry) {
          const location = response[0].geometry.location;
          return {
            lat: location.lat(),
            lng: location.lng(),
          };
        }
        return null;
      } catch (error) {
        console.error('Error in geocoding:', error);
        return null;
      }
    },
    [isLoaded]
  );

  // Calculate distance between two points
  const calculateDistance = useCallback(
    (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<number> => {
      return new Promise((resolve, reject) => {
        if (!isLoaded) {
          reject('Maps API not loaded');
          return;
        }

        const service = new window.google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
          {
            origins: [new window.google.maps.LatLng(origin.lat, origin.lng)],
            destinations: [new window.google.maps.LatLng(destination.lat, destination.lng)],
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            if (status === 'OK' && response) {
              const distance = response.rows[0].elements[0].distance.value; // in meters
              resolve(distance);
            } else {
              reject(`Error calculating distance: ${status}`);
            }
          }
        );
      });
    },
    [isLoaded]
  );

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    isLoaded,
    loadError,
    mapsAuthError,
    currentLocation,
    locationError,
    getCurrentLocation,
    apiKey,
    getAddressFromCoordinates,
    getCoordinatesFromAddress,
    calculateDistance,
  };
};