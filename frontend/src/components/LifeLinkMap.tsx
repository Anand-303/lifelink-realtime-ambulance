import React, { useMemo, useState, useRef, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { useNearbyHospitals } from '../hooks/useNearbyHospitals';
import UserLocationMarker from './UserLocationMarker';
import LoadingSpinner from './common/LoadingSpinner';
import type { HospitalPlace } from '../types';

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

export interface LifeLinkMapProps {
  /** Map container height */
  height?: string | number;
  /** Initial zoom level */
  zoom?: number;
  /** Whether to search for nearby hospitals when user location is available */
  showNearbyHospitals?: boolean;
  /** Callback when map instance is loaded */
  onMapLoad?: (map: google.maps.Map) => void;
}

/**
 * Reusable Life Link map: centers on user location, shows user marker,
 * and optionally searches for nearby hospitals with Places API.
 * Uses Maps JavaScript API and Places library. API key via REACT_APP_GOOGLE_MAPS_API_KEY.
 */
const LifeLinkMap: React.FC<LifeLinkMapProps> = ({
  height = '500px',
  zoom = 15,
  showNearbyHospitals = true,
  onMapLoad,
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<HospitalPlace | null>(null);

  const {
    isLoaded,
    loadError,
    mapsAuthError,
    currentLocation,
    locationError,
    getCurrentLocation,
  } = useGoogleMaps();

  const center = currentLocation ?? DEFAULT_CENTER;

  const {
    hospitals,
    loading: hospitalsLoading,
    error: hospitalsError,
    searchNearby,
  } = useNearbyHospitals({
    center: showNearbyHospitals ? center : null,
    map: mapInstance,
    isLoaded: isLoaded && !!mapInstance,
    autoSearch: showNearbyHospitals && !!currentLocation,
  });

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      setMapInstance(map);
      if (currentLocation) {
        map.setCenter(currentLocation);
        map.setZoom(zoom);
      }
      onMapLoad?.(map);
    },
    [currentLocation, zoom, onMapLoad]
  );

  const containerStyle = useMemo(
    () => ({
      width: '100%',
      height: typeof height === 'number' ? `${height}px` : height,
      minHeight: 300,
      borderRadius: 8,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }),
    [height]
  );

  if (mapsAuthError) {
    return (
      <div
        style={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff3e0',
          color: '#e65100',
          textAlign: 'center',
          padding: 24,
          border: '2px solid #ffb74d',
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 8px 0' }}>Google Maps API problem</h3>
          <p style={{ margin: 0 }}>{mapsAuthError}</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#d32f2f',
          textAlign: 'center',
          padding: 24,
          border: '1px solid #ffcdd2',
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 8px 0' }}>Error loading map</h3>
          <p style={{ margin: 0 }}>{loadError.message}</p>
          <p style={{ margin: '8px 0 0 0', fontSize: 14 }}>
            Check your connection and ensure REACT_APP_GOOGLE_MAPS_API_KEY is set in .env
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Loading map..." />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {locationError && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            zIndex: 10,
            padding: '12px 16px',
            backgroundColor: '#fff3e0',
            border: '1px solid #ffb74d',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14, color: '#e65100' }}>{locationError}</span>
          <button
            type="button"
            onClick={() => getCurrentLocation()}
            style={{
              padding: '6px 12px',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Retry location
          </button>
        </div>
      )}

      {showNearbyHospitals && hospitalsError && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            zIndex: 10,
            padding: '8px 12px',
            backgroundColor: '#ffebee',
            border: '1px solid #ef5350',
            borderRadius: 8,
            fontSize: 13,
            color: '#c62828',
          }}
        >
          {hospitalsError}
          <button
            type="button"
            onClick={searchNearby}
            style={{
              marginLeft: 8,
              padding: '4px 8px',
              backgroundColor: '#fff',
              border: '1px solid #ef5350',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Retry
          </button>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={handleMapLoad}
        options={{
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        {currentLocation && (
          <UserLocationMarker position={currentLocation} />
        )}

        {hospitals.map((hospital) => (
          <Marker
            key={hospital.placeId}
            position={{ lat: hospital.lat, lng: hospital.lng }}
            onClick={() => setSelectedHospital(hospital)}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(32, 32),
            }}
            title={hospital.name}
          >
            {selectedHospital?.placeId === hospital.placeId && (
              <InfoWindow
                onCloseClick={() => setSelectedHospital(null)}
                position={{ lat: hospital.lat, lng: hospital.lng }}
              >
                <div style={{ padding: 4, minWidth: 180 }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: 14, fontWeight: 600 }}>
                    {hospital.name}
                  </h3>
                  {hospital.vicinity && (
                    <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
                      {hospital.vicinity}
                    </p>
                  )}
                  {hospital.rating != null && (
                    <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>
                      Rating: {hospital.rating} ★
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>

      {showNearbyHospitals && hospitalsLoading && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            padding: '6px 12px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 8,
            fontSize: 13,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          }}
        >
          Finding nearby hospitals...
        </div>
      )}
    </div>
  );
};

export default LifeLinkMap;
