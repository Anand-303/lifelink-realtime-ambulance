# Admin Dashboard Guide

## Overview
The admin dashboard provides comprehensive management capabilities for the ambulance tracking system, including:
- **Ambulance Requests Management**: View and manage all user ambulance requests
- **Blood Requests Management**: View and manage all user blood donation requests
- **Ambulance Fleet Management**: Add, edit, and delete ambulances with driver details

## Admin Login

### Creating an Admin Account
Admins can be created in two ways:

1. **Database Direct Creation**: Manually create a user in MongoDB with `role: "admin"`
2. **Existing User Upgrade**: Update an existing user's role to "admin" in the database

### Login Process
1. Navigate to `/login`
2. Enter admin credentials (email and password)
3. Upon successful login, admins are automatically redirected to `/admin` dashboard
4. Regular users are redirected to `/dashboard`

## Admin Dashboard Features

### 1. Ambulance Requests Tab
**View All Ambulance Requests**
- Patient Name
- Requested By (User details)
- Contact Information
- Pickup Location
- Destination
- Request Status
- Date/Time

**Manage Request Status**
- **Pending**: Accept or Cancel the request
- **Accepted**: Start the ambulance service (In-Progress)
- **In-Progress**: Mark as Completed
- **Completed/Cancelled**: View only (no actions)

### 2. Blood Requests Tab
**View All Blood Requests**
- Patient Name
- Requested By (User details)
- Contact Information
- Blood Group
- Quantity (Units)
- Hospital Name
- Urgency Level (Normal/Urgent/Critical)
- Request Status
- Date/Time

**Manage Request Status**
- **Pending**: Process or Cancel the request
- **Processing**: Mark as Fulfilled
- **Fulfilled/Cancelled**: View only (no actions)

### 3. Ambulances Tab
**View All Ambulances**
- Registration Number
- Driver Name
- Driver Contact
- Capacity
- Current Status (Available/Busy/Maintenance)

**Ambulance Management**
- **Add New Ambulance**: Create new ambulance with driver details
- **Edit Ambulance**: Update status, driver information, or capacity
- **Delete Ambulance**: Remove ambulance from the fleet

## API Endpoints

### Backend Endpoints Added

#### Ambulance Requests
- `GET /api/ambulance/request/all` - Get all ambulance requests (Admin only)
- `DELETE /api/ambulance/:id` - Delete an ambulance (Admin only)

#### Blood Requests
- `GET /api/blood-donation/request/all` - Get all blood requests (Admin only)

#### Ambulance Management
- `POST /api/ambulance` - Create new ambulance (Admin only)
- `PUT /api/ambulance/:id/status` - Update ambulance status (Admin only)
- `DELETE /api/ambulance/:id` - Delete ambulance (Admin only)

## Navigation

### Admin-Specific Navigation
When logged in as admin, the navbar displays:
- **Home**: Landing page
- **Admin Dashboard**: Main admin control panel
- **Ambulance**: Ambulance tracking
- **Blood Donation**: Blood donation services
- **Campaigns**: Campaign management

### User Menu
- **Profile**: View/edit admin profile
- **Logout**: Sign out from the system

## Testing the Admin Functionality

### Step 1: Create Admin User
```javascript
// In MongoDB or using MongoDB Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or create a new admin user:
```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$...", // hashed password
  role: "admin",
  phone: "1234567890",
  isDonor: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Step 2: Login as Admin
1. Navigate to `http://localhost:3000/login`
2. Enter admin credentials
3. You'll be redirected to `/admin`

### Step 3: Test Features
1. **View Ambulance Requests**: Check the first tab
2. **View Blood Requests**: Check the second tab
3. **Manage Ambulances**: Check the third tab
4. **Update Request Status**: Click action buttons on requests
5. **Add/Edit/Delete Ambulances**: Use the buttons in the Ambulances tab

## Security Features

### Role-Based Access Control
- All admin endpoints require authentication (`protect` middleware)
- Admin-specific endpoints require admin role (`admin` middleware)
- Frontend routes are protected with `ProtectedRoute` component
- Automatic redirection for non-admin users trying to access `/admin`

### Authentication Flow
1. User logs in with credentials
2. JWT token is generated and stored
3. Token is sent with every API request
4. Backend validates token and user role
5. Access granted/denied based on role

## Troubleshooting

### Common Issues

**Issue**: Cannot access admin dashboard
- **Solution**: Ensure user role is set to "admin" in database

**Issue**: API requests failing
- **Solution**: Check if backend server is running and JWT token is valid

**Issue**: Data not loading
- **Solution**: Verify backend endpoints are accessible and database connection is active

**Issue**: Status updates not working
- **Solution**: Check browser console for errors and verify admin permissions

## Future Enhancements

Potential improvements for the admin dashboard:
- Real-time updates using WebSockets
- Advanced filtering and search capabilities
- Analytics and reporting dashboard
- Bulk operations for requests
- Email notifications for critical requests
- Export data to CSV/PDF
- Audit logs for admin actions
