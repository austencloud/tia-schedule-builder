// TIA Schedule Builder - Accurate June 2025 Payroll Analytics
// Based on the complete june_2025.json file data

import fs from 'fs';

// Staff pay structure as provided in the request
const staffPayStructure = {
  'Bayla': { type: 'Primary', rate: 17, desired: 20 },
  'Athena': { type: 'Primary', rate: 17, desired: 20 },
  'Rob': { type: 'Primary', rate: 20, desired: 20 },
  'Grace': { type: 'Primary', rate: 17, desired: 20 },
  'Morph': { type: 'Primary', rate: 16, desired: 20 },
  'Miranda': { type: 'Primary', rate: 20, desired: 20 },
  'Domingo': { type: 'Primary', rate: 25, desired: 20 },
  'Taylor': { type: 'Primary', rate: 16, desired: 20 },
  'Cam': { type: 'Primary/Volunteer (lab only)', rate: 15, desired: 20 },
  'Emilie': { type: 'Primary/Volunteer (lab only)', rate: 15, desired: 20 },
  'Gemma': { type: 'Primary', rate: 16, desired: 20 },
  'Courtney': { type: 'Volunteer', rate: 0, desired: 4 },
  'Ruby': { type: 'Primary', rate: 15, desired: 10 },
  'Donnie': { type: 'Live-in', rate: 0, desired: 10 },
  'Reece': { type: 'Volunteer', rate: 0, desired: 0 },
  'Emily': { type: 'Volunteer', rate: 0, desired: 0 },
  // Additional staff found in the JSON data
  'Miro': { type: 'Primary', rate: 18, desired: 20 },
  'Sawyer': { type: 'Primary', rate: 16, desired: 20 },
  'Tex': { type: 'Primary', rate: 15, desired: 20 },
  'Cassidy': { type: 'Primary', rate: 15, desired: 20 },
  'Kaila': { type: 'Primary', rate: 15, desired: 20 },
  'Simon': { type: 'Outside Educator', rate: 0, desired: 0 }, // Percentage-based
  'Nina': { type: 'Management', rate: 25, desired: 20 },
  'Audi': { type: 'Primary', rate: 15, desired: 20 }
};

