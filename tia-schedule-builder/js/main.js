// TIA Schedule Builder - Main JavaScript Module
// Coordinates all functionality and initializes the application

import { TableHandler } from './table-handler.js';
import { CalendarHandler } from './calendar-handler.js';
import { ModalHandler } from './modal-handler.js';
import { Navigation } from './navigation.js';

// Staff payroll data (corrected calculations)
const staffData = [
    {
        name: 'Rob',
        type: 'Primary',
        rate: 20.00,
        hours: 64,
        pay: 1280.00,
        weeklyDesired: 20,
        monthlyDesired: 86.0,
        utilization: 74
    },
    {
        name: 'Grace',
        type: 'Primary',
        rate: 17.00,
        hours: 75,
        pay: 1275.00,
        weeklyDesired: 20,
        monthlyDesired: 86.0,
        utilization: 87
    },
    {
        name: 'Domingo',
        type: 'Primary',
        rate: 25.00,
        hours: 48,
        pay: 1200.00,
        weeklyDesired: 20,
        monthlyDesired: 86.0,
        utilization: 56
    },
    {
        name: 'Athena',
        type: 'Primary',
        rate: 17.00,
        hours: 56,
        pay: 952.00,
        weeklyDesired: 20,
        monthlyDesired: 86.0,
        utilization: 65
    },
    {
        name: 'Miranda',
        type: 'Primary',
        rate: 20.00,
        hours: 42.5,
        pay: 850.00,
        weeklyDesired: 20,
        monthlyDesired: 86.0,
        utilization: 49
    },
    {
        name: 'Taylor',
        type: 'Primary',
        rate: 16.00,
        hours: 46,
        pay: 736.00,
        weeklyDesired: 20,
        monthlyDesired: 86.0,
        utilization: 53
    },
    {
        name: 'Gemma',
        type: 'Primary',
        rate: 16.00,
        hours: 42,
        pay: 672.00,
        weeklyDesired: 20,
        monthlyDesired: 86.0,
        utilization: 49
    },
    {
        name: 'Bayla',
        type: 'Primary',
        rate: 17.00,
        hours: 30,
        pay: 510.00,
        weeklyDesired: 20,
        monthlyDesired: 86.0,
        utilization: 35
    },
    {
        name: 'Morph',
        type: 'Primary',
        rate: 16.00,
        hours: 27,
        pay: 432.00,
        weeklyDesired: 20,
        monthlyDesired: 86.0,
        utilization: 31
    },
    {
        name: 'Emilie',
        type: 'Primary/Volunteer (lab only)',
        rate: 15.00,
        hours: 16,
        pay: 240.00,
        weeklyDesired: 20,
        monthlyDesired: 86.0,
        utilization: 19
    },
    {
        name: 'Cam',
        type: 'Primary/Volunteer (lab only)',
        rate: 15.00,
        hours: 14.5,
        pay: 217.50,
        weeklyDesired: 20,
        monthlyDesired: 86.0,
        utilization: 17
    },
    {
        name: 'Courtney',
        type: 'Volunteer',
        rate: 0.00,
        hours: 16,
        pay: 0.00,
        weeklyDesired: 4,
        monthlyDesired: 17.2,
        utilization: 93
    },
    {
        name: 'Donnie',
        type: 'Live-in',
        rate: 0.00,
        hours: 6,
        pay: 0.00,
        weeklyDesired: 10,
        monthlyDesired: 43.0,
        utilization: 14
    },
    {
        name: 'Ruby',
        type: 'Primary',
        rate: 15.00,
        hours: 0,
        pay: 0.00,
        weeklyDesired: 10,
        monthlyDesired: 43.0,
        utilization: 0
    },
    {
        name: 'Reece',
        type: 'Volunteer',
        rate: 0.00,
        hours: 0,
        pay: 0.00,
        weeklyDesired: 0,
        monthlyDesired: 0,
        utilization: 0
    },
    {
        name: 'Emily',
        type: 'Volunteer',
        rate: 0.00,
        hours: 0,
        pay: 0.00,
        weeklyDesired: 0,
        monthlyDesired: 0,
        utilization: 0
    }
];

