// Generate Calendar Data for TIA June 2025 Interactive Report
// Extracts accurate daily staff assignments from june_2025.json

import fs from 'fs';

// Function to parse staff assignments from staffed array (same logic as payroll analysis)
function parseStaffAssignments(staffedArray) {
  const assignments = [];
  
  if (!staffedArray || !Array.isArray(staffedArray)) return assignments;
  
  staffedArray.forEach(entry => {
    if (!entry || entry.trim() === '') return;
    
    // Extract staff name and time range using various patterns
    const patterns = [
      /(\w+)\s+(\d{1,2}(?::\d{2})?-\d{1,2}(?::\d{2})?)/i,
      /(\w+)\s+(\d{1,2}-\d{1,2})/i,
      /lab[:\s]*(\w+)\s+(\d{1,2}(?::\d{2})?-\d{1,2}(?::\d{2})?)/i,
      /(\w+)\s+(\d{1,2}:\d{2}-\d{1,2}(?::\d{2})?)/i
    ];
    
    let match = null;
    for (const pattern of patterns) {
      match = entry.match(pattern);
      if (match) break;
    }
    
    if (match) {
      const staffName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      const timeRange = match[2];
      
      // Calculate hours from time range
      const hours = calculateHoursFromRange(timeRange);
      
      if (hours > 0) {
        assignments.push({
          staff: staffName,
          hours: hours,
          timeRange: timeRange,
          description: entry
        });
      }
    }
  });
  
  return assignments;
}

// Function to calculate hours from time range (same as payroll analysis)
function calculateHoursFromRange(timeRange) {
  try {
    const [start, end] = timeRange.split('-');
    
    const startHour = parseTime(start.trim());
    const endHour = parseTime(end.trim());
    
    if (startHour !== null && endHour !== null) {
      let hours = endHour - startHour;
      if (hours < 0) hours += 24; // Handle overnight shifts
      
      // Cap unrealistic hours
      if (hours > 12) {
        console.log(`⚠️  Suspicious hours: ${timeRange} = ${hours}h (capping at 8h)`);
        return 8;
      }
      
      return Math.round(hours * 10) / 10;
    }
  } catch (error) {
    console.log('Error parsing time range:', timeRange);
  }
  
  return 0;
}

// Function to parse time string to hour number
function parseTime(timeStr) {
  const cleanTime = timeStr.replace(/[^\d:]/g, '');
  
  if (cleanTime.includes(':')) {
    const [hour, minute] = cleanTime.split(':');
    return parseInt(hour) + (parseInt(minute) / 60);
  } else {
    return parseInt(cleanTime);
  }
}

// Function to get coverage class based on total hours
function getCoverageClass(totalHours) {
  if (totalHours >= 8) return 'has-coverage';
  if (totalHours >= 1) return 'minimal-coverage';
  return 'no-coverage';
}

// Function to generate calendar data for June 2025
function generateCalendarData() {
  try {
    const jsonData = JSON.parse(fs.readFileSync('june_2025.json', 'utf8'));
    
    // Create a map of dates to staff assignments
    const dateMap = new Map();
    
    // Process each entry in the JSON
    jsonData.forEach(entry => {
      if (!entry.date) return;
      
      const date = entry.date;
      const assignments = parseStaffAssignments(entry.staffed);
      
      // If this date already exists, merge assignments
      if (dateMap.has(date)) {
        const existing = dateMap.get(date);
        existing.assignments = existing.assignments.concat(assignments);
        existing.totalHours = existing.assignments.reduce((sum, a) => sum + a.hours, 0);
      } else {
        const totalHours = assignments.reduce((sum, a) => sum + a.hours, 0);
        dateMap.set(date, {
          date: date,
          day: entry.day,
          assignments: assignments,
          totalHours: totalHours,
          coverageClass: getCoverageClass(totalHours),
          events: entry.event ? [entry.event] : []
        });
      }
    });
    
    // Generate calendar days for June 2025 (30 days)
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
        // No coverage for this day
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
    console.error('Error generating calendar data:', error.message);
    return [];
  }
}

// Function to generate HTML for a calendar day
function generateCalendarDayHTML(dayData) {
  const { dayNumber, assignments, totalHours, coverageClass } = dayData;
  
  let html = `    <div class="calendar-day ${coverageClass}">\n`;
  html += `      <div class="day-number">${dayNumber}</div>\n`;
  
  // Add staff assignments
  assignments.forEach(assignment => {
    html += `      <div class="day-staff">${assignment.staff} (${assignment.hours}h)</div>\n`;
  });
  
  // Add total hours if there's coverage
  if (totalHours > 0) {
    html += `      <div class="day-total">${totalHours}h</div>\n`;
  }
  
  html += `    </div>\n`;
  
  return html;
}

// Generate and output calendar data
console.log('Generating calendar data for June 2025...\n');

const calendarDays = generateCalendarData();

// Validation
const totalCalendarHours = calendarDays.reduce((sum, day) => sum + day.totalHours, 0);
const daysWithCoverage = calendarDays.filter(day => day.totalHours > 0).length;

console.log(`📊 CALENDAR VALIDATION:`);
console.log(`• Total days: ${calendarDays.length}`);
console.log(`• Days with coverage: ${daysWithCoverage}`);
console.log(`• Days without coverage: ${calendarDays.length - daysWithCoverage}`);
console.log(`• Total hours across calendar: ${totalCalendarHours}`);
console.log(`• Expected total hours: 483`);
console.log(`• Hours match: ${totalCalendarHours === 483 ? '✅ YES' : '❌ NO'}\n`);

// Generate HTML for all calendar days
console.log('Generated HTML for calendar days:\n');
console.log('<!-- COMPLETE JUNE 2025 CALENDAR DAYS -->');

calendarDays.forEach(dayData => {
  console.log(generateCalendarDayHTML(dayData));
});

// Export for use in other scripts
export { calendarDays, generateCalendarDayHTML };
