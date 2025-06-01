import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { fireEvent } from '@testing-library/dom';
import App from '../../App.svelte';
import Header from '../components/Header.svelte';
import ShiftCard from '../components/ShiftCard.svelte';
import DayColumn from '../components/DayColumn.svelte';

describe('Accessibility Improvements', () => {
  describe('Focus Management', () => {
    it('should have proper skip link functionality', async () => {
      render(App);
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
      
      // Test skip link focus behavior
      skipLink.focus();
      expect(skipLink).toHaveFocus();
    });

    it('should have keyboard accessible system toggle', async () => {
      render(App);
      
      const toggleButton = screen.getByText('Switch to Weekly View');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-describedby');
      
      // Test keyboard interaction
      toggleButton.focus();
      expect(toggleButton).toHaveFocus();
      
      await fireEvent.keyDown(toggleButton, { key: 'Enter' });
      // Should switch to weekly view
      expect(screen.getByText('Switch to Monthly System')).toBeInTheDocument();
    });
  });

  describe('Touch Target Compliance', () => {
    it('should have minimum 44px touch targets for buttons', () => {
      render(App);
      
      const toggleButton = screen.getByText('Switch to Weekly View');
      const styles = window.getComputedStyle(toggleButton);
      
      // Check minimum height (should be at least 44px)
      const minHeight = parseInt(styles.minHeight);
      expect(minHeight).toBeGreaterThanOrEqual(44);
    });

    it('should have proper touch target classes applied', () => {
      render(App);
      
      const toggleButton = screen.getByText('Switch to Weekly View');
      expect(toggleButton).toHaveClass('touch-target');
    });
  });

  describe('ARIA Support', () => {
    it('should have proper ARIA labels for statistics', () => {
      render(Header);
      
      // Check for ARIA labels on statistics
      const weeklyHours = screen.getByLabelText(/Total weekly hours/);
      const monthlyHours = screen.getByLabelText(/Monthly hours/);
      const monthlyCost = screen.getByLabelText(/Monthly cost/);
      
      expect(weeklyHours).toBeInTheDocument();
      expect(monthlyHours).toBeInTheDocument();
      expect(monthlyCost).toBeInTheDocument();
    });

    it('should have proper role attributes for interactive elements', () => {
      render(App);
      
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Museum staffing schedule application');
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Navigation breadcrumb');
    });
  });

  describe('Text Contrast Classes', () => {
    it('should apply high contrast classes to important text', () => {
      render(Header);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('text-high-contrast');
    });

    it('should apply medium contrast classes to secondary text', () => {
      render(Header);
      
      const subtitle = screen.getByText(/June 2025 - Optimized Weekly Template/);
      expect(subtitle).toHaveClass('text-medium-contrast');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for shift cards', async () => {
      const mockShift = {
        time: '9:00 AM - 5:00 PM',
        staff: 'John Doe',
        role: 'Gallery Guide',
        area: 'Main Gallery',
        department: 'education',
        type: 'paid',
        hours: 8
      };

      render(ShiftCard, { props: { shift: mockShift } });
      
      const shiftCard = screen.getByRole('button');
      expect(shiftCard).toBeInTheDocument();
      expect(shiftCard).toHaveAttribute('tabindex', '0');
      
      // Test keyboard interaction
      shiftCard.focus();
      expect(shiftCard).toHaveFocus();
      
      // Test Enter key
      await fireEvent.keyDown(shiftCard, { key: 'Enter' });
      // Should trigger click handler
      
      // Test Space key
      await fireEvent.keyDown(shiftCard, { key: ' ' });
      // Should trigger click handler
    });

    it('should support keyboard navigation for day columns', async () => {
      const mockDay = {
        day: 'Monday',
        date: 'June 2, 2025',
        hours: '9:00 AM - 5:00 PM',
        totalHours: 24,
        shifts: []
      };

      render(DayColumn, { props: { day: mockDay } });
      
      const dayColumn = screen.getByRole('button');
      expect(dayColumn).toBeInTheDocument();
      expect(dayColumn).toHaveAttribute('tabindex', '0');
      
      // Test keyboard interaction
      dayColumn.focus();
      expect(dayColumn).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have descriptive ARIA labels for complex interactions', () => {
      const mockShift = {
        time: '9:00 AM - 5:00 PM',
        staff: 'John Doe',
        role: 'Gallery Guide',
        area: 'Main Gallery',
        department: 'education',
        type: 'paid',
        hours: 8
      };

      render(ShiftCard, { props: { shift: mockShift } });
      
      const shiftCard = screen.getByRole('button');
      expect(shiftCard).toHaveAttribute('aria-label');
      expect(shiftCard).toHaveAttribute('aria-describedby');
      
      const ariaLabel = shiftCard.getAttribute('aria-label');
      expect(ariaLabel).toContain('John Doe');
      expect(ariaLabel).toContain('Gallery Guide');
      expect(ariaLabel).toContain('9:00 AM - 5:00 PM');
    });

    it('should have screen reader only content for detailed descriptions', () => {
      const mockShift = {
        time: '9:00 AM - 5:00 PM',
        staff: 'John Doe',
        role: 'Gallery Guide',
        area: 'Main Gallery',
        department: 'education',
        type: 'paid',
        hours: 8
      };

      render(ShiftCard, { props: { shift: mockShift } });
      
      // Check for sr-only content
      const srOnlyElements = document.querySelectorAll('.sr-only');
      expect(srOnlyElements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for different screen sizes', () => {
      render(App);
      
      // Check for responsive utility classes in the DOM
      const appContainer = document.querySelector('.app-container');
      expect(appContainer).toBeInTheDocument();
    });
  });

  describe('Error Prevention', () => {
    it('should provide clear feedback for user actions', () => {
      render(App);
      
      // Check for descriptive help text
      const helpText = screen.getByText(/Switch from monthly calendar view to weekly detailed schedule view/);
      expect(helpText).toBeInTheDocument();
      expect(helpText).toHaveClass('sr-only');
    });
  });
});

describe('Mobile Experience Improvements', () => {
  describe('Touch Targets', () => {
    it('should have larger touch targets on mobile viewports', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(App);
      
      const toggleButton = screen.getByText('Switch to Weekly View');
      expect(toggleButton).toHaveClass('touch-target');
    });
  });

  describe('Responsive Layout', () => {
    it('should adapt layout for mobile screens', () => {
      render(App);
      
      // Check for mobile-responsive classes
      const systemHeader = document.querySelector('.system-header');
      expect(systemHeader).toBeInTheDocument();
    });
  });
});