// Insights data
const insightsData = [
    {
        type: 'success',
        title: '✅ Calculation Correction Applied',
        content: 'Critical Error Fixed: Utilization percentages were incorrectly calculated using weekly desired hours as monthly. Now properly calculated as (Total Monthly Hours / (Weekly Desired × 4.3 weeks)) × 100. This completely changes the staffing assessment from "critical crisis" to "under-utilization opportunity."'
    },
    {
        type: 'info',
        title: '📅 Enhanced Interactive Calendar',
        content: 'Glass Morphism Design: The visual calendar features color-coded staff badges with glass morphism effects, showing specific work hours (e.g., "11am-7pm") and roles (Lab, Animal Care, Front Desk). Each staff member has a unique color for easy identification across all days. Click any calendar day to view detailed information including events and notes.'
    },
    {
        type: 'success',
        title: '🎨 Visual Design Enhancements',
        content: 'Professional Presentation: Staff badges use distinct colors (Rob: red, Grace: blue, Domingo: purple, etc.) with semi-transparent backgrounds and subtle shadows. Time ranges are clearly displayed, and role information helps identify responsibilities. Interactive hover effects and clickable day details provide comprehensive schedule visualization.'
    },
    {
        type: 'info',
        title: '📊 Actual Staffing Situation',
        content: 'Reality Check: Only 2 staff members are optimally utilized (Grace 87%, Courtney 93%). The majority (11 staff) are significantly under-utilized, with most working only 17-74% of their desired capacity. This indicates opportunity for increased scheduling rather than crisis management.'
    },
    {
        type: 'warning',
        title: '⚠️ Under-Utilization Concerns',
        content: 'Staffing Gaps: Most primary staff are working well below their desired hours: Cam (17%), Emilie (19%), Morph (31%), Bayla (35%), Miranda (49%), Gemma (49%), Taylor (53%), Domingo (56%), Athena (65%), Rob (74%). This suggests either insufficient work available or scheduling inefficiencies.'
    },
    {
        type: 'info',
        title: '💰 Financial Optimization Opportunities',
        content: 'Cost Analysis: $8,364.50 total payroll for 483 hours ($17.32/hour average). With significant under-utilization, there\'s potential to either increase productivity with existing staff or optimize the workforce size to match actual scheduling needs.'
    },
    {
        type: 'success',
        title: '📈 Strategic Recommendations',
        content: 'Increase scheduling: Most staff can handle significantly more hours • Fill coverage gaps: 23 days with no coverage could be filled by under-utilized staff • Optimize workforce: Consider if current staffing levels match operational needs • Engage volunteers: Ruby (0% utilized) and other volunteers could contribute more • Review desired hours: Staff desired hours may not align with operational requirements'
    }
];

// Application class
class TIAScheduleBuilder {
    constructor() {
        this.tableHandler = null;
        this.calendarHandler = null;
        this.modalHandler = null;
        this.navigation = null;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing TIA Schedule Builder...');
            
            // Initialize navigation
            this.navigation = new Navigation();
            
            // Initialize modal handler
            this.modalHandler = new ModalHandler();
            
            // Initialize table handler
            this.tableHandler = new TableHandler(staffData);
            await this.tableHandler.render();
            
            // Initialize calendar handler
            this.calendarHandler = new CalendarHandler(this.modalHandler);
            await this.calendarHandler.render();
            
            // Render insights
            this.renderInsights();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ TIA Schedule Builder initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing TIA Schedule Builder:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }
    
    renderInsights() {
        const container = document.getElementById('insights-container');
        if (!container) return;
        
        const insightsHTML = `
            <div class="insights">
                ${insightsData.map(insight => `
                    <div class="insight-item ${insight.type}">
                        <h4>${insight.title}</h4>
                        <p>${insight.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = insightsHTML;
    }
    
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            if (this.calendarHandler) {
                this.calendarHandler.handleResize();
            }
        }, 250));
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.modalHandler.closeModal();
            }
        });
        
        // Handle print functionality
        window.addEventListener('beforeprint', () => {
            document.body.classList.add('printing');
        });
        
        window.addEventListener('afterprint', () => {
            document.body.classList.remove('printing');
        });
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tiaApp = new TIAScheduleBuilder();
});

// Export for use in other modules
export { TIAScheduleBuilder, staffData, insightsData };
