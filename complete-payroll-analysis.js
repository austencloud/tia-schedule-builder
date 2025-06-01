// TIA Schedule Builder - Complete June 2025 Payroll Analytics
// Based on the actual june_2025.json file data

import fs from "fs";

// Staff pay structure as provided in the request
const staffPayStructure = {
  Bayla: { type: "Primary", rate: 17, desired: 20 },
  Athena: { type: "Primary", rate: 17, desired: 20 },
  Rob: { type: "Primary", rate: 20, desired: 20 },
  Grace: { type: "Primary", rate: 17, desired: 20 },
  Morph: { type: "Primary", rate: 16, desired: 20 },
  Miranda: { type: "Primary", rate: 20, desired: 20 },
  Domingo: { type: "Primary", rate: 25, desired: 20 },
  Taylor: { type: "Primary", rate: 16, desired: 20 },
  Cam: { type: "Primary/Volunteer (lab only)", rate: 15, desired: 20 },
  Emilie: { type: "Primary/Volunteer (lab only)", rate: 15, desired: 20 },
  Gemma: { type: "Primary", rate: 16, desired: 20 },
  Courtney: { type: "Volunteer", rate: 0, desired: 4 },
  Ruby: { type: "Primary", rate: 15, desired: 10 },
  Donnie: { type: "Live-in", rate: 0, desired: 10 },
  Reece: { type: "Volunteer", rate: 0, desired: 0 },
  Emily: { type: "Volunteer", rate: 0, desired: 0 },
  // Additional staff found in the JSON data
  Miro: { type: "Primary", rate: 18, desired: 20 }, // Estimated rate
  Sawyer: { type: "Primary", rate: 16, desired: 20 }, // Estimated rate
  Tex: { type: "Primary", rate: 15, desired: 20 }, // Estimated rate
  Cassidy: { type: "Primary", rate: 15, desired: 20 }, // Estimated rate
  Kaila: { type: "Primary", rate: 15, desired: 20 }, // Estimated rate
  Simon: { type: "Outside Educator", rate: 0, desired: 0 }, // Percentage-based
  Nina: { type: "Management", rate: 25, desired: 20 }, // Estimated rate
  Audi: { type: "Primary", rate: 15, desired: 20 }, // Estimated rate
};

// Function to parse staff assignments from text
function parseStaffAssignments(staffedArray) {
  const assignments = [];

  staffedArray.forEach((entry) => {
    if (!entry || entry.trim() === "") return;

    // Extract staff name and hours using regex
    const timePattern =
      /(\w+)\s+(\d{1,2}(?::\d{2})?(?:am|pm)?-\d{1,2}(?::\d{2})?(?:am|pm)?)/i;
    const match = entry.match(timePattern);

    if (match) {
      const staffName = match[1];
      const timeRange = match[2];

      // Calculate hours from time range
      const hours = calculateHoursFromRange(timeRange);

      if (hours > 0 && staffPayStructure[staffName]) {
        assignments.push({
          staff: staffName,
          hours: hours,
          timeRange: timeRange,
          description: entry,
        });
      }
    }
  });

  return assignments;
}

// Function to calculate hours from time range
function calculateHoursFromRange(timeRange) {
  try {
    const [start, end] = timeRange.split("-");

    // Convert to 24-hour format and calculate difference
    const startHour = parseTime(start.trim());
    const endHour = parseTime(end.trim());

    if (startHour !== null && endHour !== null) {
      let hours = endHour - startHour;
      if (hours < 0) hours += 24; // Handle overnight shifts

      // Cap unrealistic hours (likely parsing errors)
      if (hours > 12) {
        console.log(
          `⚠️  Suspicious hours calculation: ${timeRange} = ${hours}h (capping at 9h)`
        );
        return 9; // Reasonable full day shift
      }

      return Math.round(hours * 10) / 10; // Round to 1 decimal
    }
  } catch (error) {
    console.log("Error parsing time range:", timeRange);
  }

  return 0;
}

// Function to parse time string to hour number
function parseTime(timeStr) {
  const cleanTime = timeStr.toLowerCase().replace(/[^\d:apm]/gi, "");

  if (cleanTime.includes(":")) {
    const [hour, minute] = cleanTime.split(":");
    let h = parseInt(hour);
    const m = parseInt(minute) || 0;

    if (cleanTime.includes("pm") && h !== 12) h += 12;
    if (cleanTime.includes("am") && h === 12) h = 0;

    return h + m / 60;
  } else {
    const numStr = cleanTime.replace(/[apm]/gi, "");
    let h = parseInt(numStr);

    if (isNaN(h)) return null;

    // Default to PM for single digit hours 3-8, AM for 9-12
    if (!cleanTime.includes("am") && !cleanTime.includes("pm")) {
      if (h >= 3 && h <= 8) {
        h += 12; // Assume PM
      }
      // 9-12 assume as given (9am-12pm)
    } else {
      if (cleanTime.includes("pm") && h !== 12) h += 12;
      if (cleanTime.includes("am") && h === 12) h = 0;
    }

    return h;
  }
}

// Function to analyze the complete schedule
function analyzeCompleteSchedule() {
  try {
    // Read the JSON file
    const jsonData = JSON.parse(fs.readFileSync("june_2025.json", "utf8"));

    console.log("\n=== TIA COMPLETE JUNE 2025 PAYROLL ANALYTICS ===\n");
    console.log(`Total days in schedule: ${jsonData.length}`);

    // Initialize staff hours tracking
    const staffHours = {};
    Object.keys(staffPayStructure).forEach((staff) => {
      staffHours[staff] = 0;
    });

    let totalDaysWithStaff = 0;
    let totalAssignments = 0;

    // Process each day
    jsonData.forEach((day) => {
      if (day.staffed && day.staffed.length > 0) {
        const assignments = parseStaffAssignments(day.staffed);

        if (assignments.length > 0) {
          totalDaysWithStaff++;
          console.log(`\n${day.date} (${day.day}):`);

          assignments.forEach((assignment) => {
            staffHours[assignment.staff] += assignment.hours;
            totalAssignments++;
            console.log(
              `  ${assignment.staff}: ${assignment.hours}h (${assignment.timeRange})`
            );
          });
        }
      }
    });

    // Calculate payroll
    console.log("\n" + "=".repeat(80));
    console.log("COMPLETE PAYROLL BREAKDOWN:");
    console.log("=".repeat(80));

    let totalPayroll = 0;
    let totalHours = 0;

    Object.entries(staffHours).forEach(([staffName, hours]) => {
      if (hours > 0) {
        const payInfo = staffPayStructure[staffName];
        const pay = hours * payInfo.rate;
        totalPayroll += pay;
        totalHours += hours;

        console.log(
          `${staffName.padEnd(12)} ${hours.toString().padEnd(8)} ${payInfo.rate
            .toString()
            .padEnd(8)} $${pay.toFixed(2)}`
        );
      }
    });

    console.log("=".repeat(80));
    console.log(
      `TOTALS:      ${totalHours.toString().padEnd(8)} $${totalPayroll.toFixed(
        2
      )}`
    );

    console.log("\n📊 SUMMARY:");
    console.log(
      `• Days with staff assignments: ${totalDaysWithStaff} out of ${jsonData.length}`
    );
    console.log(`• Total staff assignments: ${totalAssignments}`);
    console.log(`• Total hours: ${totalHours}`);
    console.log(`• Total payroll: $${totalPayroll.toFixed(2)}`);
    console.log(
      `• Average cost per hour: $${(totalPayroll / totalHours).toFixed(2)}`
    );

    return {
      staffHours,
      totalPayroll,
      totalHours,
      totalDaysWithStaff,
      totalAssignments,
    };
  } catch (error) {
    console.error("Error reading or parsing june_2025.json:", error.message);
    console.log(
      "Please make sure the june_2025.json file is in the same directory as this script."
    );
  }
}

// Run the analysis
analyzeCompleteSchedule();
