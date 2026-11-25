# AI Health Assistant Chatbot Setup Guide

## Overview
An AI-powered support chatbot has been integrated into your ambulance tracker application using the Gemini API. The chatbot provides health assistance, emergency warnings, and hospital suggestions.

## Features Implemented

### Backend Features
- ✅ **Chat API Endpoint**: `/api/chat` with Gemini API integration
- ✅ **Emergency Detection**: Automatic detection of "chest pain" and "breathing problem" with immediate warnings
- ✅ **Authentication Protection**: Chat endpoint is protected and requires user login
- ✅ **Error Handling**: Comprehensive error handling for API failures
- ✅ **Structured Responses**: Formatted responses with possible conditions, severity, advice, and recommendations

### Frontend Features
- ✅ **Floating Chat Button**: Bottom-right corner floating chat button (appears only after login)
- ✅ **Modern Chat UI**: ChatGPT-like interface with clean design
- ✅ **Message History**: Scrollable message history with user/bot differentiation
- ✅ **Loading States**: Loading indicators while waiting for AI responses
- ✅ **Responsive Design**: Mobile-friendly chat interface
- ✅ **Authentication Integration**: Chatbot only appears for authenticated users

## Setup Instructions

### 1. Backend Setup

1. **Add Gemini API Key to Environment**:
   ```bash
   # In the backend directory, create or update .env file
   cp .env.example .env
   ```

2. **Update the .env file with your Gemini API key**:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. **Install dependencies** (already done):
   ```bash
   cd backend
   npm install axios @types/axios
   ```

4. **Start the backend server**:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

The frontend is already configured. Simply start the development server:

```bash
cd frontend
npm start
```

## How It Works

### Emergency Detection
- If a user types "chest pain" or "breathing problem", the chatbot immediately responds with:
  ```
  ⚠️ Please seek immediate medical help. Call emergency services or go to the nearest emergency room right away.
  ```

### AI Responses
For other health queries, the system:
1. Sends the user's message to Gemini API with a structured prompt
2. Receives AI response in the format:
   - Possible condition
   - Severity (Low/Medium/High)
   - Advice
   - Doctor recommendation
3. Displays the response in the chat interface

### Authentication
- The chatbot floating button only appears after user login
- All API calls include the JWT token for authentication
- Unauthorized users cannot access the chat functionality

## Usage

1. **Login to the application**
2. **Click the floating chat button** in the bottom-right corner
3. **Type your health query** in the input field
4. **Receive AI-powered health assistance**
5. **Get emergency warnings** for critical symptoms

## File Structure

### Backend Files Created/Modified:
- `backend/src/controllers/chatController.ts` - Main chat logic with Gemini API integration
- `backend/src/routes/chat.ts` - Chat route definition with authentication
- `backend/src/server.ts` - Updated to include chat routes
- `backend/.env.example` - Environment variables template

### Frontend Files Created/Modified:
- `frontend/src/components/Chatbot.tsx` - Complete chatbot UI component
- `frontend/src/components/Layout/MainLayout.tsx` - Updated to include chatbot for authenticated users

## API Endpoint

### POST /api/chat

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "I have a headache and fever"
}
```

**Response:**
```json
{
  "reply": "* Possible condition: Migraine or tension headache\n* Severity: Medium\n* Advice: Rest in a quiet, dark room. Stay hydrated.\n* Doctor recommendation: Consult if symptoms persist for more than 24 hours"
}
```

## Dependencies Added

### Backend:
- `axios` - For making HTTP requests to Gemini API
- `@types/axios` - TypeScript definitions for axios

### Frontend:
- Uses existing Material-UI components and Axios (already installed)

## Security Considerations

- ✅ Chat endpoint is protected with JWT authentication
- ✅ API key is stored securely in environment variables
- ✅ Input validation on both frontend and backend
- ✅ Error handling prevents sensitive information leakage

## Next Steps

1. **Add your Gemini API key** to the backend `.env` file
2. **Test the functionality** by logging in and using the chatbot
3. **Optional**: Add MongoDB chat history storage (controller is ready for this enhancement)
4. **Optional**: Customize the AI prompt for better medical accuracy

## Troubleshooting

- **Chatbot not appearing**: Make sure you're logged in
- **API errors**: Check that your Gemini API key is correctly set in the `.env` file
- **Authentication errors**: Ensure JWT token is valid and being sent with requests
- **Build issues**: Run `npm install` in both backend and frontend directories
