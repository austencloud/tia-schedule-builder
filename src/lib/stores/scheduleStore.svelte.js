// Enhanced Svelte 5 runes-based store for comprehensive schedule state management
import { scheduleData, staffInfo, departments } from "../data/scheduleData.js";
import { june2025Schedule } from "../data/june2025Schedule.js";
import {
  staffCapabilities,
  criticalRequirements,
} from "../data/monthlyScheduleData.js";

// Default staff colors - expanded for comprehensive staff list
const defaultStaffColors = {
  Miranda: "#FF6B6B",
  Taylor: "#4ECDC4",
  Grace: "#45B7D1",
  Gemma: "#96CEB4",
  Rob: "#FFEAA7",
  Athena: "#DDA0DD",
  Bayla: "#98D8C8",
  Morph: "#F7DC6F",
  Emilie: "#BB8FCE",
  Cam: "#85C1E9",
  Courtney: "#F8C471",
  Emily: "#82E0AA",
  Reece: "#F1948A",
  Domingo: "#AED6F1",
};

// Create reactive state using Svelte 5 runes
export const scheduleStore = (() => {
  // Staff color customization
  let staffColors = $state({ ...defaultStaffColors });

  // Department color customization
  let departmentColors = $state({
    "animal-care": departments["animal-care"].color,
    lab: departments.lab.color,
    "front-desk": departments["front-desk"].color,
    trainee: departments.trainee.color,
    volunteer: departments.volunteer.color,
  });

  // Enhanced view preferences with comprehensive data support
  let viewMode = $state("weekly"); // 'weekly', 'daily', 'staff'
  let selectedDay = $state(null);
  let selectedStaff = $state(null);
  let showPatterns = $state(true);
  let showHours = $state(true);
  let compactView = $state(false);

  // Enhanced daily detail panel state
  let showDayDetailPanel = $state(false);
  let selectedDayData = $state(null);
  let isEditingAssignments = $state(false);
  let draggedStaff = $state(null);

  // Comprehensive schedule data integration
  let useComprehensiveData = $state(true);
  let comprehensiveScheduleData = $state([...june2025Schedule]);

  // Assignment and validation state
  let pendingAssignments = $state([]);
  let validationErrors = $state([]);
  let conflictWarnings = $state([]);

  // Filter states
  let departmentFilter = $state(new Set());
  let staffTypeFilter = $state(new Set());
  let timeFilter = $state({ start: null, end: null });

  // Enhanced computed values using comprehensive data
  const activeScheduleData = $derived(() => {
    return useComprehensiveData ? comprehensiveScheduleData : scheduleData;
  });

  const filteredSchedule = $derived(() => {
    const sourceData = useComprehensiveData
      ? comprehensiveScheduleData
      : scheduleData;

    if (useComprehensiveData) {
      // Filter comprehensive schedule data
      return sourceData.filter((day) => {
        // Department filter
        if (departmentFilter.size > 0) {
          const hasMatchingDepartment = day.finalAssignments.some(
            (assignment) => {
              const staff = staffCapabilities[assignment.staff];
              return (
                staff &&
                staff.departments.some((dept) => departmentFilter.has(dept))
              );
            }
          );
          if (!hasMatchingDepartment) return false;
        }

        // Staff type filter
        if (staffTypeFilter.size > 0) {
          const hasMatchingType = day.finalAssignments.some((assignment) => {
            const staff = staffCapabilities[assignment.staff];
            return staff && staffTypeFilter.has(staff.tier);
          });
          if (!hasMatchingType) return false;
        }

        return true;
      });
    } else {
      // Filter legacy schedule data
      return sourceData.map((day) => ({
        ...day,
        shifts: day.shifts.filter((shift) => {
          // Department filter
          if (
            departmentFilter.size > 0 &&
            !departmentFilter.has(shift.department)
          ) {
            return false;
          }

          // Staff type filter
          if (staffTypeFilter.size > 0 && !staffTypeFilter.has(shift.type)) {
            return false;
          }

          return true;
        }),
      }));
    }
  });

  const totalWeeklyHours = $derived(() =>
    scheduleData.reduce((total, day) => total + day.totalHours, 0)
  );

  const staffHoursSummary = $derived(() => {
    const summary = {};

    scheduleData.forEach((day) => {
      day.shifts.forEach((shift) => {
        if (!summary[shift.staff]) {
          summary[shift.staff] = {
            totalHours: 0,
            shifts: 0,
            departments: new Set(),
            info: staffInfo[shift.staff],
          };
        }

        summary[shift.staff].totalHours += shift.hours;
        summary[shift.staff].shifts += 1;
        summary[shift.staff].departments.add(shift.department);
      });
    });

    return summary;
  });

  const departmentHoursSummary = $derived(() => {
    const summary = {};

    Object.keys(departments).forEach((dept) => {
      summary[dept] = {
        totalHours: 0,
        staffCount: new Set(),
        shifts: 0,
        info: departments[dept],
      };
    });

    scheduleData.forEach((day) => {
      day.shifts.forEach((shift) => {
        if (summary[shift.department]) {
          summary[shift.department].totalHours += shift.hours;
          summary[shift.department].staffCount.add(shift.staff);
          summary[shift.department].shifts += 1;
        }
      });
    });

    return summary;
  });

  // Actions
  function updateStaffColor(staff, color) {
    staffColors[staff] = color;
  }

  function updateDepartmentColor(department, color) {
    departmentColors[department] = color;
  }

  function resetColors() {
    staffColors = { ...defaultStaffColors };
    departmentColors = {
      "animal-care": departments["animal-care"].color,
      lab: departments.lab.color,
      "front-desk": departments["front-desk"].color,
      trainee: departments.trainee.color,
      volunteer: departments.volunteer.color,
    };
  }

  function setViewMode(mode) {
    viewMode = mode;
  }

  function selectDay(day) {
    selectedDay = day;
  }

  function selectStaff(staff) {
    selectedStaff = staff;
  }

  function toggleDepartmentFilter(department) {
    if (departmentFilter.has(department)) {
      departmentFilter.delete(department);
    } else {
      departmentFilter.add(department);
    }
    // Trigger reactivity
    departmentFilter = new Set(departmentFilter);
  }

  function toggleStaffTypeFilter(type) {
    if (staffTypeFilter.has(type)) {
      staffTypeFilter.delete(type);
    } else {
      staffTypeFilter.add(type);
    }
    // Trigger reactivity
    staffTypeFilter = new Set(staffTypeFilter);
  }

  function clearFilters() {
    departmentFilter = new Set();
    staffTypeFilter = new Set();
    timeFilter = { start: null, end: null };
  }

  function togglePatterns() {
    showPatterns = !showPatterns;
  }

  function toggleHours() {
    showHours = !showHours;
  }

  function toggleCompactView() {
    compactView = !compactView;
  }

  // Enhanced daily detail panel actions
  function openDayDetailPanel(dayData) {
    selectedDayData = dayData;
    showDayDetailPanel = true;
  }

  function closeDayDetailPanel() {
    showDayDetailPanel = false;
    selectedDayData = null;
    isEditingAssignments = false;
    draggedStaff = null;
    pendingAssignments = [];
    validationErrors = [];
  }

  function toggleEditingMode() {
    isEditingAssignments = !isEditingAssignments;
  }

  // Staff assignment management
  function addStaffAssignment(dayIndex, assignment) {
    if (useComprehensiveData && comprehensiveScheduleData[dayIndex]) {
      comprehensiveScheduleData[dayIndex].finalAssignments.push(assignment);
      comprehensiveScheduleData = [...comprehensiveScheduleData];
      validateDayAssignments(dayIndex);
    }
  }

  function removeStaffAssignment(dayIndex, assignmentIndex) {
    if (useComprehensiveData && comprehensiveScheduleData[dayIndex]) {
      comprehensiveScheduleData[dayIndex].finalAssignments.splice(
        assignmentIndex,
        1
      );
      comprehensiveScheduleData = [...comprehensiveScheduleData];
      validateDayAssignments(dayIndex);
    }
  }

  function updateStaffAssignment(dayIndex, assignmentIndex, newAssignment) {
    if (useComprehensiveData && comprehensiveScheduleData[dayIndex]) {
      comprehensiveScheduleData[dayIndex].finalAssignments[assignmentIndex] =
        newAssignment;
      comprehensiveScheduleData = [...comprehensiveScheduleData];
      validateDayAssignments(dayIndex);
    }
  }

  // Validation and conflict detection
  function validateDayAssignments(dayIndex) {
    if (!useComprehensiveData || !comprehensiveScheduleData[dayIndex]) return;

    const day = comprehensiveScheduleData[dayIndex];
    const errors = [];
    const conflicts = [];

    // Check for double-booking
    day.finalAssignments.forEach((assignment, index) => {
      day.finalAssignments.forEach((otherAssignment, otherIndex) => {
        if (
          index !== otherIndex &&
          assignment.staff === otherAssignment.staff
        ) {
          conflicts.push({
            type: "double-booking",
            staff: assignment.staff,
            message: `${assignment.staff} is assigned to multiple shifts`,
          });
        }
      });
    });

    // Check qualification requirements
    day.finalAssignments.forEach((assignment) => {
      const staff = staffCapabilities[assignment.staff];
      if (!staff) {
        errors.push({
          type: "unknown-staff",
          staff: assignment.staff,
          message: `Staff member ${assignment.staff} not found in capabilities database`,
        });
      }
    });

    validationErrors = errors;
    conflictWarnings = conflicts;

    // Update coverage status
    updateCoverageStatus(dayIndex);
  }

  function updateCoverageStatus(dayIndex) {
    if (!useComprehensiveData || !comprehensiveScheduleData[dayIndex]) return;

    const day = comprehensiveScheduleData[dayIndex];
    const hasConflicts = conflictWarnings.length > 0;
    const hasErrors = validationErrors.length > 0;
    const hasMinimumStaff = day.finalAssignments.length >= 2;

    if (hasErrors || hasConflicts) {
      day.coverageStatus = "red";
    } else if (!hasMinimumStaff) {
      day.coverageStatus = "yellow";
    } else {
      day.coverageStatus = "green";
    }

    comprehensiveScheduleData = [...comprehensiveScheduleData];
  }

  // Utility functions
  function getShiftStyle(shift) {
    const baseColor = staffColors[shift.staff];
    const departmentColor = departmentColors[shift.department];

    return {
      backgroundColor: `${baseColor}20`,
      borderLeftColor: baseColor,
      color: "white",
      "--pattern-color": departmentColor,
    };
  }

  function getStaffColor(staff) {
    return staffColors[staff];
  }

  function getDepartmentColor(department) {
    return departmentColors[department];
  }

  // Export the enhanced store interface
  return {
    // Enhanced State
    get staffColors() {
      return staffColors;
    },
    get departmentColors() {
      return departmentColors;
    },
    get viewMode() {
      return viewMode;
    },
    get selectedDay() {
      return selectedDay;
    },
    get selectedStaff() {
      return selectedStaff;
    },
    get showPatterns() {
      return showPatterns;
    },
    get showHours() {
      return showHours;
    },
    get compactView() {
      return compactView;
    },
    get departmentFilter() {
      return departmentFilter;
    },
    get staffTypeFilter() {
      return staffTypeFilter;
    },
    get timeFilter() {
      return timeFilter;
    },

    // Enhanced Daily Detail Panel State
    get showDayDetailPanel() {
      return showDayDetailPanel;
    },
    get selectedDayData() {
      return selectedDayData;
    },
    get isEditingAssignments() {
      return isEditingAssignments;
    },
    get draggedStaff() {
      return draggedStaff;
    },
    get useComprehensiveData() {
      return useComprehensiveData;
    },
    get comprehensiveScheduleData() {
      return comprehensiveScheduleData;
    },
    get pendingAssignments() {
      return pendingAssignments;
    },
    get validationErrors() {
      return validationErrors;
    },
    get conflictWarnings() {
      return conflictWarnings;
    },

    // Enhanced Computed
    get activeScheduleData() {
      return activeScheduleData;
    },
    get filteredSchedule() {
      return filteredSchedule;
    },
    get totalWeeklyHours() {
      return totalWeeklyHours;
    },
    get staffHoursSummary() {
      return staffHoursSummary;
    },
    get departmentHoursSummary() {
      return departmentHoursSummary;
    },

    // Enhanced Actions
    updateStaffColor,
    updateDepartmentColor,
    resetColors,
    setViewMode,
    selectDay,
    selectStaff,
    toggleDepartmentFilter,
    toggleStaffTypeFilter,
    clearFilters,
    togglePatterns,
    toggleHours,
    toggleCompactView,

    // Enhanced Daily Detail Panel Actions
    openDayDetailPanel,
    closeDayDetailPanel,
    toggleEditingMode,

    // Enhanced Staff Assignment Management
    addStaffAssignment,
    removeStaffAssignment,
    updateStaffAssignment,

    // Enhanced Validation and Utilities
    validateDayAssignments: (dayIndex) => validateDayAssignments(dayIndex),
    updateCoverageStatus: (dayIndex) => updateCoverageStatus(dayIndex),
    getShiftStyle,
    getStaffColor,
    getDepartmentColor,

    // Enhanced Data Management
    setUseComprehensiveData: (value) => {
      useComprehensiveData = value;
    },
    setDraggedStaff: (staff) => {
      draggedStaff = staff;
    },
    clearValidationErrors: () => {
      validationErrors = [];
    },
    clearConflictWarnings: () => {
      conflictWarnings = [];
    },
  };
})();
