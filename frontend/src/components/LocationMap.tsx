import React, { useMemo, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import UserLocationMarker from './UserLocationMarker';

interface Location {
  lat: number;
  lng: number;
  id?: string;
  label?: string;
  icon?: string;
  status?: 'available' | 'busy' | 'offline';
}

interface LocationMapProps {
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  locations?: Location[];
  onMarkerClick?: (location: Location) => void;
  selectedLocation?: Location | null;
  height?: string | number;
  showUserLocation?: boolean;
  userLocation?: {
    lat: number;
    lng: number;
  } | null;
  userLocationAccuracy?: number; // Location accuracy in meters
  onMapLoad?: (map: google.maps.Map) => void;
}

const defaultCenter = {
  lat: 20.5937, // Center of India
  lng: 78.9629
};

const LocationMap: React.FC<LocationMapProps> = ({
  center = defaultCenter,
  zoom = 15,
  locations = [],
  onMarkerClick,
  selectedLocation = null,
  height = '500px',
  showUserLocation = true,
  userLocation = null,
  userLocationAccuracy,
  onMapLoad
}) => {
  // Use the centralized Google Maps hook
  const { isLoaded, loadError, currentLocation, mapsAuthError } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Determine the actual user location to use (prop takes precedence, then hook's currentLocation)
  const actualUserLocation = useMemo(() => {
    return userLocation || currentLocation;
  }, [userLocation, currentLocation]);

  // Prioritize user location for center, then provided center, then current location, then default
  const mapCenter = useMemo(() => {
    if (actualUserLocation) return actualUserLocation;
    if (center && center.lat !== defaultCenter.lat && center.lng !== defaultCenter.lng) return center;
    return defaultCenter;
  }, [actualUserLocation, center]);
  
  // Center map on user location when it becomes available
  useEffect(() => {
    if (mapRef.current && actualUserLocation) {
      mapRef.current.setCenter(actualUserLocation);
      mapRef.current.setZoom(15);
    }
  }, [actualUserLocation]);
  
  // Handle map load
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    if (onMapLoad) {
      onMapLoad(map);
    }
    // Center on user location if available
    if (actualUserLocation) {
      map.setCenter(actualUserLocation);
      map.setZoom(15);
    }
    // Fix blank map when container size was 0 / flex layout then got real height
    requestAnimationFrame(() => {
      window.google?.maps?.event?.trigger(map, 'resize');
    });
  };

  /** Percent height only works if every ancestor up to the sized parent has height; fill the parent box. */
  const heightUsesPercent = typeof height === 'string' && height.trim().endsWith('%');

  const mapContainerStyle = useMemo(() => {
    const h = typeof height === 'number' ? `${height}px` : height;
    return {
      width: '100%',
      height: h,
      minHeight: heightUsesPercent ? 280 : typeof height === 'number' ? height : 300,
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    } as const;
  }, [height, heightUsesPercent]);

  const getMarkerIcon = (location: Location) => {
    if (location.icon) return location.icon;
    
    switch (location.status) {
      case 'available':
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'busy':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'offline':
        return 'http://maps.google.com/mapfiles/ms/icons/gray-dot.png';
      default:
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }
  };

  if (mapsAuthError) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff3e0',
        borderRadius: '8px',
        color: '#e65100',
        textAlign: 'center',
        padding: '24px',
        border: '2px solid #ffb74d'
      }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0' }}>Google Maps API problem</h3>
          <p style={{ margin: 0 }}>{mapsAuthError}</p>
          <p style={{ margin: '12px 0 0 0', fontSize: 13 }}>
            Fix in Google Cloud Console: enable Billing, enable Maps JavaScript API + Places API (and Geocoding API if using address search),
            and add <code>http://localhost:*</code> to allowed HTTP referrers.
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    const errorMsg = loadError.message || 'Unknown error';
    const isApiKeyError = errorMsg.includes('API key') || 
                         errorMsg.includes('InvalidKeyMapError') || 
                         errorMsg.includes('RefererNotAllowedMapError') ||
                         errorMsg.includes('This page didn\'t load Google Maps correctly');
    
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff3e0',
        borderRadius: '8px',
        color: '#e65100',
        textAlign: 'center',
        padding: '24px',
        border: '2px solid #ffb74d',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 'bold' }}>
            {isApiKeyError ? 'Google Maps API Error' : 'Error Loading Map'}
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>
            {errorMsg}
          </p>
          
          {isApiKeyError && (
            <div style={{ 
              marginTop: '20px', 
              textAlign: 'left', 
              fontSize: '13px', 
              backgroundColor: '#fff',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #ffcc80'
            }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', fontSize: '14px' }}>
                Troubleshooting Steps:
              </p>
              <ol style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Verify <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>REACT_APP_GOOGLE_MAPS_API_KEY</code> is set in your <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>.env</code> file</li>
                <li>Check Google Cloud Console → APIs & Services → Enabled APIs:
                  <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                    <li>Enable <strong>Maps JavaScript API</strong></li>
                    <li>Enable <strong>Places API</strong></li>
                  </ul>
                </li>
                <li>In Google Cloud Console → Credentials → Your API Key:
                  <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                    <li>Add <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>http://localhost:*</code> to HTTP referrer restrictions</li>
                    <li>Or temporarily set restrictions to "None" for testing</li>
                  </ul>
                </li>
                <li>Ensure billing is enabled in Google Cloud Console (free tier available)</li>
                <li>Restart your dev server after changing <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>.env</code></li>
              </ol>
            </div>
          )}
          
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p>Loading map...</p>
      </div>
    </div>;
  }

  return (
    <div
      className="w-full"
      style={{
        position: 'relative',
        ...(heightUsesPercent ? { height: '100%', minHeight: 280 } : {}),
      }}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={handleMapLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        {/* User Location Marker with custom animated icon */}
        {showUserLocation && actualUserLocation && isLoaded && (
          <UserLocationMarker 
            position={actualUserLocation} 
            accuracy={userLocationAccuracy}
          />
        )}

        {/* Ambulance Markers */}
        {locations.map((location) => (
          <Marker
            key={location.id || `${location.lat}-${location.lng}`}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => onMarkerClick && onMarkerClick(location)}
            icon={{
              url: getMarkerIcon(location),
              scaledSize: new window.google.maps.Size(32, 32)
            }}
          >
            {(selectedLocation?.id === location.id) && (
              <InfoWindow
                position={{ lat: location.lat, lng: location.lng }}
                onCloseClick={() => onMarkerClick && onMarkerClick(location)}
              >
                <div className="p-2">
                  <h3 className="font-bold text-sm">{location.label || 'Location'}</h3>
                  <p className="text-xs">Lat: {location.lat.toFixed(6)}</p>
                  <p className="text-xs">Lng: {location.lng.toFixed(6)}</p>
                  {location.status && (
                    <div className="mt-1">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        location.status === 'available' ? 'bg-green-500' :
                        location.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                      }`}></span>
                      <span className="text-xs capitalize">{location.status}</span>
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
};

export default LocationMap;
