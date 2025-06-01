// Generate Enhanced Calendar HTML with Glass Morphism Staff Badges
// Extracts time ranges, roles, and events from june_2025.json

import fs from 'fs';

// Function to parse staff assignments with enhanced details
function parseStaffAssignmentsEnhanced(staffedArray) {
  const assignments = [];
  
  if (!staffedArray || !Array.isArray(staffedArray)) return assignments;
  
  staffedArray.forEach(entry => {
    if (!entry || entry.trim() === '') return;
    
    // Enhanced patterns to extract staff, time, and role information
    const patterns = [
      // Pattern: "Grace 11-5 animal care" or "Grace 11am-5pm front desk"
      /(\w+)\s+(\d{1,2}(?::\d{2})?(?:am|pm)?-\d{1,2}(?::\d{2})?(?:am|pm)?)\s*(.+)?/i,
      // Pattern: "lab: Grace 11-5" or "Lab Grace 11-5"
      /(?:lab[:\s]*)?(\w+)\s+(\d{1,2}(?::\d{2})?-\d{1,2}(?::\d{2})?)/i,
      // Pattern: "Grace (11-5)" 
      /(\w+)\s*\((\d{1,2}(?::\d{2})?-\d{1,2}(?::\d{2})?)\)/i,
      // Basic pattern: "Grace 11-5"
      /(\w+)\s+(\d{1,2}(?::\d{2})?-\d{1,2}(?::\d{2})?)/i
    ];
    
    let match = null;
    for (const pattern of patterns) {
      match = entry.match(pattern);
      if (match) break;
    }
    
    if (match) {
      const staffName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      const timeRange = match[2];
      const roleInfo = match[3] ? match[3].trim() : '';
      
      // Skip invalid staff names
      if (['Work', 'Available', 'Lab', 'Animal', 'Front'].includes(staffName)) return;
      
      // Calculate hours and format time range
      const hours = calculateHoursFromRange(timeRange);
      const formattedTime = formatTimeRange(timeRange);
      const role = extractRole(roleInfo, entry);
      
      if (hours > 0) {
        assignments.push({
          staff: staffName,
          hours: hours,
          timeRange: formattedTime,
          role: role,
          description: entry,
          cssClass: `staff-${staffName.toLowerCase()}`
        });
      }
    }
  });
  
  return assignments;
}

// Function to extract role information
function extractRole(roleInfo, fullEntry) {
  const lowerEntry = fullEntry.toLowerCase();
  
  if (lowerEntry.includes('lab') || roleInfo.includes('lab')) return 'Lab';
  if (lowerEntry.includes('animal care') || roleInfo.includes('animal')) return 'Animal Care';
  if (lowerEntry.includes('front desk') || roleInfo.includes('front')) return 'Front Desk';
  if (lowerEntry.includes('training') || roleInfo.includes('train')) return 'Training';
  if (lowerEntry.includes('cleaning') || roleInfo.includes('clean')) return 'Cleaning';
  if (lowerEntry.includes('feeding') || roleInfo.includes('feed')) return 'Feeding';
  
  return ''; // No specific role identified
}

// Function to format time range for display
function formatTimeRange(timeRange) {
  try {
    const [start, end] = timeRange.split('-');
    
    const formatTime = (time) => {
      const cleanTime = time.trim().replace(/[^\d:apm]/gi, '');
      
      if (cleanTime.includes('am') || cleanTime.includes('pm')) {
        return cleanTime;
      }
      
      const hour = parseInt(cleanTime.split(':')[0] || cleanTime);
      if (hour <= 12) {
        return hour + (cleanTime.includes(':') ? cleanTime.substring(cleanTime.indexOf(':')) : '') + 'am';
      } else {
        return (hour - 12) + (cleanTime.includes(':') ? cleanTime.substring(cleanTime.indexOf(':')) : '') + 'pm';
      }
    };
    
    return `${formatTime(start)}-${formatTime(end)}`;
  } catch (error) {
    return timeRange;
  }
}

