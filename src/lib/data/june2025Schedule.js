// June 2025 Monthly Schedule Data
// Comprehensive scheduling system with all required columns

export const june2025Schedule = [
  {
    // Column A: Date of the month
    date: 1,
    // Column B: Day of the week
    dayOfWeek: "Sunday",
    fullDate: "6/1/2025",
    // Column C: Staff availability input (hours and capacity per day)
    staffAvailability: [
      { staff: "Morph", hours: "11-8", capacity: "full" },
      { staff: "Grace", hours: "11-5", capacity: "full" },
      { staff: "Gemma", hours: "11-8", capacity: "full" },
      { staff: "Domingo", hours: "11-8", capacity: "full" },
    ],
    // Column D: Lab staff and volunteer availability input
    labStaffAvailability: [],
    // Column E: Staff unavailability/blackout dates
    unavailableStaff: [
      { staff: "Taylor", reason: "Personal day" },
      { staff: "Rob", reason: "Scheduled off" },
      { staff: "Miranda", reason: "Scheduled off" },
    ],
    // Column F: Final staff assignments with roles and hours (manager input)
    finalAssignments: [
      {
        staff: "Grace",
        time: "11-5",
        role: "Animal Care/Front Desk",
        hours: 6,
        capabilities: [
          "animal-handling",
          "front-desk",
          "opening",
          "morning-care",
        ],
      },
      {
        staff: "Gemma",
        time: "5-8",
        role: "Animal Care/Front Desk",
        hours: 3,
        capabilities: ["animal-handling", "front-desk", "closing"],
      },
    ],
    // Column G: Museum events and classes for that day
    events: [],
    // Column H: Event instructor/responsible person assignment
    eventInstructors: [],
    // Column I: Event time schedules
    eventTimes: [],
    // Column J: Event location
    eventLocations: [],
    // Column K: Eventbrite links for ticketed events
    eventbriteLinks: [],
    // Coverage analysis
    coverageStatus: "green", // green, yellow, red
    criticalGaps: [],
    conflictWarnings: [],
  },
  {
    date: 2,
    dayOfWeek: "Monday",
    fullDate: "6/2/2025",
    staffAvailability: [
      { staff: "Rob", hours: "11-8", capacity: "full" },
      { staff: "Emilie", hours: "11-8", capacity: "full" },
    ],
    labStaffAvailability: [],
    unavailableStaff: [{ staff: "Domingo", reason: "Scheduled off" }],
    finalAssignments: [
      {
        staff: "Rob",
        time: "11-5",
        role: "Animal Care Lead",
        hours: 6,
        capabilities: [
          "animal-handling",
          "opening",
          "front-desk",
          "morning-care",
        ],
      },
      {
        staff: "Emilie",
        time: "5-8",
        role: "Animal Care Support",
        hours: 3,
        capabilities: ["animal-handling", "front-desk", "closing"],
      },
    ],
    events: [],
    eventInstructors: [],
    eventTimes: [],
    eventLocations: [],
    eventbriteLinks: [],
    coverageStatus: "green",
    criticalGaps: [],
    conflictWarnings: [],
  },
  {
    date: 3,
    dayOfWeek: "Tuesday",
    fullDate: "6/3/2025",
    staffAvailability: [
      { staff: "Rob", hours: "11-8", capacity: "full" },
      { staff: "Miranda", hours: "animal-care", capacity: "partial" },
      { staff: "Emilie", hours: "11-8", capacity: "full" },
    ],
    labStaffAvailability: [],
    unavailableStaff: [{ staff: "Domingo", reason: "Scheduled off" }],
    finalAssignments: [
      {
        staff: "Rob",
        time: "11-5",
        role: "Animal Care Lead",
        hours: 6,
        capabilities: [
          "animal-handling",
          "opening",
          "front-desk",
          "morning-care",
        ],
      },
      {
        staff: "Miranda",
        time: "11-3",
        role: "Animal Care Support",
        hours: 4,
        capabilities: ["animal-handling"],
      },
      {
        staff: "Emilie",
        time: "7-10",
        role: "Evening Front Desk/Closing",
        hours: 3,
        capabilities: ["front-desk", "closing"],
      },
    ],
    events: [
      {
        name: "Cat Jam",
        type: "cat-jam",
        description: "Weekly cat-themed social event",
      },
    ],
    eventInstructors: ["Staff TBD"],
    eventTimes: ["7:00 PM - 10:00 PM"],
    eventLocations: ["museum"],
    eventbriteLinks: [
      "https://www.eventbrite.com/e/1110905059939?aff=oddtdtcreator",
    ],
    coverageStatus: "green",
    criticalGaps: [],
    conflictWarnings: [],
  },
  {
    date: 4,
    dayOfWeek: "Wednesday",
    fullDate: "6/4/2025",
    staffAvailability: [
      { staff: "Domingo", hours: "3-8", capacity: "full" },
      { staff: "Morph", hours: "3-8", capacity: "full" },
      { staff: "Grace", hours: "1-8", capacity: "full" },
      { staff: "Gemma", hours: "11-5", capacity: "full" },
      { staff: "Rob", hours: "11-8", capacity: "full" },
      { staff: "Cam", hours: "11-8", capacity: "full" },
      { staff: "Emilie", hours: "11-5", capacity: "full" },
    ],
    labStaffAvailability: [
      { staff: "Athena", hours: "9:30-3", capacity: "full" },
    ],
    unavailableStaff: [{ staff: "Miranda", reason: "Personal appointment" }],
    finalAssignments: [
      {
        staff: "Gemma",
        time: "1-5",
        role: "Animal Care/Opening",
        hours: 4,
        capabilities: ["animal-handling", "opening", "morning-care"],
      },
      {
        staff: "Grace",
        time: "3-8",
        role: "Animal Care/Front Desk",
        hours: 5,
        capabilities: ["animal-handling", "front-desk", "closing"],
      },
      {
        staff: "Athena",
        time: "9:30-3",
        role: "Lab Work/Animal Training",
        hours: 5.5,
        capabilities: ["lab-work", "animal-handling"],
      },
    ],
    events: [],
    eventInstructors: [],
    eventTimes: [],
    eventLocations: [],
    eventbriteLinks: [],
    coverageStatus: "green",
    criticalGaps: [],
    conflictWarnings: [],
  },
  {
    date: 5,
    dayOfWeek: "Thursday",
    fullDate: "6/5/2025",
    staffAvailability: [
      { staff: "Domingo", hours: "11-8", capacity: "full" },
      { staff: "Morph", hours: "11-6", capacity: "full" },
      { staff: "Taylor", hours: "11-4", capacity: "full" },
      { staff: "Grace", hours: "11-8", capacity: "full" },
      { staff: "Rob", hours: "11-5", capacity: "full" },
      { staff: "Miranda", hours: "11-5", capacity: "full" },
      { staff: "Emilie", hours: "11-5", capacity: "full" },
    ],
    labStaffAvailability: [
      { staff: "Athena", hours: "11-8", capacity: "full" },
      { staff: "Bayla", hours: "11-6", capacity: "full" },
      { staff: "Cam", hours: "11-8", capacity: "full" },
    ],
    unavailableStaff: [{ staff: "Gemma", reason: "Scheduled off" }],
    finalAssignments: [
      {
        staff: "Taylor",
        time: "11-4",
        role: "Animal Care Lead",
        hours: 5,
        capabilities: ["animal-handling", "opening", "morning-care"],
      },
      {
        staff: "Grace",
        time: "3-8",
        role: "Animal Care/Front Desk",
        hours: 5,
        capabilities: ["animal-handling", "front-desk", "closing"],
      },
      {
        staff: "Domingo",
        time: "11-12:30",
        role: "Student Group Guide",
        hours: 1.5,
        capabilities: ["teaching", "front-desk"],
      },
      {
        staff: "Bayla",
        time: "11-5",
        role: "Lab Work/Animal Training",
        hours: 6,
        capabilities: ["lab-work", "animal-handling"],
      },
    ],
    events: [
      {
        name: "Student Group Visit",
        type: "educational-visit",
        description: "20 students - confirmation pending with Carla",
      },
    ],
    eventInstructors: ["Domingo"],
    eventTimes: ["11:00 AM - 12:30 PM"],
    eventLocations: ["museum"],
    eventbriteLinks: [],
    coverageStatus: "yellow",
    criticalGaps: [],
    conflictWarnings: ["Student group not confirmed on calendar"],
  },
];

// Coverage status calculation helper
export function calculateCoverageStatus(day) {
  const { finalAssignments, events, criticalGaps, conflictWarnings } = day;

  // Check critical requirements
  const hasOpening = finalAssignments.some((a) =>
    a.capabilities.includes("opening")
  );
  const hasClosing = finalAssignments.some((a) =>
    a.capabilities.includes("closing")
  );
  const hasMorningCare = finalAssignments.some((a) =>
    a.capabilities.includes("animal-handling")
  );

  // Check for conflicts during events
  const hasEventConflicts = events.length > 0 && conflictWarnings.length > 0;

  if (
    !hasOpening ||
    !hasClosing ||
    !hasMorningCare ||
    criticalGaps.length > 0
  ) {
    return "red";
  }

  if (hasEventConflicts || conflictWarnings.length > 0) {
    return "yellow";
  }

  return "green";
}
