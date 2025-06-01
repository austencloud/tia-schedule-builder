// TIA Schedule Builder - June 2025 Payroll Analytics
// Comprehensive payroll calculation based on actual schedule data

import { june2025Schedule } from "./src/lib/data/june2025Schedule.js";

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
  Courtney: { type: "Volunteer", rate: 0, desired: 4 }, // 3-5hrs average
  Ruby: { type: "Primary", rate: 15, desired: 10 },
  Donnie: { type: "Live-in", rate: 0, desired: 10 },
  Reece: { type: "Volunteer", rate: 0, desired: 0 },
  Emily: { type: "Volunteer", rate: 0, desired: 0 },
};

// Function to calculate total hours per staff member
function calculateStaffHours() {
  const staffHours = {};

  // Initialize all staff with 0 hours
  Object.keys(staffPayStructure).forEach((staff) => {
    staffHours[staff] = 0;
  });

  // Sum hours from all days in the schedule
  june2025Schedule.forEach((day) => {
    if (day.finalAssignments) {
      day.finalAssignments.forEach((assignment) => {
        const staffName = assignment.staff;
        if (staffHours.hasOwnProperty(staffName)) {
          staffHours[staffName] += assignment.hours || 0;
        }
      });
    }
  });

  return staffHours;
}

// Function to calculate payroll analytics
function calculatePayrollAnalytics() {
  const staffHours = calculateStaffHours();
  const payrollData = [];
  const categoryTotals = {
    Primary: { hours: 0, cost: 0, count: 0 },
    "Primary/Volunteer (lab only)": { hours: 0, cost: 0, count: 0 },
    Volunteer: { hours: 0, cost: 0, count: 0 },
    "Live-in": { hours: 0, cost: 0, count: 0 },
  };

  // Calculate individual staff payroll
  Object.entries(staffPayStructure).forEach(([staffName, payInfo]) => {
    const hoursWorked = staffHours[staffName] || 0;
    const monthlyPay = hoursWorked * payInfo.rate;

    const staffData = {
      name: staffName,
      type: payInfo.type,
      hoursScheduled: hoursWorked,
      hourlyRate: payInfo.rate,
      monthlyPay: monthlyPay,
      desiredHours: payInfo.desired,
    };

    payrollData.push(staffData);

    // Add to category totals
    if (categoryTotals[payInfo.type]) {
      categoryTotals[payInfo.type].hours += hoursWorked;
      categoryTotals[payInfo.type].cost += monthlyPay;
      categoryTotals[payInfo.type].count += 1;
    }
  });

  // Calculate overall totals
  const totalHours = payrollData.reduce(
    (sum, staff) => sum + staff.hoursScheduled,
    0
  );
  const totalPayroll = payrollData.reduce(
    (sum, staff) => sum + staff.monthlyPay,
    0
  );

  return {
    staffData: payrollData,
    categoryTotals,
    totalHours,
    totalPayroll,
    schedulePeriod: `June 1-${june2025Schedule.length}, 2025 (${june2025Schedule.length} days scheduled)`,
  };
}

// Function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Function to extrapolate to full month (30 days)
function extrapolateToFullMonth(analytics) {
  const daysScheduled = june2025Schedule.length;
  const daysInMonth = 30; // June has 30 days
  const multiplier = daysInMonth / daysScheduled;

  const extrapolatedData = {
    staffData: analytics.staffData.map((staff) => ({
      ...staff,
      projectedMonthlyHours:
        Math.round(staff.hoursScheduled * multiplier * 10) / 10,
      projectedMonthlyPay: staff.hoursScheduled * multiplier * staff.hourlyRate,
      utilizationVsDesired:
        staff.desiredHours > 0
          ? Math.round(
              ((staff.hoursScheduled * multiplier) / staff.desiredHours) * 100
            )
          : 0,
    })),
    projectedTotalHours: analytics.totalHours * multiplier,
    projectedTotalPayroll: analytics.totalPayroll * multiplier,
  };

  return extrapolatedData;
}

// Function to generate comprehensive payroll report
function generatePayrollReport() {
  const analytics = calculatePayrollAnalytics();
  const projected = extrapolateToFullMonth(analytics);

  console.log("\n=== TIA SCHEDULE BUILDER - JUNE 2025 PAYROLL ANALYTICS ===\n");
  console.log(`Schedule Period: ${analytics.schedulePeriod}`);
  console.log(
    `Note: Projections based on ${june2025Schedule.length} days of actual schedule data\n`
  );

  // Comprehensive Staff Report
  console.log("COMPREHENSIVE STAFF PAYROLL ANALYSIS:");
  console.log("═".repeat(120));
  console.log(
    "Staff Name".padEnd(12) +
      "Type".padEnd(25) +
      "Rate".padEnd(8) +
      "Actual".padEnd(8) +
      "Projected".padEnd(10) +
      "Monthly Pay".padEnd(12) +
      "Desired".padEnd(8) +
      "Utilization"
  );
  console.log(
    "".padEnd(12) +
      "".padEnd(25) +
      "".padEnd(8) +
      "Hours".padEnd(8) +
      "Hours".padEnd(10) +
      "(Full Month)".padEnd(12) +
      "Hours".padEnd(8) +
      "% of Desired"
  );
  console.log("─".repeat(120));

  // Sort by projected monthly pay (descending)
  const sortedStaff = projected.staffData.sort(
    (a, b) => b.projectedMonthlyPay - a.projectedMonthlyPay
  );

  sortedStaff.forEach((staff) => {
    const name = staff.name.padEnd(12);
    const type = staff.type.padEnd(25);
    const rate = formatCurrency(staff.hourlyRate).padEnd(8);
    const actualHours = staff.hoursScheduled.toString().padEnd(8);
    const projectedHours = staff.projectedMonthlyHours.toString().padEnd(10);
    const pay = formatCurrency(staff.projectedMonthlyPay).padEnd(12);
    const desired = staff.desiredHours.toString().padEnd(8);
    const utilization = `${staff.utilizationVsDesired}%`;

    console.log(
      `${name}${type}${rate}${actualHours}${projectedHours}${pay}${desired}${utilization}`
    );
  });

  console.log("─".repeat(120));
  console.log(
    `TOTALS:`.padEnd(45) +
      `${analytics.totalHours}`.padEnd(8) +
      `${Math.round(projected.projectedTotalHours * 10) / 10}`.padEnd(10) +
      `${formatCurrency(projected.projectedTotalPayroll)}`
  );
  console.log("\n");

  // Category Breakdown with Projections
  console.log("PAYROLL BREAKDOWN BY STAFF CATEGORY (PROJECTED FULL MONTH):");
  console.log("═".repeat(80));
  console.log(
    "Category".padEnd(30) +
      "Staff Count".padEnd(12) +
      "Total Hours".padEnd(12) +
      "Total Cost".padEnd(16) +
      "Avg/Person"
  );
  console.log("─".repeat(80));

  Object.entries(analytics.categoryTotals).forEach(([category, totals]) => {
    if (totals.count > 0) {
      const projectedHours = totals.hours * (30 / june2025Schedule.length);
      const projectedCost = totals.cost * (30 / june2025Schedule.length);
      const avgPerPerson = projectedCost / totals.count;

      const cat = category.padEnd(30);
      const count = totals.count.toString().padEnd(12);
      const hours = Math.round(projectedHours * 10) / 10;
      const hoursStr = hours.toString().padEnd(12);
      const cost = formatCurrency(projectedCost).padEnd(16);
      const avg = formatCurrency(avgPerPerson);

      console.log(`${cat}${count}${hoursStr}${cost}${avg}`);
    }
  });

  console.log("─".repeat(80));
  console.log(
    `TOTAL:`.padEnd(30) +
      `${analytics.staffData.length}`.padEnd(12) +
      `${Math.round(projected.projectedTotalHours * 10) / 10}`.padEnd(12) +
      `${formatCurrency(projected.projectedTotalPayroll)}`
  );

  return { analytics, projected };
}

// Additional analysis functions
function generateInsights(analytics, projected) {
  console.log("\n");
  console.log("KEY INSIGHTS & RECOMMENDATIONS:");
  console.log("═".repeat(60));

  // Utilization analysis
  const underutilized = projected.staffData.filter(
    (staff) => staff.utilizationVsDesired < 50 && staff.desiredHours > 0
  );

  const overutilized = projected.staffData.filter(
    (staff) => staff.utilizationVsDesired > 100
  );

  const wellUtilized = projected.staffData.filter(
    (staff) =>
      staff.utilizationVsDesired >= 75 && staff.utilizationVsDesired <= 100
  );

  console.log(`\n📊 UTILIZATION ANALYSIS:`);
  console.log(
    `   • Well-utilized staff (75-100%): ${wellUtilized.length} people`
  );
  console.log(
    `   • Under-utilized staff (<50%): ${underutilized.length} people`
  );
  console.log(
    `   • Over-utilized staff (>100%): ${overutilized.length} people`
  );

  if (underutilized.length > 0) {
    console.log(`\n⚠️  UNDER-UTILIZED STAFF:`);
    underutilized.forEach((staff) => {
      console.log(
        `   • ${staff.name}: ${staff.utilizationVsDesired}% of desired hours (${staff.projectedMonthlyHours}/${staff.desiredHours})`
      );
    });
  }

  if (overutilized.length > 0) {
    console.log(`\n🔴 OVER-UTILIZED STAFF:`);
    overutilized.forEach((staff) => {
      console.log(
        `   • ${staff.name}: ${staff.utilizationVsDesired}% of desired hours (${staff.projectedMonthlyHours}/${staff.desiredHours})`
      );
    });
  }

  // Cost analysis
  const avgHourlyRate =
    projected.staffData
      .filter((s) => s.hourlyRate > 0)
      .reduce((sum, s) => sum + s.hourlyRate, 0) /
    projected.staffData.filter((s) => s.hourlyRate > 0).length;

  console.log(`\n💰 COST ANALYSIS:`);
  console.log(
    `   • Average hourly rate (paid staff): ${formatCurrency(avgHourlyRate)}`
  );
  console.log(
    `   • Total projected monthly payroll: ${formatCurrency(
      projected.projectedTotalPayroll
    )}`
  );
  console.log(
    `   • Cost per scheduled hour: ${formatCurrency(
      projected.projectedTotalPayroll / projected.projectedTotalHours
    )}`
  );

  // Coverage analysis
  const daysWithData = june2025Schedule.length;
  const avgHoursPerDay = analytics.totalHours / daysWithData;

  console.log(`\n📅 COVERAGE ANALYSIS:`);
  console.log(
    `   • Average hours per day: ${Math.round(avgHoursPerDay * 10) / 10} hours`
  );
  console.log(`   • Days with schedule data: ${daysWithData} out of 30`);
  console.log(
    `   • Data completeness: ${Math.round((daysWithData / 30) * 100)}%`
  );

  console.log("\n");
}

// Run the analysis
const results = generatePayrollReport();
generateInsights(results.analytics, results.projected);

console.log("\n📋 SUMMARY:");
console.log(
  "This analysis is based on the first 5 days of June 2025 schedule data."
);
console.log(
  "Projections assume similar staffing patterns throughout the month."
);
console.log(
  "Actual monthly totals may vary based on events, holidays, and schedule changes."
);

// Export for potential use in other modules
export {
  calculateStaffHours,
  calculatePayrollAnalytics,
  generatePayrollReport,
};
