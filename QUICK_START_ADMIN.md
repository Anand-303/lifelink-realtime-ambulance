# Quick Start Guide - Admin Dashboard

## 🚀 Get Started in 3 Steps

### Step 1: Create Admin User
```bash
cd backend
npm run create-admin
```
**Default Admin Credentials:**
- Email: `admin@mediconnect.com`
- Password: `admin123`

### Step 2: Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 3: Login as Admin
1. Open browser: `http://localhost:3000/login`
2. Enter admin credentials
3. You'll be redirected to Admin Dashboard at `/admin`

## 📊 What You Can Do

### Tab 1: Ambulance Requests
- View all user ambulance requests
- See patient details, pickup/destination locations
- Update status: Pending → Accepted → In-Progress → Completed
- Cancel requests if needed

### Tab 2: Blood Requests
- View all user blood donation requests
- See blood group, quantity, urgency level
- Update status: Pending → Processing → Fulfilled
- Cancel requests if needed

### Tab 3: Ambulances
- View all ambulances in the fleet
- Add new ambulances with driver details
- Edit ambulance status and information
- Delete ambulances from the system

## 🔑 Key Features

✅ **Role-Based Access** - Only admins can access the dashboard
✅ **Real-Time Updates** - Refresh data with one click
✅ **Status Management** - Easy status updates with action buttons
✅ **User Details** - See who requested ambulances/blood
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Error Handling** - Clear error and success messages

## 📱 Navigation

When logged in as admin, you'll see:
- **Home** - Landing page
- **Admin Dashboard** - Your control panel
- **Ambulance** - Track ambulances
- **Blood Donation** - Blood services
- **Campaigns** - Manage campaigns

## 🔒 Security

- JWT authentication on all requests
- Admin-only endpoints protected
- Automatic redirection for non-admins
- Secure password hashing

## 💡 Tips

1. **Create Test Data**: Login as a regular user first to create some ambulance and blood requests
2. **Refresh Data**: Use the refresh button (🔄) to reload data
3. **Status Colors**: 
   - 🟡 Yellow = Pending/Warning
   - 🔵 Blue = In Progress/Processing
   - 🟢 Green = Completed/Fulfilled/Available
   - 🔴 Red = Cancelled/Critical/Busy

## 🆘 Troubleshooting

**Can't login as admin?**
- Run `npm run create-admin` again
- Check if MongoDB is running

**Dashboard not loading?**
- Ensure backend is running on port 5000
- Check browser console for errors

**Data not showing?**
- Create some test requests as a regular user first
- Click the refresh button

## 📚 More Information

For detailed documentation, see:
- `ADMIN_GUIDE.md` - Complete admin guide
- `ADMIN_IMPLEMENTATION_SUMMARY.md` - Technical details

## 🎯 Quick Test

1. Create admin: `npm run create-admin`
2. Start servers (backend + frontend)
3. Login at `/login` with admin credentials
4. You should see the Admin Dashboard with 3 tabs
5. Try updating a request status or adding an ambulance

**That's it! You're ready to manage the system as an admin.** 🎉
