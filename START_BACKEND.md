# How to Start the Backend Server

## Quick Start

1. **Open a terminal/command prompt**

2. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

3. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

   Or if you want to use the compiled version:
   ```bash
   npm run build
   npm start
   ```

## What You Should See

When the server starts successfully, you should see:
```
Connected to MongoDB
Server running on port 5000
```

## Troubleshooting

### If MongoDB connection fails:
- Make sure MongoDB is installed and running
- Check if MongoDB is running on `localhost:27017`
- Or update the `MONGODB_URI` in your `.env` file

### If port 5000 is already in use:
- Change the port in `backend/.env` file:
  ```
  PORT=5001
  ```
- Then update `frontend/.env` file:
  ```
  REACT_APP_API_URL=http://localhost:5001/api
  ```

### Check if server is running:
- Open browser and go to: `http://localhost:5000/api/status`
- You should see: `{"status":"ok","message":"Server is running",...}`

## Environment Variables

Create a `.env` file in the `backend` directory if it doesn't exist:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mediconnect
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:3000
```

## After Starting Backend

1. Keep the backend terminal running
2. In a **separate terminal**, start the frontend:
   ```bash
   cd frontend
   npm start
   ```

Both servers should now be running and communicating!

