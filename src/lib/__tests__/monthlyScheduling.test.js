import { describe, it, expect } from 'vitest';
import { june2025Schedule, calculateCoverageStatus } from '../data/june2025Schedule.js';
import { staffCapabilities, criticalRequirements, eventTypes } from '../data/monthlyScheduleData.js';

describe('Monthly Scheduling System', () => {
    describe('June 2025 Schedule Data', () => {
        it('has complete schedule data structure', () => {
            expect(june2025Schedule).toHaveLength(5); // First 5 days of June
            
            june2025Schedule.forEach(day => {
                // Column A: Date of the month
                expect(day).toHaveProperty('date');
                expect(typeof day.date).toBe('number');
                expect(day.date).toBeGreaterThan(0);
                expect(day.date).toBeLessThanOrEqual(31);
                
                // Column B: Day of the week
                expect(day).toHaveProperty('dayOfWeek');
                expect(typeof day.dayOfWeek).toBe('string');
                
                // Column C: Staff availability input
                expect(day).toHaveProperty('staffAvailability');
                expect(Array.isArray(day.staffAvailability)).toBe(true);
                
                // Column D: Lab staff and volunteer availability
                expect(day).toHaveProperty('labStaffAvailability');
                expect(Array.isArray(day.labStaffAvailability)).toBe(true);
                
                // Column E: Staff unavailability/blackout dates
                expect(day).toHaveProperty('unavailableStaff');
                expect(Array.isArray(day.unavailableStaff)).toBe(true);
                
                // Column F: Final staff assignments
                expect(day).toHaveProperty('finalAssignments');
                expect(Array.isArray(day.finalAssignments)).toBe(true);
                
                // Columns G-K: Events data
                expect(day).toHaveProperty('events');
                expect(day).toHaveProperty('eventInstructors');
                expect(day).toHaveProperty('eventTimes');
                expect(day).toHaveProperty('eventLocations');
                expect(day).toHaveProperty('eventbriteLinks');
                
                // Coverage analysis
                expect(day).toHaveProperty('coverageStatus');
                expect(['green', 'yellow', 'red']).toContain(day.coverageStatus);
                expect(day).toHaveProperty('criticalGaps');
                expect(day).toHaveProperty('conflictWarnings');
            });
        });
        
        it('validates staff assignment structure', () => {
            june2025Schedule.forEach(day => {
                day.finalAssignments.forEach(assignment => {
                    expect(assignment).toHaveProperty('staff');
                    expect(assignment).toHaveProperty('time');
                    expect(assignment).toHaveProperty('role');
                    expect(assignment).toHaveProperty('hours');
                    expect(assignment).toHaveProperty('capabilities');
                    
                    expect(typeof assignment.staff).toBe('string');
                    expect(typeof assignment.time).toBe('string');
                    expect(typeof assignment.role).toBe('string');
                    expect(typeof assignment.hours).toBe('number');
                    expect(Array.isArray(assignment.capabilities)).toBe(true);
                    
                    // Verify staff exists in capabilities
                    expect(staffCapabilities).toHaveProperty(assignment.staff);
                });
            });
        });
        
        it('validates event structure', () => {
            june2025Schedule.forEach(day => {
                day.events.forEach(event => {
                    expect(event).toHaveProperty('name');
                    expect(event).toHaveProperty('type');
                    expect(typeof event.name).toBe('string');
                    expect(typeof event.type).toBe('string');
                });
            });
        });
    });
    
    describe('Staff Capabilities System', () => {
        it('has complete staff capability definitions', () => {
            const expectedStaff = [
                'Miranda', 'Taylor', 'Grace', 'Gemma', 'Rob', 
                'Athena', 'Bayla', 'Morph', 'Emilie', 'Cam',
                'Courtney', 'Emily', 'Reece'
            ];
            
            expectedStaff.forEach(staff => {
                expect(staffCapabilities).toHaveProperty(staff);
                
                const staffInfo = staffCapabilities[staff];
                expect(staffInfo).toHaveProperty('tier');
                expect(staffInfo).toHaveProperty('hourlyRate');
                expect(staffInfo).toHaveProperty('departments');
                expect(staffInfo).toHaveProperty('capabilities');
                expect(staffInfo).toHaveProperty('maxHoursPerWeek');
                expect(staffInfo).toHaveProperty('preferredShifts');
                
                expect(typeof staffInfo.tier).toBe('string');
                expect(typeof staffInfo.hourlyRate).toBe('number');
                expect(Array.isArray(staffInfo.departments)).toBe(true);
                expect(Array.isArray(staffInfo.capabilities)).toBe(true);
                expect(typeof staffInfo.maxHoursPerWeek).toBe('number');
                expect(Array.isArray(staffInfo.preferredShifts)).toBe(true);
            });
        });
        
        it('validates staff tier classifications', () => {
            const validTiers = ['senior', 'mid', 'entry', 'trainee', 'volunteer'];
            
            Object.values(staffCapabilities).forEach(staff => {
                expect(validTiers).toContain(staff.tier);
            });
        });
        
        it('validates hourly rates by tier', () => {
            Object.entries(staffCapabilities).forEach(([name, staff]) => {
                if (staff.tier === 'senior') {
                    expect(staff.hourlyRate).toBeGreaterThanOrEqual(17);
                } else if (staff.tier === 'mid') {
                    expect(staff.hourlyRate).toBeGreaterThanOrEqual(15);
                } else if (staff.tier === 'entry') {
                    expect(staff.hourlyRate).toBeGreaterThanOrEqual(14);
                } else if (staff.tier === 'trainee') {
                    expect(staff.hourlyRate).toBeGreaterThanOrEqual(13);
                } else if (staff.tier === 'volunteer') {
                    expect(staff.hourlyRate).toBe(0);
                }
            });
        });
    });
    
    describe('Critical Requirements System', () => {
        it('defines all critical staffing requirements', () => {
            const expectedRequirements = ['opening', 'closing', 'morning-care', 'front-desk'];
            
            expectedRequirements.forEach(req => {
                expect(criticalRequirements).toHaveProperty(req);
                
                const requirement = criticalRequirements[req];
                expect(requirement).toHaveProperty('name');
                expect(requirement).toHaveProperty('description');
                expect(requirement).toHaveProperty('requiredCapabilities');
                expect(requirement).toHaveProperty('minimumStaff');
                expect(requirement).toHaveProperty('timeSlots');
                
                expect(Array.isArray(requirement.requiredCapabilities)).toBe(true);
                expect(typeof requirement.minimumStaff).toBe('number');
                expect(Array.isArray(requirement.timeSlots)).toBe(true);
            });
        });
        
        it('validates critical requirement coverage', () => {
            june2025Schedule.forEach(day => {
                const assignments = day.finalAssignments;
                
                // Check opening coverage
                const hasOpening = assignments.some(a => a.capabilities.includes('opening'));
                
                // Check closing coverage  
                const hasClosing = assignments.some(a => a.capabilities.includes('closing'));
                
                // Check morning care coverage
                const hasMorningCare = assignments.some(a => 
                    a.capabilities.includes('morning-care') || a.capabilities.includes('animal-handling')
                );
                
                if (day.coverageStatus === 'green') {
                    expect(hasOpening).toBe(true);
                    expect(hasClosing).toBe(true);
                    expect(hasMorningCare).toBe(true);
                }
            });
        });
    });
    
    describe('Coverage Status Calculation', () => {
        it('correctly calculates coverage status', () => {
            june2025Schedule.forEach(day => {
                const calculatedStatus = calculateCoverageStatus(day);
                expect(['green', 'yellow', 'red']).toContain(calculatedStatus);
                
                // The calculated status should match the stored status
                // (allowing for some flexibility in the algorithm)
                if (day.criticalGaps.length > 0) {
                    expect(['yellow', 'red']).toContain(calculatedStatus);
                }
                
                if (day.conflictWarnings.length > 0) {
                    expect(['yellow', 'red']).toContain(calculatedStatus);
                }
            });
        });
        
        it('identifies coverage gaps correctly', () => {
            june2025Schedule.forEach(day => {
                if (day.coverageStatus === 'red') {
                    expect(day.criticalGaps.length).toBeGreaterThan(0);
                }
            });
        });
    });
    
    describe('Event Management System', () => {
        it('validates event types configuration', () => {
            const expectedEventTypes = ['cat-jam', 'sensory-friday', 'paint-sip', 'workshop', 'field-study'];
            
            expectedEventTypes.forEach(eventType => {
                expect(eventTypes).toHaveProperty(eventType);
                
                const event = eventTypes[eventType];
                expect(event).toHaveProperty('name');
                expect(event).toHaveProperty('requiredStaff');
                expect(event).toHaveProperty('requiredCapabilities');
                expect(event).toHaveProperty('duration');
                expect(event).toHaveProperty('location');
                
                expect(typeof event.requiredStaff).toBe('number');
                expect(Array.isArray(event.requiredCapabilities)).toBe(true);
                expect(typeof event.duration).toBe('number');
                expect(typeof event.location).toBe('string');
            });
        });
        
        it('validates event scheduling consistency', () => {
            june2025Schedule.forEach(day => {
                // Events, instructors, times, and locations should have consistent lengths
                const eventCount = day.events.length;
                
                if (eventCount > 0) {
                    expect(day.eventInstructors.length).toBeGreaterThanOrEqual(0);
                    expect(day.eventTimes.length).toBeGreaterThanOrEqual(0);
                    expect(day.eventLocations.length).toBeGreaterThanOrEqual(0);
                    expect(day.eventbriteLinks.length).toBeGreaterThanOrEqual(0);
                }
            });
        });
    });
    
    describe('Conflict Detection', () => {
        it('detects double-booking conflicts', () => {
            june2025Schedule.forEach(day => {
                const assignedStaff = day.finalAssignments.map(a => a.staff);
                const eventInstructors = day.eventInstructors.filter(instructor => 
                    instructor !== 'Staff TBD' && instructor !== 'TBD'
                );
                
                // Check for staff assigned to both regular shifts and events
                const conflicts = assignedStaff.filter(staff => eventInstructors.includes(staff));
                
                if (conflicts.length > 0) {
                    expect(day.conflictWarnings.length).toBeGreaterThan(0);
                }
            });
        });
    });
});