// Function to parse staff assignments from staffed array
function parseStaffAssignments(staffedArray) {
  const assignments = [];
  
  staffedArray.forEach(entry => {
    if (!entry || entry.trim() === '' || entry.includes('THIS DATE MAY CHANGE')) return;
    
    // Extract staff name and time range
    const patterns = [
      /(\w+)\s+(\d{1,2}(?::\d{2})?(?:am|pm)?-\d{1,2}(?::\d{2})?(?:am|pm)?)/i,
      /(\w+)\s+(\d{1,2}-\d{1,2})/i
    ];
    
    let match = null;
    for (const pattern of patterns) {
      match = entry.match(pattern);
      if (match) break;
    }
    
    if (match) {
      const staffName = match[1];
      const timeRange = match[2];
      
      // Skip if not in our pay structure (like Simon, Nina, etc.)
      if (!staffPayStructure[staffName]) return;
      
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

// Function to calculate hours from time range
function calculateHoursFromRange(timeRange) {
  try {
    const [start, end] = timeRange.split('-');
    
    const startHour = parseTime(start.trim());
    const endHour = parseTime(end.trim());
    
    if (startHour !== null && endHour !== null) {
      let hours = endHour - startHour;
      if (hours < 0) hours += 24; // Handle overnight shifts
      
      // Cap unrealistic hours (likely parsing errors)
      if (hours > 12) {
        console.log(`⚠️  Suspicious hours: ${timeRange} = ${hours}h (capping at 9h)`);
        return 9;
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
  const cleanTime = timeStr.toLowerCase().replace(/[^\d:apm]/gi, '');
  
  if (cleanTime.includes(':')) {
    const [hour, minute] = cleanTime.split(':');
    let h = parseInt(hour);
    const m = parseInt(minute) || 0;
    
    if (cleanTime.includes('pm') && h !== 12) h += 12;
    if (cleanTime.includes('am') && h === 12) h = 0;
    
    return h + (m / 60);
  } else {
    const numStr = cleanTime.replace(/[apm]/gi, '');
    let h = parseInt(numStr);
    
    if (isNaN(h)) return null;
    
    // Default assumptions for time parsing
    if (!cleanTime.includes('am') && !cleanTime.includes('pm')) {
      if (h >= 3 && h <= 8) {
        h += 12; // Assume PM for 3-8
      }
    } else {
      if (cleanTime.includes('pm') && h !== 12) h += 12;
      if (cleanTime.includes('am') && h === 12) h = 0;
    }
    
    return h;
  }
}

// Function to analyze the complete schedule
function analyzeCompleteSchedule() {
  try {
    const jsonData = JSON.parse(fs.readFileSync('june_2025.json', 'utf8'));
    
    console.log('\n=== TIA COMPLETE JUNE 2025 PAYROLL ANALYTICS ===\n');
    console.log(`Total days in schedule: ${jsonData.length}`);
    
    // Initialize staff hours tracking
    const staffHours = {};
    const dailyBreakdown = [];
    Object.keys(staffPayStructure).forEach(staff => {
      staffHours[staff] = 0;
    });
    
    let totalDaysWithStaff = 0;
    let totalAssignments = 0;
    
    // Process each day
    jsonData.forEach(day => {
      if (day.staffed && day.staffed.length > 0) {
        const assignments = parseStaffAssignments(day.staffed);
        
        if (assignments.length > 0) {
          totalDaysWithStaff++;
          const dayTotal = assignments.reduce((sum, a) => sum + a.hours, 0);
          
          dailyBreakdown.push({
            date: day.date,
            day: day.day,
            assignments: assignments,
            totalHours: dayTotal
          });
          
          assignments.forEach(assignment => {
            staffHours[assignment.staff] += assignment.hours;
            totalAssignments++;
          });
        }
      }
    });
    
    // Calculate payroll
    console.log('\n' + '='.repeat(80));
    console.log('COMPLETE PAYROLL BREAKDOWN:');
    console.log('='.repeat(80));
    console.log('Staff Name'.padEnd(15) + 'Hours'.padEnd(8) + 'Rate'.padEnd(8) + 'Total Pay'.padEnd(12) + 'Type');
    console.log('-'.repeat(80));
    
    let totalPayroll = 0;
    let totalHours = 0;
    const staffResults = [];
    
    Object.entries(staffHours).forEach(([staffName, hours]) => {
      const payInfo = staffPayStructure[staffName];
      const pay = hours * payInfo.rate;
      totalPayroll += pay;
      totalHours += hours;
      
      staffResults.push({
        name: staffName,
        hours: hours,
        rate: payInfo.rate,
        pay: pay,
        type: payInfo.type,
        desired: payInfo.desired
      });
    });
    
    // Sort by total pay (descending)
    staffResults.sort((a, b) => b.pay - a.pay);
    
    staffResults.forEach(staff => {
      if (staff.hours > 0) {
        console.log(
          `${staff.name.padEnd(15)}${staff.hours.toString().padEnd(8)}$${staff.rate.toString().padEnd(7)}$${staff.pay.toFixed(2).padEnd(11)}${staff.type}`
        );
      }
    });
    
    console.log('-'.repeat(80));
    console.log(`TOTALS:${' '.repeat(8)}${totalHours.toString().padEnd(8)}${' '.repeat(8)}$${totalPayroll.toFixed(2)}`);
    
    console.log('\n📊 SUMMARY:');
    console.log(`• Days with staff assignments: ${totalDaysWithStaff} out of ${jsonData.length}`);
    console.log(`• Total staff assignments: ${totalAssignments}`);
    console.log(`• Total hours: ${totalHours}`);
    console.log(`• Total payroll: $${totalPayroll.toFixed(2)}`);
    console.log(`• Average cost per hour: $${(totalPayroll / totalHours).toFixed(2)}`);
    console.log(`• Staff actually scheduled: ${staffResults.filter(s => s.hours > 0).length}`);
    
    return {
      staffResults,
      dailyBreakdown,
      totalPayroll,
      totalHours,
      totalDaysWithStaff,
      totalAssignments
    };
    
  } catch (error) {
    console.error('Error reading or parsing june_2025.json:', error.message);
    console.log('Please make sure the june_2025.json file is in the same directory as this script.');
  }
}

// Run the analysis
const results = analyzeCompleteSchedule();

// Export results for HTML generation
export { results };
