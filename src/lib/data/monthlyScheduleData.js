// Monthly Schedule Data for June 2025 - Comprehensive Scheduling System
// Based on the data structure requirements from August 2024.html

// Staff capabilities and information
export const staffCapabilities = {
  Miranda: {
    tier: "senior",
    hourlyRate: 18.0,
    departments: ["animal-care", "front-desk"],
    capabilities: [
      "animal-handling",
      "front-desk",
      "opening",
      "closing",
      "morning-care",
    ],
    maxHoursPerWeek: 20,
    preferredShifts: ["morning", "afternoon"],
  },
  Taylor: {
    tier: "senior",
    hourlyRate: 17.0,
    departments: ["animal-care", "front-desk"],
    capabilities: [
      "animal-handling",
      "front-desk",
      "opening",
      "closing",
      "morning-care",
    ],
    maxHoursPerWeek: 20,
    preferredShifts: ["morning", "afternoon"],
  },
  Grace: {
    tier: "mid",
    hourlyRate: 15.0,
    departments: ["animal-care", "front-desk"],
    capabilities: [
      "animal-handling",
      "front-desk",
      "opening",
      "closing",
      "morning-care",
    ],
    maxHoursPerWeek: 25,
    preferredShifts: ["afternoon", "evening"],
  },
  Gemma: {
    tier: "mid",
    hourlyRate: 15.0,
    departments: ["animal-care", "front-desk"],
    capabilities: [
      "animal-handling",
      "front-desk",
      "opening",
      "closing",
      "morning-care",
    ],
    maxHoursPerWeek: 25,
    preferredShifts: ["morning", "afternoon"],
  },
  Rob: {
    tier: "senior",
    hourlyRate: 17.0,
    departments: ["lab", "front-desk"],
    capabilities: ["lab-work", "teaching", "front-desk", "opening", "closing"],
    maxHoursPerWeek: 20,
    preferredShifts: ["afternoon", "evening"],
  },
  Athena: {
    tier: "mid",
    hourlyRate: 16.0,
    departments: ["lab", "animal-care"],
    capabilities: ["lab-work", "teaching", "animal-handling", "morning-care"],
    maxHoursPerWeek: 25,
    preferredShifts: ["morning", "afternoon"],
  },
  Bayla: {
    tier: "mid",
    hourlyRate: 16.0,
    departments: ["lab", "front-desk"],
    capabilities: ["lab-work", "teaching", "front-desk"],
    maxHoursPerWeek: 25,
    preferredShifts: ["afternoon", "evening"],
  },
  Morph: {
    tier: "entry",
    hourlyRate: 14.0,
    departments: ["front-desk"],
    capabilities: ["front-desk", "opening", "closing"],
    maxHoursPerWeek: 30,
    preferredShifts: ["morning", "afternoon", "evening"],
  },
  Emilie: {
    tier: "trainee",
    hourlyRate: 13.0,
    departments: ["trainee"],
    capabilities: ["front-desk", "animal-handling"],
    maxHoursPerWeek: 25,
    preferredShifts: ["morning", "afternoon"],
    requiresSupervision: true,
  },
  Cam: {
    tier: "trainee",
    hourlyRate: 13.0,
    departments: ["trainee"],
    capabilities: ["front-desk", "lab-work"],
    maxHoursPerWeek: 25,
    preferredShifts: ["afternoon", "evening"],
    requiresSupervision: true,
  },
  Courtney: {
    tier: "volunteer",
    hourlyRate: 0.0,
    departments: ["volunteer"],
    capabilities: ["front-desk", "event-support"],
    maxHoursPerWeek: 15,
    preferredShifts: ["afternoon", "evening"],
  },
  Emily: {
    tier: "volunteer",
    hourlyRate: 0.0,
    departments: ["volunteer"],
    capabilities: ["front-desk", "event-support"],
    maxHoursPerWeek: 12,
    preferredShifts: ["afternoon"],
  },
  Reece: {
    tier: "volunteer",
    hourlyRate: 0.0,
    departments: ["volunteer"],
    capabilities: ["front-desk", "event-support"],
    maxHoursPerWeek: 10,
    preferredShifts: ["evening"],
  },
  Domingo: {
    tier: "mid",
    hourlyRate: 16.0,
    departments: ["front-desk", "lab"],
    capabilities: ["front-desk", "teaching", "opening", "closing"],
    maxHoursPerWeek: 25,
    preferredShifts: ["morning", "afternoon"],
  },
};

// Critical staffing requirements that must be enforced
export const criticalRequirements = {
  opening: {
    name: "Museum Opening",
    description: "Someone must be assigned to open the museum",
    requiredCapabilities: ["opening"],
    minimumStaff: 1,
    timeSlots: ["morning"],
  },
  closing: {
    name: "Museum Closing",
    description: "Someone must be assigned to close the museum",
    requiredCapabilities: ["closing"],
    minimumStaff: 1,
    timeSlots: ["evening"],
  },
  "morning-care": {
    name: "Morning Animal Care",
    description: "Daily animal care must be completed",
    requiredCapabilities: ["morning-care", "animal-handling"],
    minimumStaff: 1,
    timeSlots: ["morning"],
  },
  "front-desk": {
    name: "Front Desk Coverage",
    description: "Front desk must be covered during events/classes",
    requiredCapabilities: ["front-desk"],
    minimumStaff: 1,
    timeSlots: ["morning", "afternoon", "evening"],
  },
};

// Event types and their requirements
export const eventTypes = {
  "cat-jam": {
    name: "Cat Jam",
    requiredStaff: 1,
    requiredCapabilities: ["front-desk"],
    duration: 4,
    location: "museum",
  },
  "sensory-friday": {
    name: "Sensory Friendly Friday",
    requiredStaff: 2,
    requiredCapabilities: ["front-desk", "animal-handling"],
    duration: 4,
    location: "museum",
  },
  "paint-sip": {
    name: "Paint and Sip",
    requiredStaff: 1,
    requiredCapabilities: ["teaching"],
    duration: 2.5,
    location: "classroom",
  },
  workshop: {
    name: "Workshop",
    requiredStaff: 1,
    requiredCapabilities: ["teaching"],
    duration: 2,
    location: "classroom",
  },
  "field-study": {
    name: "Field Study",
    requiredStaff: 2,
    requiredCapabilities: ["teaching"],
    duration: 4,
    location: "offsite",
  },
};

// Location definitions
export const locations = {
  museum: "Main Floor",
  classroom: "Basement",
  apartment: "Apartment",
  offsite: "Off-site Location",
};
