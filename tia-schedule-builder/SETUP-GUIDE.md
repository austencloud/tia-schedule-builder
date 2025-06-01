# 🚀 TIA Schedule Builder - Setup Guide

This guide will help you resolve CORS errors and run the TIA Schedule Builder application locally with full functionality.

## 🔍 Understanding the CORS Issue

**Why CORS errors occur:**
- Modern browsers block ES6 module imports when files are served from `file://` protocol
- Security policy prevents local files from accessing other local files as modules
- ES6 modules require HTTP/HTTPS protocol to work properly

**Error messages you might see:**
- "Access to script at 'file:///.../main.js' from origin 'null' has been blocked by CORS policy"
- "Failed to load resource: net::ERR_FAILED"
- "Cross origin requests are only supported for protocol schemes: http, https"

## 🛠️ Solution Methods (Choose One)

### Method 1: Quick Start with Batch File (Windows) ⚡

**Easiest option - Just double-click!**

1. **Double-click** `start-server.bat` in the project folder
2. The script will automatically:
   - Check for Python installation
   - Start a local server on port 8000
   - Display the URL to open
3. **Open your browser** and go to: `http://localhost:8000`
4. **Stop the server** by pressing `Ctrl+C` in the command window

### Method 2: Python HTTP Server 🐍

**Requirements:** Python 3.x installed

**Steps:**
1. Open Command Prompt or Terminal
2. Navigate to the project folder:
   ```bash
   cd path/to/tia-schedule-builder
   ```
3. Start the server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or if you have Python 2
   python -m SimpleHTTPServer 8000
   ```
4. Open browser and go to: `http://localhost:8000`

### Method 3: Node.js HTTP Server 📦

**Requirements:** Node.js installed

**Steps:**
1. Open Command Prompt or Terminal
2. Navigate to the project folder:
   ```bash
   cd path/to/tia-schedule-builder
   ```
3. Install http-server globally (one-time setup):
   ```bash
   npm install -g http-server
   ```
4. Start the server:
   ```bash
   npm start
   # Or directly:
   http-server -p 8000 -o
   ```
5. Browser should open automatically to `http://localhost:8000`

### Method 4: Live Server (VS Code Extension) 💻

**Requirements:** Visual Studio Code

**Steps:**
1. Install "Live Server" extension in VS Code
2. Open the project folder in VS Code
3. Right-click on `index.html`
4. Select "Open with Live Server"
5. Browser opens automatically with live reload

### Method 5: Standalone Version (Limited Features) 📄

**For immediate testing without server setup:**

1. Open `index-standalone.html` directly in your browser
2. **Note:** This version has limited functionality
3. For full features, use one of the server methods above

## ✅ Verification Steps

Once your server is running, verify everything works:

### 1. **Check Console for Errors**
- Open browser Developer Tools (F12)
- Look for any red error messages
- Should see: "✅ TIA Schedule Builder initialized successfully"

### 2. **Test Interactive Features**
- **Navigation:** Click navigation links to jump between sections
- **Table Sorting:** Click column headers in the staff table
- **Calendar Interaction:** Click calendar days to open detail modals
- **Search/Filter:** Use table controls to filter data

### 3. **Verify All Modules Load**
Check that these files load without errors:
- `js/main.js`
- `js/table-handler.js`
- `js/calendar-handler.js`
- `js/modal-handler.js`
- `js/navigation.js`

## 🔧 Troubleshooting

### Problem: "Python is not recognized"
**Solution:** Install Python from [python.org](https://python.org) or use Node.js method

### Problem: "Port 8000 is already in use"
**Solutions:**
- Use a different port: `python -m http.server 8080`
- Kill the process using port 8000
- Try ports 3000, 5000, or 8080

### Problem: Browser shows "This site can't be reached"
**Solutions:**
- Ensure the server is still running
- Check the correct URL: `http://localhost:8000` (not `https://`)
- Try `http://127.0.0.1:8000` instead

### Problem: CSS/JS files not loading
**Solutions:**
- Verify all files are in correct directories
- Check file paths in HTML are relative (start with `./`)
- Ensure server is serving from the project root directory

### Problem: Modal not opening when clicking calendar days
**Solutions:**
- Check browser console for JavaScript errors
- Ensure all JS modules loaded successfully
- Verify you're using the full version, not standalone

## 📁 File Structure Verification

Ensure your project structure looks like this:
```
tia-schedule-builder/
├── index.html                 ✓ Main application
├── index-standalone.html      ✓ Fallback version
├── start-server.bat          ✓ Quick start script
├── package.json              ✓ Node.js configuration
├── css/
│   ├── main.css              ✓ Core styles
│   ├── calendar.css          ✓ Calendar styles
│   ├── table.css             ✓ Table styles
│   └── modal.css             ✓ Modal styles
├── js/
│   ├── main.js               ✓ Main application logic
│   ├── table-handler.js      ✓ Table functionality
│   ├── calendar-handler.js   ✓ Calendar functionality
│   ├── modal-handler.js      ✓ Modal management
│   └── navigation.js         ✓ Navigation handling
└── reports/
    └── detailed-analysis.html ✓ Additional report
```

## 🎯 Quick Commands Reference

| Method | Command | URL |
|--------|---------|-----|
| Python 3 | `python -m http.server 8000` | http://localhost:8000 |
| Node.js | `npx http-server -p 8000` | http://localhost:8000 |
| NPM | `npm start` | http://localhost:8000 |
| Batch File | Double-click `start-server.bat` | http://localhost:8000 |

## 🔒 Security Notes

- Local servers are only accessible from your computer
- No external network access unless specifically configured
- Safe for development and testing purposes
- Stop the server when not in use

## 📞 Still Having Issues?

If you continue to experience problems:

1. **Check browser compatibility:** Use Chrome 80+, Firefox 75+, Safari 13+, or Edge 80+
2. **Clear browser cache:** Hard refresh with Ctrl+F5
3. **Try incognito/private mode:** Rules out extension conflicts
4. **Check antivirus/firewall:** May block local server connections
5. **Use alternative port:** Try 3000, 5000, or 8080 instead of 8000

## 🎉 Success!

Once everything is working, you should see:
- ✅ Interactive staff table with sorting and filtering
- ✅ Beautiful calendar with glass morphism staff badges
- ✅ Clickable day details with comprehensive information
- ✅ Smooth navigation between sections
- ✅ Responsive design that works on mobile devices

**Enjoy exploring your TIA Schedule Builder application!** 🚀
