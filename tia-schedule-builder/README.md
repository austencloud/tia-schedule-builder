# TIA Schedule Builder

An enhanced, modular web application for analyzing staff scheduling and payroll data with interactive visualizations and glass morphism design.

## 🚀 Features

- **Interactive Staff Table**: Sortable columns, search functionality, and filtering options
- **Enhanced Calendar View**: Glass morphism staff badges with color coding and time ranges
- **Clickable Day Details**: Modal popups with comprehensive daily information
- **Responsive Design**: Mobile-friendly layout with adaptive components
- **Smooth Navigation**: Section-based navigation with keyboard shortcuts
- **Detailed Analytics**: Comprehensive reporting and insights

## 📁 Project Structure

```
tia-schedule-builder/
├── index.html                 # Main application entry point
├── README.md                  # Project documentation
├── css/                       # Stylesheets directory
│   ├── main.css              # Core styles and variables
│   ├── calendar.css          # Calendar-specific styles
│   ├── table.css             # Table and data display styles
│   └── modal.css             # Modal and popup styles
├── js/                        # JavaScript modules
│   ├── main.js               # Application initialization and coordination
│   ├── table-handler.js      # Interactive table functionality
│   ├── calendar-handler.js   # Calendar rendering and interactions
│   ├── modal-handler.js      # Modal management and content
│   └── navigation.js         # Navigation and smooth scrolling
└── reports/                   # Additional reports and analysis
    └── detailed-analysis.html # Comprehensive analysis report
```

## 🎨 Design System

### Color Scheme

- **Primary**: Blue (#3498db) for navigation and accents
- **Success**: Green (#27ae60) for positive metrics
- **Warning**: Orange (#f39c12) for attention items
- **Danger**: Red (#e74c3c) for critical issues
- **Info**: Teal (#17a2b8) for informational content

### Staff Color Mapping

Each staff member has a unique color for easy identification:

- **Rob**: Red (#e74c3c)
- **Grace**: Blue (#3498db)
- **Domingo**: Purple (#9b59b6)
- **Athena**: Orange (#e67e22)
- **Miranda**: Teal (#1abc9c)
- **Taylor**: Yellow (#f39c12)
- **Gemma**: Green (#2ecc71)
- **Bayla**: Dark Blue (#34495e)
- **Morph**: Pink (#e91e63)
- **Emilie**: Purple (#8e44ad)
- **Cam**: Dark Teal (#16a085)
- **Courtney**: Dark Orange (#d35400)
- **Donnie**: Gray (#7f8c8d)

## 🛠️ Technical Implementation

### JavaScript Modules

#### Main.js

- Application initialization and coordination
- Data management and state handling
- Error handling and user feedback
- Event coordination between modules

#### TableHandler.js

- Interactive table rendering and management
- Sorting, filtering, and search functionality
- Dynamic data updates and calculations
- Summary statistics and metrics

#### CalendarHandler.js

- Calendar grid generation and rendering
- Staff badge creation with glass morphism effects
- Day interaction handling and preview effects
- Responsive calendar behavior

#### ModalHandler.js

- Day detail modal management
- Dynamic content population
- Event and staff information display
- Accessibility and keyboard navigation

#### Navigation.js

- Smooth scrolling between sections
- Active section highlighting
- Keyboard shortcuts (Ctrl+1-4)
- Scroll-to-top functionality

### CSS Architecture

#### Main.css

- CSS custom properties for consistent theming
- Base styles and typography
- Layout containers and responsive grid
- Staff color definitions and utility classes

#### Calendar.css

- Calendar grid layout and responsive behavior
- Glass morphism effects for staff badges
- Hover animations and transitions
- Mobile-specific calendar adaptations

#### Table.css

- Interactive table styling and sorting indicators
- Utilization badge styling and color coding
- Search and filter control styling
- Mobile table optimizations

#### Modal.css

- Modal overlay and content styling
- Animation keyframes for smooth transitions
- Responsive modal behavior
- Accessibility focus management

## 📊 Data Structure

### Staff Data Format

```javascript
{
    name: 'Staff Name',
    type: 'Primary|Volunteer|Live-in',
    rate: 20.00,                    // Hourly rate
    hours: 64,                      // Total monthly hours
    pay: 1280.00,                   // Total monthly pay
    weeklyDesired: 20,              // Desired weekly hours
    monthlyDesired: 86.0,           // Calculated monthly desired (weekly × 4.3)
    utilization: 74                 // Utilization percentage
}
```

### Calendar Data Format

```javascript
{
    day: 1,
    date: '2025-06-01',
    dayName: 'Sunday',
    staff: [
        {
            name: 'Grace',
            time: '11am-7pm',
            role: 'Animal Care',
            hours: 8
        }
    ],
    totalHours: 16,
    events: ['Regular operations', 'Volunteer orientation at 2pm'],
    notes: 'Busy Sunday with good coverage'
}
```

## 🚀 Getting Started

### Quick Start Options

1. **🖥️ Full Version (Recommended)**

   - Double-click `start-server.bat` (Windows)
   - Or run: `python -m http.server 8000`
   - Open browser to: `http://localhost:8000`
   - **Why needed:** Avoids CORS errors with ES6 modules

2. **📄 Standalone Version**

   - Open `index-standalone.html` directly
   - Limited functionality but works without server

3. **🚀 Smart Launcher**
   - Open `launch.html` for guided setup
   - Auto-detects if server is running

### CORS Issue Resolution

**Problem:** Modern browsers block ES6 module imports from `file://` protocol
**Solution:** Run a local HTTP server using one of these methods:

| Method     | Command                              | Requirements |
| ---------- | ------------------------------------ | ------------ |
| Batch File | Double-click `start-server.bat`      | Windows      |
| PowerShell | Right-click `start-server.ps1` → Run | Windows      |
| Python     | `python -m http.server 8000`         | Python 3.x   |
| Node.js    | `npx http-server -p 8000`            | Node.js      |
| VS Code    | Install Live Server extension        | VS Code      |

### Using the Application

1. **Navigate Sections**

   - Use navigation bar or keyboard shortcuts (Ctrl+1-4)

2. **Interact with Data**

   - Click table headers to sort data
   - Use search and filter controls
   - Click calendar days for detailed information

3. **View Reports**
   - Access detailed analysis from navigation
   - Print functionality available (Ctrl+P)

## 🔧 Customization

### Adding New Staff Members

1. Update the `staffData` array in `js/main.js`
2. Add color definition in `css/main.css` under `:root` variables
3. Add staff badge class in `css/main.css`

### Modifying Calendar Data

1. Update the `generateCalendarData()` method in `js/calendar-handler.js`
2. Ensure data follows the established format structure

### Styling Customization

1. Modify CSS custom properties in `css/main.css` for global changes
2. Update individual module CSS files for specific component styling

## 📱 Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+
- **Features Used**: CSS Grid, Flexbox, ES6 Modules, Intersection Observer

## 🔄 Future Enhancements

- Real-time data integration with backend APIs
- Advanced filtering and search capabilities
- Export functionality (PDF, Excel, CSV)
- User preferences and customization options
- Advanced analytics and reporting features
- Integration with external calendar systems

## 📄 License

This project is developed for TIA (The Incredible Animals) internal use. All rights reserved.

## 🤝 Contributing

For internal development:

1. Follow the established module structure
2. Maintain consistent coding style
3. Update documentation for new features
4. Test across supported browsers

## 📞 Support

For technical support or feature requests, contact the TIA development team.
