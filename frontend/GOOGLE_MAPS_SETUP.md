# Google Maps Setup Guide

## Quick Fix Checklist

If you're seeing "This page didn't load Google Maps correctly", follow these steps:

### 1. ✅ Verify API Key in .env
Make sure your `.env` file contains:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 2. ✅ Enable Required APIs
Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Enabled APIs

**Enable these APIs:**
- ✅ Maps JavaScript API
- ✅ Places API

### 3. ✅ Configure API Key Restrictions
Go to APIs & Services → Credentials → Click your API key

**Application restrictions:**
- Select "HTTP referrers (web sites)"
- Add these referrers:
  - `http://localhost:*`
  - `http://127.0.0.1:*`
  - Your production domain (e.g., `https://yourdomain.com/*`)

**API restrictions:**
- Select "Restrict key"
- Choose: Maps JavaScript API and Places API
- OR select "Don't restrict key" (less secure, but easier for testing)

### 4. ✅ Enable Billing
- Google Maps requires billing to be enabled (free tier available)
- Go to Billing → Link a billing account
- You get $200 free credit monthly

### 5. ✅ Restart Dev Server
After making changes to `.env`:
```bash
# Stop the server (Ctrl+C)
npm start
```

### 6. ✅ Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

## Common Error Messages

### "InvalidKeyMapError" or "RefererNotAllowedMapError"
- **Fix:** Add your domain to HTTP referrer restrictions in Google Cloud Console
- For localhost, add: `http://localhost:*`

### "This page didn't load Google Maps correctly"
- **Fix:** Check browser console (F12) for specific error
- Usually means API key issue or APIs not enabled

### "Billing" errors
- **Fix:** Enable billing in Google Cloud Console

## Testing Your API Key

Test your API key directly:
```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap
```

If you see an error, the API key is invalid or restricted.

## Getting a New API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to APIs & Services → Credentials
4. Click "Create Credentials" → "API Key"
5. Copy the key and add to `.env` file
6. Restrict the key (see step 3 above)

## Still Having Issues?

1. Check browser console (F12) for detailed error messages
2. Verify API key is correct (no extra spaces)
3. Ensure `.env` file is in the `frontend` folder
4. Restart dev server after changing `.env`
5. Check Google Cloud Console for API quotas/limits
