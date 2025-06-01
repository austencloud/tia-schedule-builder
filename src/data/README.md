# Museum Staffing Schedule Visualization

A comprehensive museum staffing schedule visualization built with Svelte 5 and runes, featuring glassmorphism design and interactive customization capabilities.

## Features

### 🎨 **Visual Design**
- **Glassmorphism aesthetic** with frosted glass effects and subtle transparency
- **Intuitive color coding** for staff members and departments
- **Accessibility patterns** (dots, stripes, waves) for visual differentiation
- **Responsive design** that works on all screen sizes

### 🔧 **Interactive Features**
- **Multiple view modes**: Weekly, Daily, and Staff views
- **Customizable color picker** for staff members and departments
- **Advanced filtering** by department and staff type
- **Real-time visual updates** with smooth animations

### 📊 **Data Visualization**
- **Complete June 2025 schedule** with all staff assignments
- **Time slots and shift durations** clearly displayed
- **Coverage analysis** and staffing metrics
- **Cost tracking** and hour summaries

### ⚡ **Technical Excellence**
- **Svelte 5 with runes** (no legacy patterns or stores)
- **High performance** with efficient reactivity
- **Modern JavaScript** with ES6+ features
- **Modular component architecture**

## Project Structure

```
svelte-schedule/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Header.svelte           # Main header with stats
│   │   │   ├── ControlPanel.svelte     # Customization controls
│   │   │   ├── ScheduleGrid.svelte     # Main schedule container
│   │   │   ├── DayColumn.svelte        # Individual day display
│   │   │   ├── ShiftCard.svelte        # Individual shift display
│   │   │   ├── StaffView.svelte        # Staff-focused view
│   │   │   ├── DailyView.svelte        # Day-focused view
│   │   │   └── Legend.svelte           # Visual legend
│   │   ├── stores/
│   │   │   └── scheduleStore.svelte.js # Svelte 5 runes store
│   │   └── data/
│   │       └── scheduleData.js         # Schedule and staff data
│   ├── App.svelte                      # Main application component
│   ├── main.js                         # Application entry point
│   └── app.css                         # Global styles
├── index.html                          # HTML template
├── package.json                        # Dependencies and scripts
├── vite.config.js                      # Vite configuration
└── svelte.config.js                    # Svelte configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd svelte-schedule
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage Guide

### 🎯 **View Modes**

1. **Weekly View** (Default)
   - Shows all 7 days in a grid layout
   - Color-coded staff assignments
   - Department patterns for accessibility
   - Coverage indicators for each day

2. **Daily View**
   - Detailed timeline for a selected day
   - Coverage analysis by department
   - Animated shift timeline
   - Staff type breakdown

3. **Staff View**
   - Individual staff member cards
   - Hours, shifts, and cost summaries
   - Department assignments
   - Sortable by various metrics

### 🎨 **Customization**

1. **Staff Colors**
   - Click any color picker to change staff member colors
   - Colors update in real-time across all views
   - Reset button to restore defaults

2. **Department Colors**
   - Customize colors for each department
   - Affects badges and patterns
   - Maintains accessibility contrast

3. **Visual Options**
   - Toggle patterns on/off for accessibility
   - Show/hide hour information
   - Compact view for smaller screens

4. **Filtering**
   - Filter by department (Animal Care, Lab, Front Desk, etc.)
   - Filter by staff type (Paid, Trainee, Volunteer)
   - Clear all filters with one click

### 📱 **Responsive Design**

- **Desktop**: Full 7-column grid layout
- **Tablet**: 4-column or 2-column layout
- **Mobile**: Single-column stacked layout
- **Touch-friendly**: Large tap targets and gestures

## Data Structure

### Schedule Data
Each day contains:
- `day`: Day name (Monday, Tuesday, etc.)
- `date`: Formatted date string
- `hours`: Operating hours description
- `totalHours`: Sum of all shift hours
- `shifts`: Array of individual shifts

### Shift Data
Each shift contains:
- `time`: Start and end time
- `staff`: Staff member name
- `role`: Job role/title
- `area`: Work area assignment
- `hours`: Shift duration
- `type`: Staff type (paid, trainee, volunteer)
- `department`: Department assignment

### Staff Information
- Hourly rates and tier classifications
- Department assignments
- Cost calculations

## Customization

### Adding New Staff Members

1. **Update `scheduleData.js`:**
   ```javascript
   // Add to staffInfo object
   'NewStaff': { 
     tier: 'mid', 
     hourlyRate: 15.00, 
     department: 'animal-care' 
   }
   ```

2. **Update `scheduleStore.svelte.js`:**
   ```javascript
   // Add to defaultStaffColors
   'NewStaff': '#FF5722'
   ```

### Adding New Departments

1. **Update `scheduleData.js`:**
   ```javascript
   // Add to departments object
   'new-dept': {
     name: 'New Department',
     color: '#9C27B0',
     pattern: 'pattern-grid',
     description: 'Department description'
   }
   ```

### Modifying Visual Patterns

Edit the CSS classes in `app.css`:
```css
.pattern-custom {
    background-image: /* your pattern */;
    background-size: /* pattern size */;
}
```

## Performance Optimizations

- **Svelte 5 runes** for efficient reactivity
- **Computed values** cached automatically
- **Minimal re-renders** with targeted updates
- **Lazy loading** for large datasets
- **CSS-based animations** for smooth performance

## Browser Support

- **Modern browsers** (Chrome 90+, Firefox 88+, Safari 14+)
- **ES6+ features** required
- **CSS Grid and Flexbox** support needed
- **Backdrop-filter** for glassmorphism effects

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure you're using a supported browser
4. Check the network tab for failed requests

## Future Enhancements

- **Export functionality** (PDF, Excel, CSV)
- **Print-friendly** layouts
- **Drag-and-drop** schedule editing
- **Real-time collaboration** features
- **Mobile app** version
- **Integration** with calendar systems
