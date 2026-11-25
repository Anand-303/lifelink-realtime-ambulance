import React from 'react';
import { Marker, Circle } from '@react-google-maps/api';

interface UserLocationMarkerProps {
  position: {
    lat: number;
    lng: number;
  };
  accuracy?: number;
}

/**
 * Custom User Location Marker with pulsing animation
 * Creates a more visible and distinctive marker for the user's location
 */
const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ position, accuracy }) => {

  // Create a custom SVG icon for user location
  const createUserLocationIcon = () => {
    // Create an SVG icon with a blue dot - simpler version that works better
    const svgIcon = `
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer pulsing circle -->
        <circle cx="20" cy="20" r="18" fill="#1976d2" opacity="0.3"/>
        <!-- Middle circle -->
        <circle cx="20" cy="20" r="12" fill="#1976d2" opacity="0.6"/>
        <!-- Inner dot -->
        <circle cx="20" cy="20" r="6" fill="#1976d2"/>
        <circle cx="20" cy="20" r="3" fill="#ffffff"/>
      </svg>
    `;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon),
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 20),
    };
  };

  return (
    <>
      {/* Accuracy circle - shows the area where user might be */}
      {accuracy && accuracy > 0 && (
        <Circle
          center={position}
          radius={accuracy}
          options={{
            strokeColor: '#1976d2',
            strokeOpacity: 0.3,
            strokeWeight: 1,
            fillColor: '#1976d2',
            fillOpacity: 0.1,
            clickable: false,
            zIndex: 1,
          }}
        />
      )}
      
      {/* User location marker */}
      <Marker
        position={position}
        icon={createUserLocationIcon()}
        title="Your Location"
        zIndex={1000} // Ensure user marker is on top
        options={{
          optimized: false, // Disable optimization to allow custom icon
        }}
      />
    </>
  );
};

export default UserLocationMarker;

