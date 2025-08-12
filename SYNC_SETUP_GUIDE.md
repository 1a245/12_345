# M13 Business Management - Data Synchronization Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up/Login with GitHub or email
4. Click "New Project"
5. Choose your organization
6. Fill in project details:
   - **Name**: `M13 Business Management`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
7. Click "Create new project"
8. Wait 2-3 minutes for setup to complete

### Step 2: Get API Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Anon/Public Key** (long string starting with `eyJ...`)

### Step 3: Configure Your App
1. Open the `.env` file in your project root
2. Replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-actual-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```
3. Save the file
4. Restart your development server: `npm run dev`

### Step 4: Run Database Migration
The database schema will be created automatically when you first connect. The migration file is already included in your project.

### Step 5: Verify Connection
1. Open your app in the browser
2. Look for the connection status in the top-right corner
3. You should see "Online" instead of "Local Only"
4. Try logging in with: `admin@m13.com` / `admin123`

## 🔄 How Synchronization Works

### Automatic Sync
- **Real-time**: Changes sync automatically when online
- **Offline-first**: App works without internet, syncs when reconnected
- **Multi-device**: Same login works across all devices
- **Conflict resolution**: Latest changes take precedence

### Data Flow
```
Local Storage ←→ Supabase Cloud ←→ Other Devices
     ↓                ↓                ↓
  Your Phone      Cloud Backup    Your Computer
```

### Sync Status Indicators
- 🟢 **Online** - Connected and syncing
- 🟠 **Offline Mode** - Local storage only
- 🔄 **Syncing...** - Currently uploading/downloading
- ❌ **Sync Error** - Connection issue (will retry)

## 📱 Multi-Device Setup

### On Each Device:
1. Use the same `.env` configuration
2. Login with the same email/password
3. Data will automatically sync

### For Mobile (Android):
1. Build the app: `npm run android:build`
2. The same Supabase credentials work on mobile
3. Data syncs between web and mobile versions

## 🛠️ Troubleshooting

### Connection Issues
1. **Check credentials**: Use the Debug Panel (🐛 icon)
2. **Verify internet**: Ensure stable connection
3. **Check Supabase status**: Visit status.supabase.com
4. **Browser console**: Look for error messages

### Common Problems

**"Local Only" showing instead of "Online":**
- Verify `.env` file has correct credentials
- Restart development server
- Check if Supabase project is active

**Sync not working:**
- Check network connection
- Verify API keys are correct
- Look at browser developer tools for errors

**Data not appearing on other devices:**
- Ensure same login credentials
- Check if both devices show "Online" status
- Try manual sync using the Sync button

## 🔐 Security Features

- **Password hashing**: All passwords are SHA-256 hashed
- **Row Level Security**: Users only see their own data
- **API key protection**: Anon key is safe for client-side use
- **User isolation**: Complete data separation between users

## 📊 Data Migration

### First Time Setup:
1. **Existing local data** is preserved
2. **First device** uploads all local data to cloud
3. **Subsequent devices** download cloud data
4. **No data loss** - everything is backed up

### Adding New Device:
1. Install app with same Supabase credentials
2. Login with existing account
3. All data downloads automatically
4. Start using immediately

## 🎯 Testing Your Setup

### Quick Test:
1. Add a person in Village settings
2. Check connection status shows "Online"
3. Open app on another device/browser
4. Login with same credentials
5. Verify the person appears

### Advanced Test:
1. Disconnect internet
2. Add some data (should work offline)
3. Reconnect internet
4. Watch sync status change to "Syncing..."
5. Data should appear on other devices

## 📞 Support

If you need help:
1. Use the Debug Panel to copy system information
2. Check browser console for error messages
3. Verify Supabase project is active and accessible

## 🎉 You're All Set!

Once configured, your M13 Business Management app will:
- ✅ Sync data across all devices
- ✅ Work offline when needed
- ✅ Backup everything to the cloud
- ✅ Support multiple users
- ✅ Provide real-time updates

Happy managing! 🚀