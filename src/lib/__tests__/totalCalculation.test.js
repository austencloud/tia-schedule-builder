import { describe, it, expect } from 'vitest';
import { scheduleData } from '../data/scheduleData.js';

describe('Total Hours Calculation', () => {
    it('calculates total weekly hours correctly from schedule data', () => {
        const totalHours = scheduleData.reduce((total, day) => total + day.totalHours, 0);
        
        // Based on the schedule data:
        // Monday: 9, Tuesday: 13, Wednesday: 20.5, Thursday: 26, Friday: 33, Saturday: 34, Sunday: 30
        // Total: 165.5
        expect(totalHours).toBe(165.5);
    });

    it('verifies individual day totals', () => {
        const expectedTotals = {
            'Monday': 9,
            'Tuesday': 13,
            'Wednesday': 20.5,
            'Thursday': 26,
            'Friday': 33,
            'Saturday': 34,
            'Sunday': 30
        };

        scheduleData.forEach(day => {
            expect(day.totalHours).toBe(expectedTotals[day.day]);
        });
    });

    it('verifies that totalHours matches sum of individual shift hours', () => {
        scheduleData.forEach(day => {
            const shiftTotal = day.shifts.reduce((sum, shift) => sum + shift.hours, 0);
            expect(day.totalHours).toBe(shiftTotal);
        });
    });

    it('ensures all days have positive hours', () => {
        scheduleData.forEach(day => {
            expect(day.totalHours).toBeGreaterThan(0);
            expect(Number.isFinite(day.totalHours)).toBe(true);
        });
    });

    it('verifies schedule data structure', () => {
        expect(scheduleData).toHaveLength(7); // 7 days of the week
        
        scheduleData.forEach(day => {
            expect(day).toHaveProperty('day');
            expect(day).toHaveProperty('date');
            expect(day).toHaveProperty('hours');
            expect(day).toHaveProperty('totalHours');
            expect(day).toHaveProperty('shifts');
            expect(Array.isArray(day.shifts)).toBe(true);
        });
    });
});
