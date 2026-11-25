import { useState, useCallback, useEffect, useRef } from 'react';
import type { HospitalPlace } from '../types';

const HOSPITAL_SEARCH_RADIUS_M = 5000;
const MAX_HOSPITAL_RESULTS = 15;

export interface UseNearbyHospitalsOptions {
  /** Center point for the search (e.g. user location) */
  center: { lat: number; lng: number } | null;
  /** Map instance - required for PlacesService */
  map: google.maps.Map | null;
  /** Whether Maps API is loaded */
  isLoaded: boolean;
  /** Run search automatically when center and map are ready */
  autoSearch?: boolean;
}

export interface UseNearbyHospitalsResult {
  hospitals: HospitalPlace[];
  loading: boolean;
  error: string | null;
  searchNearby: () => void;
  clearHospitals: () => void;
}

function getLatLngValue(
  loc: google.maps.LatLng | google.maps.LatLngLiteral,
  key: 'lat' | 'lng'
): number {
  const v = loc[key];
  return typeof v === 'function' ? (v as () => number)() : (v as number);
}

function placeResultToHospital(place: google.maps.places.PlaceResult): HospitalPlace | null {
  const location = place.geometry?.location;
  if (!location || !place.place_id || !place.name) return null;
  return {
    placeId: place.place_id,
    name: place.name,
    vicinity: place.vicinity,
    lat: getLatLngValue(location, 'lat'),
    lng: getLatLngValue(location, 'lng'),
    rating: place.rating,
  };
}

/**
 * Hook to search for nearby hospitals using Google Places API (PlacesService.nearbySearch).
 * Requires Maps JavaScript API and Places library. Use with a loaded map instance.
 */
export function useNearbyHospitals({
  center,
  map,
  isLoaded,
  autoSearch = true,
}: UseNearbyHospitalsOptions): UseNearbyHospitalsResult {
  const [hospitals, setHospitals] = useState<HospitalPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  const clearHospitals = useCallback(() => {
    setHospitals([]);
    setError(null);
  }, []);

  const searchNearby = useCallback(() => {
    if (!isLoaded || !map || !center) {
      setError('Map or location not ready.');
      return;
    }

    if (!window.google?.maps?.places) {
      setError('Places API is not loaded.');
      return;
    }

    setLoading(true);
    setError(null);

    if (!placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    }

    const service = placesServiceRef.current;
    const request: google.maps.places.PlaceSearchRequest = {
      location: new window.google.maps.LatLng(center.lat, center.lng),
      radius: HOSPITAL_SEARCH_RADIUS_M,
      type: 'hospital',
    };

    service.nearbySearch(request, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
      setLoading(false);
      if (status !== 'OK' || !results) {
        setError(status === 'ZERO_RESULTS' ? 'No hospitals found nearby.' : `Places error: ${status}`);
        setHospitals([]);
        return;
      }
      const list: HospitalPlace[] = [];
      for (let i = 0; i < Math.min(results.length, MAX_HOSPITAL_RESULTS); i++) {
        const hospital = placeResultToHospital(results[i]);
        if (hospital) list.push(hospital);
      }
      setHospitals(list);
      setError(null);
    });
  }, [isLoaded, map, center]);

  useEffect(() => {
    if (autoSearch && isLoaded && map && center) {
      searchNearby();
    }
  }, [autoSearch, isLoaded, map, center, searchNearby]);

  return {
    hospitals,
    loading,
    error,
    searchNearby,
    clearHospitals,
  };
}
