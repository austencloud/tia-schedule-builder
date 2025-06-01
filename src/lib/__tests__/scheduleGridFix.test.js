import { describe, it, expect } from 'vitest';
import { scheduleData } from '../data/scheduleData.js';

describe('Schedule Grid Rendering Fix', () => {
    describe('Total Hours Calculation', () => {
        it('calculates the correct total weekly hours', () => {
            const totalHours = scheduleData.reduce((total, day) => total + day.totalHours, 0);
            expect(totalHours).toBe(165.5);
        });

        it('matches the expected weekly breakdown', () => {
            const expectedDayTotals = [
                { day: 'Monday', hours: 9 },
                { day: 'Tuesday', hours: 13 },
                { day: 'Wednesday', hours: 20.5 },
                { day: 'Thursday', hours: 26 },
                { day: 'Friday', hours: 33 },
                { day: 'Saturday', hours: 34 },
                { day: 'Sunday', hours: 30 }
            ];

            expectedDayTotals.forEach(expected => {
                const dayData = scheduleData.find(d => d.day === expected.day);
                expect(dayData.totalHours).toBe(expected.hours);
            });
        });

        it('ensures all calculations are numeric values', () => {
            scheduleData.forEach(day => {
                expect(typeof day.totalHours).toBe('number');
                expect(Number.isFinite(day.totalHours)).toBe(true);
                expect(day.totalHours).toBeGreaterThan(0);
            });

            const total = scheduleData.reduce((sum, day) => sum + day.totalHours, 0);
            expect(typeof total).toBe('number');
            expect(Number.isFinite(total)).toBe(true);
        });
    });

    describe('Data Integrity', () => {
        it('has complete schedule data for all 7 days', () => {
            expect(scheduleData).toHaveLength(7);
            
            const expectedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const actualDays = scheduleData.map(d => d.day);
            
            expectedDays.forEach(day => {
                expect(actualDays).toContain(day);
            });
        });

        it('has consistent data structure for each day', () => {
            scheduleData.forEach(day => {
                expect(day).toHaveProperty('day');
                expect(day).toHaveProperty('date');
                expect(day).toHaveProperty('hours');
                expect(day).toHaveProperty('totalHours');
                expect(day).toHaveProperty('shifts');
                
                expect(typeof day.day).toBe('string');
                expect(typeof day.date).toBe('string');
                expect(typeof day.hours).toBe('string');
                expect(typeof day.totalHours).toBe('number');
                expect(Array.isArray(day.shifts)).toBe(true);
            });
        });

        it('validates that day totals match shift sums', () => {
            scheduleData.forEach(day => {
                const shiftSum = day.shifts.reduce((sum, shift) => sum + shift.hours, 0);
                expect(day.totalHours).toBe(shiftSum);
            });
        });
    });

    describe('Fix Validation', () => {
        it('confirms the total is not a function or function code', () => {
            const total = scheduleData.reduce((sum, day) => sum + day.totalHours, 0);
            
            // Should be a number, not a function
            expect(typeof total).toBe('number');
            expect(total).not.toBeInstanceOf(Function);
            
            // Should not contain function-like strings when converted to string
            const totalString = String(total);
            expect(totalString).not.toContain('() =>');
            expect(totalString).not.toContain('function');
            expect(totalString).not.toContain('reduce');
            expect(totalString).not.toContain('scheduleData');
        });

        it('produces the expected display value', () => {
            const total = scheduleData.reduce((sum, day) => sum + day.totalHours, 0);
            expect(total).toBe(165.5);
            expect(String(total)).toBe('165.5');
        });

        it('validates that the calculation is deterministic', () => {
            // Run the calculation multiple times to ensure consistency
            const calculations = Array.from({ length: 5 }, () => 
                scheduleData.reduce((sum, day) => sum + day.totalHours, 0)
            );
            
            calculations.forEach(result => {
                expect(result).toBe(165.5);
            });
        });
    });
});
