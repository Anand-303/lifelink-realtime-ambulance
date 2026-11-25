import React, { useState, useEffect, useCallback, useRef } from 'react';
import Grid from '../../components/CustomGrid';
import { Container, Paper, Typography, Box, Button, TextField, Divider, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Chip, MenuItem, Alert, Snackbar } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import LocationMap from '../../components/LocationMap';
import { useAppSelector } from '../../redux/hooks';
import { ambulanceService } from '../../services/api';
import { Ambulance, AmbulanceRequest } from '../../types';
import { useSocket } from '../../hooks/useSocket';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

// Local Location type for the map component
interface MapLocation {
  lat: number;
  lng: number;
  id: string;
  label: string;
  status: 'available' | 'busy' | 'offline' | undefined;
}

const AmbulanceTrackingPage: React.FC = () => {
  // Initialize hooks at the top level
  const { user } = useAppSelector(state => state.auth);
  const isMounted = useRef(true);
  
  // Use the centralized Google Maps hook
  const { 
    isLoaded: mapsLoaded, 
    loadError: mapsError, 
    currentLocation, 
    getAddressFromCoordinates
  } = useGoogleMaps();
  
  // State for map and UI
  const [center, setCenter] = useState(() => ({
    lat: 20.5937, 
    lng: 78.9629  // Default to India center
  }));
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocationAccuracy, setUserLocationAccuracy] = useState<number | undefined>(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  
  // Custom hooks
  const { socket, subscribeToAmbulanceUpdates } = useSocket();
  
  // Get user location with better error handling and fallback strategy
  const requestUserLocation = useCallback((useHighAccuracy: boolean = true, retryCount: number = 0) => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    // Try high accuracy first, fall back to lower accuracy if it times out
    const options: PositionOptions = {
      enableHighAccuracy: useHighAccuracy,
      timeout: useHighAccuracy ? 30000 : 20000, // Longer timeout for high accuracy
      maximumAge: useHighAccuracy ? 0 : 60000, // Accept cached location if not using high accuracy
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(pos);
        setCenter(pos);
        setUserLocationAccuracy(position.coords.accuracy);
        setLocationError(null);
        setLoading(false);
      },
      (error: GeolocationPositionError) => {
        console.error('Error getting location:', error);
        
        // If timeout with high accuracy, retry with lower accuracy (only once)
        if (error.code === 3 && useHighAccuracy && retryCount === 0) {
          console.log('High accuracy timed out, retrying with lower accuracy...');
          requestUserLocation(false, 1);
          return;
        }
        
        let errorMessage = 'Unable to get your location. ';
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage += 'Location information is unavailable. Please check your device settings.';
            break;
          case 3: // TIMEOUT
            errorMessage += 'Location request timed out. Please try again or check your GPS signal.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        setLocationError(errorMessage);
        setLoading(false);
      },
      options
    );
  }, []);

  // Handler for button click - properly typed for React onClick
  const handleRequestLocation = useCallback(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  // Watch user location for real-time updates
  const watchUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 30000, // Increased timeout for watch position
      maximumAge: 10000, // Accept cached location if less than 10 seconds old
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(pos);
        setUserLocationAccuracy(position.coords.accuracy);
        setLocationError(null);
      },
      (error) => {
        console.error('Error watching location:', error);
        // Don't show error for watch failures, just log them
      },
      options
    );
  }, []);

  // Initialize user location when maps are loaded
  useEffect(() => {
    if (mapsError) {
      console.error('Error loading Google Maps:', mapsError);
      setError('Failed to load Google Maps. Please check your API key and try again.');
      setLoading(false);
      return;
    }

    if (mapsLoaded) {
      // Request initial location (this is async, so don't set loading to false here)
      requestUserLocation();
      // Start watching for location updates
      watchUserLocation();
      // Set loading to false once maps are loaded (location will come later)
      setLoading(false);
    }

    // Cleanup watch on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [mapsLoaded, mapsError, requestUserLocation, watchUserLocation]);

  // Update center when currentLocation from hook changes
  useEffect(() => {
    if (currentLocation && !userLocation) {
      setUserLocation(currentLocation);
      setCenter(currentLocation);
    }
  }, [currentLocation, userLocation]);
  
  // State for ambulance request
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [requestLocation, setRequestLocation] = useState('');
  const [requestUseCurrentLocation, setRequestUseCurrentLocation] = useState<boolean>(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [needsBlood, setNeedsBlood] = useState(false);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'critical'>('medium');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [userRequests, setUserRequests] = useState<AmbulanceRequest[]>([]);

  // Utility: fail fast instead of hanging forever (geocoding / network)
  const withTimeout = useCallback(<T,>(promise: Promise<T>, ms: number, timeoutMessage: string) => {
    return new Promise<T>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error(timeoutMessage)), ms);
      promise
        .then((value) => {
          window.clearTimeout(timer);
          resolve(value);
        })
        .catch((err) => {
          window.clearTimeout(timer);
          reject(err);
        });
    });
  }, []);
  
  // Load ambulances
  const loadAmbulances = useCallback(async () => {
    try {
      const response = await ambulanceService.getAllAmbulances();
      setAmbulances(response?.data || []);
    } catch (err) {
      console.error('Error loading ambulances:', err);
      setError('Failed to load ambulances. Please try again.');
      setAmbulances([]); // Ensure ambulances is always an array
    }
  }, []);
  
  // Load user requests
  const loadUserRequests = useCallback(async () => {
    if (!user) {
      setUserRequests([]);
      return;
    }
    
    try {
      const response = await ambulanceService.getUserAmbulanceRequests();
      setUserRequests(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('Error loading user requests:', err);
      setUserRequests([]);
    }
  }, [user]);
  
  // Load ambulances and user requests
  useEffect(() => {
    if (!mapsLoaded) return;

    loadAmbulances();
    
    if (user) {
      loadUserRequests();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [mapsLoaded, loadAmbulances, loadUserRequests, user]);
  
  // Subscribe to real-time ambulance updates
  useEffect(() => {
    if (socket) {
      const unsubscribe = subscribeToAmbulanceUpdates((updatedAmbulance) => {
        setAmbulances(prev => {
          const index = prev.findIndex(amb => amb._id === updatedAmbulance._id);
          if (index !== -1) {
            const newAmbulances = [...prev];
            newAmbulances[index] = updatedAmbulance;
            return newAmbulances;
          }
          return [...prev, updatedAmbulance];
        });
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [socket, subscribeToAmbulanceUpdates]);
  
  // Handle marker click
  const handleMarkerClick = (location: any) => {
    const ambulance = ambulances.find(a => a._id === location.id);
    setSelectedAmbulance(ambulance || null);
  };

  // Convert ambulances to locations format
  const ambulanceLocations = ambulances.map(ambulance => {
    let status: 'available' | 'busy' | 'offline' | undefined = 'offline';
    
    if (ambulance.status === 'available' || ambulance.status === 'busy') {
      status = ambulance.status;
    } else if (ambulance.status === 'maintenance') {
      status = 'offline';
    }
    
    return {
      lat: ambulance.location?.latitude || 0,
      lng: ambulance.location?.longitude || 0,
      id: ambulance._id,
      label: `Ambulance ${ambulance.registrationNumber}`,
      status
    } as MapLocation;
  });

  if (mapsError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Error loading Google Maps. Please check your API key and try again.
        </Alert>
      </Container>
    );
  }
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ambulance Tracking
      </Typography>
      
      <Grid container spacing={3} alignItems="flex-start">
        {/* Left: small Book Ambulance box (like the mock) */}
        <Grid item xs={12} md={3} component="div">
          <Paper elevation={3} sx={{ p: 2, maxWidth: 260 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Book Ambulance
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<DirectionsCarIcon />}
              onClick={() => setOpenRequestDialog(true)}
              sx={{ borderRadius: 2, py: 1 }}
            >
              Book Now
            </Button>
          </Paper>
        </Grid>

        {/* Right: big Map box */}
        <Grid item xs={12} md={9} component="div">
          <Paper elevation={3} sx={{ p: 2 }}>
            {locationError && (
              <Alert 
                severity="warning" 
                sx={{ mb: 2 }}
                action={
                  <Button 
                    size="small" 
                    onClick={() => {
                      setLocationError(null);
                      setLoading(true);
                      requestUserLocation();
                    }}
                    disabled={loading}
                    sx={{ ml: 2 }}
                  >
                    {loading ? 'Locating...' : 'Try Again'}
                  </Button>
                }
              >
                {locationError}
              </Alert>
            )}
            <Box sx={{ height: { xs: '45vh', md: '55vh' }, borderRadius: 1, overflow: 'hidden' }}>
              <LocationMap
                center={userLocation || center}
                zoom={userLocation ? 15 : 10}
                locations={ambulanceLocations}
                onMarkerClick={handleMarkerClick}
                selectedLocation={selectedAmbulance ? {
                  lat: selectedAmbulance.location?.latitude || 0,
                  lng: selectedAmbulance.location?.longitude || 0,
                  id: selectedAmbulance._id,
                  label: `Ambulance ${selectedAmbulance.registrationNumber}`,
                  status: selectedAmbulance.status === 'maintenance' ? 'offline' : 
                          (selectedAmbulance.status === 'available' || selectedAmbulance.status === 'busy') ? 
                          selectedAmbulance.status : 'offline'
                } : null}
                height="100%"
                userLocation={userLocation}
                userLocationAccuracy={userLocationAccuracy}
                showUserLocation={true}
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Ambulance Details Sidebar */}
        <Grid item xs={12} md={4} component="div" sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ambulance Details
            </Typography>
            {selectedAmbulance ? (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedAmbulance.registrationNumber}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Driver:</strong> {selectedAmbulance.driver?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Phone:</strong> {selectedAmbulance.driver?.phone || 'N/A'}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Status:</strong> {selectedAmbulance.status || 'N/A'}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Select an ambulance to view details
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<MyLocationIcon />}
              onClick={handleRequestLocation}
              sx={{ mb: 1, borderRadius: '20px' }}
            >
              {userLocation ? 'Update My Location' : 'Get My Location'}
            </Button>
            {userLocation && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Your Location:
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Lat: {userLocation.lat.toFixed(6)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Lng: {userLocation.lng.toFixed(6)}
                </Typography>
                {userLocationAccuracy && (
                  <Typography variant="caption" color="textSecondary">
                    Accuracy: ±{Math.round(userLocationAccuracy)}m
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Requests Section */}
        <Grid item xs={12} component="div" sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Recent Requests
            </Typography>
            
            {!userRequests || userRequests.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                You don't have any ambulance requests yet.
              </Typography>
            ) : (
              <List>
                {(userRequests || []).slice(0, 5).map((request, index) => (
                  <React.Fragment key={request._id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {request.pickupLocation.address}
                            </Typography>
                            <Chip 
                              label={request.status} 
                              size="small" 
                              color={
                                request.status === 'pending' ? 'warning' :
                                request.status === 'accepted' ? 'success' :
                                request.status === 'cancelled' ? 'error' : 'default'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(request.createdAt).toLocaleString()}
                            </Typography>
                            {(request as any).destination?.address || request.destinationLocation ? (
                              <Typography variant="body2">
                                To: {(request as any).destination?.address || request.destinationLocation?.address}
                              </Typography>
                            ) : null}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Request Dialog */}
      <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request an Ambulance</DialogTitle>
        <DialogContent>
          {requestSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Your ambulance request has been submitted successfully!
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Patient Name"
                fullWidth
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                label="Patient Phone"
                fullWidth
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                margin="normal"
              />
              <TextField
                label="Pickup Location Address"
                fullWidth
                value={requestLocation}
                onChange={(e) => setRequestLocation(e.target.value)}
                margin="normal"
                required
                helperText="Enter pickup address, or enable 'Use my current map location'"
              />
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <input
                  type="checkbox"
                  checked={requestUseCurrentLocation}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRequestUseCurrentLocation(checked);
                    if (checked && userLocation && !requestLocation && getAddressFromCoordinates) {
                      getAddressFromCoordinates(userLocation.lat, userLocation.lng)
                        .then(addr => {
                          if (addr && !requestLocation) setRequestLocation(addr);
                        })
                        .catch(() => {
                          // ignore reverse geocode failure
                        });
                    }
                  }}
                  style={{ marginRight: 8 }}
                  id="use-current-location"
                />
                <label htmlFor="use-current-location">Use my current map location</label>
              </Box>
              <TextField
                label="Destination Address (optional)"
                fullWidth
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                margin="normal"
              />

              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={needsBlood}
                  onChange={(e) => setNeedsBlood(e.target.checked)}
                  style={{ marginRight: 8 }}
                  id="needs-blood"
                />
                <label htmlFor="needs-blood">Need blood with the ambulance (optional)</label>
              </Box>

              <TextField
                select
                label="Urgency (optional)"
                fullWidth
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                margin="normal"
                helperText="How critical is the situation?"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>

              <TextField
                label="Additional Details"
                fullWidth
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                margin="normal"
                multiline
                rows={4}
                helperText="Describe the emergency situation (optional)"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenRequestDialog(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                setRequestLoading(true);
                // Validate required fields (use parentheses to avoid precedence bugs)
                if (!patientName || (!requestLocation && !requestUseCurrentLocation)) {
                  setError('Please provide patient name and pickup location.');
                  setRequestLoading(false);
                  return;
                }

                // Backend route is protected; fail fast with a clear message
                const token = localStorage.getItem('token');
                if (!token) {
                  setError('You must be logged in to request an ambulance.');
                  setRequestLoading(false);
                  return;
                }

                // Resolve pickup coordinates and address
                let pickupAddress = requestLocation;
                let pickupLatLng: { lat: number; lng: number } | null = null;

                if (requestUseCurrentLocation) {
                  if (!userLocation) {
                    setError('Current location is not available. Click "Get My Location" first, or enter a full pickup address.');
                    setRequestLoading(false);
                    return;
                  }
                  pickupLatLng = userLocation;
                  if (!pickupAddress && getAddressFromCoordinates) {
                    try {
                      const addr = await getAddressFromCoordinates(userLocation.lat, userLocation.lng);
                      if (addr) pickupAddress = addr;
                    } catch {
                      // ignore
                    }
                  }
                  if (!pickupAddress) {
                    pickupAddress = `Lat ${userLocation.lat.toFixed(6)}, Lng ${userLocation.lng.toFixed(6)}`;
                  }
                } else {
                  // Geocode typed address
                  try {
                    if (!(window as any).google?.maps?.Geocoder) {
                      throw new Error('Google Maps is not loaded. Please wait for the map to load, then try again.');
                    }
                    const geocoder = new (window as any).google.maps.Geocoder();
                    const results = await withTimeout(
                      new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
                        geocoder.geocode(
                          { address: requestLocation },
                          (res: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
                            if (status === 'OK' && res) resolve(res);
                            else reject(new Error(`Geocoding failed: ${status}`));
                          }
                        );
                      }),
                      10000,
                      'Geocoding timed out. Please check your internet connection and try again.'
                    );
                    if (results && results[0] && results[0].geometry) {
                      const loc = results[0].geometry.location;
                      pickupLatLng = { lat: loc.lat(), lng: loc.lng() };
                      pickupAddress = results[0].formatted_address || pickupAddress;
                    }
                  } catch (e: any) {
                    // Pickup is required (backend needs lat/lng). Show the real reason to the user.
                    const message =
                      e?.message ||
                      'Could not find that pickup address. Please enter a more specific address (include city), or enable "Use my current map location".';
                    setError(message);
                    setRequestLoading(false);
                    return;
                  }
                }

                // Destination (optional)
                let destinationPayload: { address: string; latitude?: number; longitude?: number } | undefined;
                if (destinationAddress) {
                  destinationPayload = { address: destinationAddress };
                  try {
                    if (!(window as any).google?.maps?.Geocoder) {
                      throw new Error('Google Maps is not loaded. Please wait for the map to load, then try again.');
                    }
                    const geocoder = new (window as any).google.maps.Geocoder();
                    const results = await withTimeout(
                      new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
                        geocoder.geocode(
                          { address: destinationAddress },
                          (res: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
                            if (status === 'OK' && res) resolve(res);
                            else reject(new Error(`Geocoding failed: ${status}`));
                          }
                        );
                      }),
                      10000,
                      'Destination geocoding timed out. Please try again.'
                    );
                    if (results && results[0] && results[0].geometry) {
                      const loc = results[0].geometry.location;
                      destinationPayload.latitude = loc.lat();
                      destinationPayload.longitude = loc.lng();
                      destinationPayload.address = results[0].formatted_address || destinationPayload.address;
                    }
                  } catch {
                    // ignore geocode failure, keep address only
                  }
                }

                if (!pickupLatLng) {
                  setError('Could not resolve pickup coordinates. Please enable location or enter a valid address.');
                  setRequestLoading(false);
                  return;
                }

                // Submit request
                await withTimeout(
                  ambulanceService.createAmbulanceRequest({
                    patientName,
                    patientPhone,
                    needsBlood,
                    urgency,
                    pickupLocation: {
                      address: pickupAddress,
                      latitude: pickupLatLng.lat,
                      longitude: pickupLatLng.lng,
                    },
                    destination: destinationPayload,
                    emergencyDetails: requestDetails,
                  }),
                  15000,
                  'Request timed out. Make sure the backend server is running and try again.'
                );

                setRequestSuccess(true);
                await loadUserRequests();
              } catch (err: any) {
                console.error('Error submitting request:', err);
                const message =
                  err?.response?.data?.message ||
                  err?.response?.data?.error ||
                  err?.message ||
                  'Failed to submit request. Please try again.';
                setError(message);
              } finally {
                setRequestLoading(false);
              }
            }}
            color="primary"
            variant="contained"
            disabled={requestLoading || requestSuccess}
          >
            {requestLoading ? <CircularProgress size={24} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AmbulanceTrackingPage;