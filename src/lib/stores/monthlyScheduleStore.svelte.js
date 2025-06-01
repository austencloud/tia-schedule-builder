// Monthly Schedule Store - Comprehensive scheduling system
import { june2025Schedule, calculateCoverageStatus } from '../data/june2025Schedule.js';
import { staffCapabilities, criticalRequirements, eventTypes } from '../data/monthlyScheduleData.js';

// State management for monthly scheduling
let currentMonth = $state('June 2025');
let currentYear = $state(2025);
let scheduleData = $state([...june2025Schedule]);
let selectedDay = $state(null);
let viewMode = $state('monthly'); // monthly, weekly, daily
let showSidePanelDay = $state(null);

// Filter states
let departmentFilter = $state(new Set());
let staffTypeFilter = $state(new Set());
let coverageFilter = $state(new Set()); // green, yellow, red
let eventFilter = $state(new Set());

// UI states
let showPatterns = $state(true);
let showHours = $state(true);
let compactView = $state(false);
let showCoverageIndicators = $state(true);
let showConflictWarnings = $state(true);

// Staff colors for visual identification
let staffColors = $state({
    'Miranda': '#FF6B6B',
    'Taylor': '#4ECDC4', 
    'Grace': '#45B7D1',
    'Gemma': '#96CEB4',
    'Rob': '#FFEAA7',
    'Athena': '#DDA0DD',
    'Bayla': '#98D8C8',
    'Morph': '#F7DC6F',
    'Emilie': '#BB8FCE',
    'Cam': '#85C1E9',
    'Courtney': '#82E0AA',
    'Emily': '#F8C471',
    'Reece': '#AED6F1',
    'Domingo': '#F1948A'
});

// Computed values
const filteredSchedule = $derived(() => {
    return scheduleData.filter(day => {
        // Coverage filter
        if (coverageFilter.size > 0 && !coverageFilter.has(day.coverageStatus)) {
            return false;
        }
        
        // Event filter
        if (eventFilter.size > 0) {
            const hasMatchingEvent = day.events.some(event => 
                eventFilter.has(event.type)
            );
            if (!hasMatchingEvent && !eventFilter.has('no-events')) {
                return false;
            }
            if (day.events.length === 0 && !eventFilter.has('no-events')) {
                return false;
            }
        }
        
        // Department filter
        if (departmentFilter.size > 0) {
            const hasMatchingDepartment = day.finalAssignments.some(assignment => {
                const staff = staffCapabilities[assignment.staff];
                return staff && staff.departments.some(dept => departmentFilter.has(dept));
            });
            if (!hasMatchingDepartment) {
                return false;
            }
        }
        
        return true;
    });
});

const monthlyStats = $derived(() => {
    const stats = {
        totalDays: scheduleData.length,
        greenDays: 0,
        yellowDays: 0,
        redDays: 0,
        totalEvents: 0,
        totalStaffHours: 0,
        totalCost: 0,
        staffUtilization: {}
    };
    
    scheduleData.forEach(day => {
        // Coverage status counts
        if (day.coverageStatus === 'green') stats.greenDays++;
        else if (day.coverageStatus === 'yellow') stats.yellowDays++;
        else if (day.coverageStatus === 'red') stats.redDays++;
        
        // Event counts
        stats.totalEvents += day.events.length;
        
        // Staff hours and costs
        day.finalAssignments.forEach(assignment => {
            const staff = staffCapabilities[assignment.staff];
            if (staff) {
                stats.totalStaffHours += assignment.hours;
                stats.totalCost += assignment.hours * staff.hourlyRate;
                
                if (!stats.staffUtilization[assignment.staff]) {
                    stats.staffUtilization[assignment.staff] = {
                        totalHours: 0,
                        totalDays: 0,
                        totalCost: 0
                    };
                }
                
                stats.staffUtilization[assignment.staff].totalHours += assignment.hours;
                stats.staffUtilization[assignment.staff].totalDays += 1;
                stats.staffUtilization[assignment.staff].totalCost += assignment.hours * staff.hourlyRate;
            }
        });
    });
    
    return stats;
});

const coverageAnalysis = $derived(() => {
    const analysis = {
        criticalGaps: [],
        conflictWarnings: [],
        recommendations: []
    };
    
    scheduleData.forEach((day, index) => {
        // Check critical requirements
        Object.entries(criticalRequirements).forEach(([key, requirement]) => {
            const hasRequiredStaff = day.finalAssignments.some(assignment => {
                return requirement.requiredCapabilities.some(cap => 
                    assignment.capabilities.includes(cap)
                );
            });
            
            if (!hasRequiredStaff) {
                analysis.criticalGaps.push({
                    date: day.fullDate,
                    dayOfWeek: day.dayOfWeek,
                    requirement: requirement.name,
                    description: requirement.description
                });
            }
        });
        
        // Check for double-booking conflicts
        day.finalAssignments.forEach(assignment => {
            day.events.forEach(event => {
                if (event.eventInstructors && event.eventInstructors.includes(assignment.staff)) {
                    analysis.conflictWarnings.push({
                        date: day.fullDate,
                        dayOfWeek: day.dayOfWeek,
                        staff: assignment.staff,
                        conflict: 'Double-booked for event and regular shift',
                        event: event.name
                    });
                }
            });
        });
    });
    
    return analysis;
});

// Store interface
export const monthlyScheduleStore = {
    // State getters
    get currentMonth() { return currentMonth; },
    get currentYear() { return currentYear; },
    get scheduleData() { return scheduleData; },
    get selectedDay() { return selectedDay; },
    get viewMode() { return viewMode; },
    get showSidePanelDay() { return showSidePanelDay; },
    
    // Filter getters
    get departmentFilter() { return departmentFilter; },
    get staffTypeFilter() { return staffTypeFilter; },
    get coverageFilter() { return coverageFilter; },
    get eventFilter() { return eventFilter; },
    
    // UI getters
    get showPatterns() { return showPatterns; },
    get showHours() { return showHours; },
    get compactView() { return compactView; },
    get showCoverageIndicators() { return showCoverageIndicators; },
    get showConflictWarnings() { return showConflictWarnings; },
    get staffColors() { return staffColors; },
    
    // Computed getters
    get filteredSchedule() { return filteredSchedule; },
    get monthlyStats() { return monthlyStats; },
    get coverageAnalysis() { return coverageAnalysis; },
    
    // Actions
    setCurrentMonth: (month) => { currentMonth = month; },
    setCurrentYear: (year) => { currentYear = year; },
    setSelectedDay: (day) => { selectedDay = day; },
    setViewMode: (mode) => { viewMode = mode; },
    setShowSidePanelDay: (day) => { showSidePanelDay = day; },
    
    // Filter actions
    toggleDepartmentFilter: (dept) => {
        if (departmentFilter.has(dept)) {
            departmentFilter.delete(dept);
        } else {
            departmentFilter.add(dept);
        }
        departmentFilter = new Set(departmentFilter);
    },
    
    toggleCoverageFilter: (status) => {
        if (coverageFilter.has(status)) {
            coverageFilter.delete(status);
        } else {
            coverageFilter.add(status);
        }
        coverageFilter = new Set(coverageFilter);
    },
    
    toggleEventFilter: (eventType) => {
        if (eventFilter.has(eventType)) {
            eventFilter.delete(eventType);
        } else {
            eventFilter.add(eventType);
        }
        eventFilter = new Set(eventFilter);
    },
    
    clearFilters: () => {
        departmentFilter = new Set();
        staffTypeFilter = new Set();
        coverageFilter = new Set();
        eventFilter = new Set();
    },
    
    // UI actions
    togglePatterns: () => { showPatterns = !showPatterns; },
    toggleHours: () => { showHours = !showHours; },
    toggleCompactView: () => { compactView = !compactView; },
    toggleCoverageIndicators: () => { showCoverageIndicators = !showCoverageIndicators; },
    toggleConflictWarnings: () => { showConflictWarnings = !showConflictWarnings; },
    
    updateStaffColor: (staff, color) => {
        staffColors[staff] = color;
        staffColors = { ...staffColors };
    },
    
    resetColors: () => {
        staffColors = { ...staffColors };
    },
    
    // Schedule management actions
    updateDayAssignment: (dayIndex, assignmentIndex, newAssignment) => {
        if (scheduleData[dayIndex] && scheduleData[dayIndex].finalAssignments[assignmentIndex]) {
            scheduleData[dayIndex].finalAssignments[assignmentIndex] = { ...newAssignment };
            scheduleData[dayIndex].coverageStatus = calculateCoverageStatus(scheduleData[dayIndex]);
            scheduleData = [...scheduleData];
        }
    },
    
    addStaffAssignment: (dayIndex, assignment) => {
        if (scheduleData[dayIndex]) {
            scheduleData[dayIndex].finalAssignments.push(assignment);
            scheduleData[dayIndex].coverageStatus = calculateCoverageStatus(scheduleData[dayIndex]);
            scheduleData = [...scheduleData];
        }
    },
    
    removeStaffAssignment: (dayIndex, assignmentIndex) => {
        if (scheduleData[dayIndex] && scheduleData[dayIndex].finalAssignments[assignmentIndex]) {
            scheduleData[dayIndex].finalAssignments.splice(assignmentIndex, 1);
            scheduleData[dayIndex].coverageStatus = calculateCoverageStatus(scheduleData[dayIndex]);
            scheduleData = [...scheduleData];
        }
    },
    
    addEvent: (dayIndex, event) => {
        if (scheduleData[dayIndex]) {
            scheduleData[dayIndex].events.push(event);
            scheduleData[dayIndex].coverageStatus = calculateCoverageStatus(scheduleData[dayIndex]);
            scheduleData = [...scheduleData];
        }
    },
    
    updateStaffAvailability: (dayIndex, staffMember, availability) => {
        if (scheduleData[dayIndex]) {
            const existingIndex = scheduleData[dayIndex].staffAvailability.findIndex(
                a => a.staff === staffMember
            );
            
            if (existingIndex >= 0) {
                scheduleData[dayIndex].staffAvailability[existingIndex] = availability;
            } else {
                scheduleData[dayIndex].staffAvailability.push(availability);
            }
            
            scheduleData = [...scheduleData];
        }
    },
    
    addUnavailableStaff: (dayIndex, staffMember, reason) => {
        if (scheduleData[dayIndex]) {
            scheduleData[dayIndex].unavailableStaff.push({ staff: staffMember, reason });
            scheduleData = [...scheduleData];
        }
    }
};