// Function to calculate hours from time range (same as before)
function calculateHoursFromRange(timeRange) {
  try {
    const [start, end] = timeRange.split('-');
    
    const parseTime = (timeStr) => {
      const cleanTime = timeStr.replace(/[^\d:]/g, '');
      
      if (cleanTime.includes(':')) {
        const [hour, minute] = cleanTime.split(':');
        return parseInt(hour) + (parseInt(minute) / 60);
      } else {
        return parseInt(cleanTime);
      }
    };
    
    const startHour = parseTime(start.trim());
    const endHour = parseTime(end.trim());
    
    if (startHour !== null && endHour !== null) {
      let hours = endHour - startHour;
      if (hours < 0) hours += 24;
      
      if (hours > 12) {
        return 8; // Cap at 8 hours for suspicious entries
      }
      
      return Math.round(hours * 10) / 10;
    }
  } catch (error) {
    console.log('Error parsing time range:', timeRange);
  }
  
  return 0;
}

// Function to generate enhanced calendar day HTML
function generateEnhancedCalendarDayHTML(dayData) {
  const { dayNumber, assignments, totalHours, coverageClass, events } = dayData;
  
  let html = `            <div class="calendar-day ${coverageClass}" data-day="${dayNumber}" data-date="${dayData.date}">\n`;
  html += `              <div class="day-number">${dayNumber}</div>\n`;
  
  if (assignments.length > 0) {
    html += `              <div class="staff-badges-container">\n`;
    
    assignments.forEach(assignment => {
      html += `                <div class="staff-badge ${assignment.cssClass}">\n`;
      html += `                  <span class="staff-name">${assignment.staff}</span>\n`;
      html += `                  <span class="staff-time">${assignment.timeRange}</span>\n`;
      if (assignment.role) {
        html += `                  <span class="staff-role">${assignment.role}</span>\n`;
      }
      html += `                </div>\n`;
    });
    
    html += `              </div>\n`;
  }
  
  // Add total hours if there's coverage
  if (totalHours > 0) {
    html += `              <div class="day-total">${totalHours}h</div>\n`;
  }
  
  html += `            </div>\n`;
  
  return html;
}

// Generate enhanced calendar data
function generateEnhancedCalendarData() {
  try {
    const jsonData = JSON.parse(fs.readFileSync('june_2025.json', 'utf8'));
    
    // Create a map of dates to enhanced staff assignments
    const dateMap = new Map();
    
    jsonData.forEach(entry => {
      if (!entry.date) return;
      
      const date = entry.date;
      const assignments = parseStaffAssignmentsEnhanced(entry.staffed);
      const events = entry.event ? [entry.event] : [];
      
      if (dateMap.has(date)) {
        const existing = dateMap.get(date);
        existing.assignments = existing.assignments.concat(assignments);
        existing.events = existing.events.concat(events);
        existing.totalHours = existing.assignments.reduce((sum, a) => sum + a.hours, 0);
      } else {
        const totalHours = assignments.reduce((sum, a) => sum + a.hours, 0);
        dateMap.set(date, {
          date: date,
          day: entry.day,
          assignments: assignments,
          totalHours: totalHours,
          coverageClass: totalHours >= 8 ? 'has-coverage' : totalHours > 0 ? 'minimal-coverage' : 'no-coverage',
          events: events
        });
      }
    });
    
    // Generate calendar days for June 2025
    const calendarDays = [];
    
    for (let day = 1; day <= 30; day++) {
      const dateStr = `2025-06-${day.toString().padStart(2, '0')}`;
      const dayData = dateMap.get(dateStr);
      
      if (dayData) {
        calendarDays.push({
          dayNumber: day,
          ...dayData
        });
      } else {
        calendarDays.push({
          dayNumber: day,
          date: dateStr,
          assignments: [],
          totalHours: 0,
          coverageClass: 'no-coverage',
          events: []
        });
      }
    }
    
    return calendarDays;
    
  } catch (error) {
    console.error('Error generating enhanced calendar data:', error.message);
    return [];
  }
}

// Generate and output enhanced calendar HTML
console.log('Generating enhanced calendar with glass morphism badges...\n');

const calendarDays = generateEnhancedCalendarData();

console.log('<!-- ENHANCED JUNE 2025 CALENDAR WITH GLASS MORPHISM BADGES -->');

calendarDays.forEach(dayData => {
  console.log(generateEnhancedCalendarDayHTML(dayData));
});

// Export for use in other scripts
export { calendarDays, generateEnhancedCalendarDayHTML };
