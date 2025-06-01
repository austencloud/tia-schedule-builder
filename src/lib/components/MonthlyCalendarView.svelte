<script>
    import { monthlyScheduleStore } from '../stores/monthlyScheduleStore.svelte.js';
    import { scheduleStore } from '../stores/scheduleStore.svelte.js';
    import DayDetailSidePanel from './DayDetailSidePanel.svelte';

    const {
        filteredSchedule,
        showCoverageIndicators,
        showConflictWarnings,
        setShowSidePanelDay,
        showSidePanelDay
    } = monthlyScheduleStore;

    const { openDayDetailPanel } = scheduleStore;
    
    // Generate calendar grid for June 2025
    const generateCalendarGrid = () => {
        const year = 2025;
        const month = 5; // June (0-indexed)
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
        
        const weeks = [];
        let currentWeek = [];
        
        // Ensure filteredSchedule is an array
        const scheduleArray = Array.isArray(filteredSchedule) ? filteredSchedule : [];

        
        for (let i = 0; i < 42; i++) { // 6 weeks max
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayData = scheduleArray.find(day => {
                // More robust date matching using the date property
                const matches = day.date === currentDate.getDate() &&
                       currentDate.getMonth() === 5 && // June (0-indexed)
                       currentDate.getFullYear() === 2025;



                return matches;
            });
            
            currentWeek.push({
                date: currentDate.getDate(),
                fullDate: currentDate,
                isCurrentMonth: currentDate.getMonth() === month,
                dayData: dayData || null
            });
            
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }
        
        return weeks;
    };
    
    const calendarWeeks = generateCalendarGrid();
    
    function handleDayClick(dayInfo) {
        if (dayInfo.dayData) {
            openDayDetailPanel(dayInfo.dayData);
        }
    }
    
    function getCoverageStatusClass(dayData) {
        if (!dayData) return '';
        return `coverage-${dayData.coverageStatus}`;
    }
    
    function getEventCount(dayData) {
        return dayData ? dayData.events.length : 0;
    }
    
    function getStaffCount(dayData) {
        return dayData ? dayData.finalAssignments.length : 0;
    }
    
    function hasConflicts(dayData) {
        return dayData ? dayData.conflictWarnings.length > 0 : false;
    }
</script>

<div class="monthly-calendar">
    <div class="calendar-header">
        <h2>June 2025 - Monthly Schedule</h2>
        <div class="calendar-legend">
            {#if showCoverageIndicators}
                <div class="legend-item">
                    <div class="status-indicator coverage-green"></div>
                    <span>Fully Covered</span>
                </div>
                <div class="legend-item">
                    <div class="status-indicator coverage-yellow"></div>
                    <span>Partial Coverage</span>
                </div>
                <div class="legend-item">
                    <div class="status-indicator coverage-red"></div>
                    <span>Critical Gaps</span>
                </div>
            {/if}
        </div>
    </div>
    
    <div class="calendar-grid">
        <div class="calendar-weekdays">
            <div class="weekday">Sun</div>
            <div class="weekday">Mon</div>
            <div class="weekday">Tue</div>
            <div class="weekday">Wed</div>
            <div class="weekday">Thu</div>
            <div class="weekday">Fri</div>
            <div class="weekday">Sat</div>
        </div>
        
        {#each calendarWeeks as week}
            <div class="calendar-week">
                {#each week as dayInfo}
                    <div 
                        class="calendar-day {getCoverageStatusClass(dayInfo.dayData)}"
                        class:other-month={!dayInfo.isCurrentMonth}
                        class:has-data={dayInfo.dayData}
                        class:has-conflicts={hasConflicts(dayInfo.dayData)}
                        onclick={() => handleDayClick(dayInfo)}
                        onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? handleDayClick(dayInfo) : null}
                        role="button"
                        tabindex="0"
                        aria-label="View details for {dayInfo.fullDate.toLocaleDateString()}"
                    >
                        <div class="day-number">{dayInfo.date}</div>

                        {#if dayInfo.dayData}
                            <div class="day-summary">
                                <div class="staff-count">
                                    👥 {getStaffCount(dayInfo.dayData)}
                                </div>
                                
                                {#if getEventCount(dayInfo.dayData) > 0}
                                    <div class="event-count">
                                        🎯 {getEventCount(dayInfo.dayData)}
                                    </div>
                                {/if}
                                
                                {#if showConflictWarnings && hasConflicts(dayInfo.dayData)}
                                    <div class="conflict-indicator">⚠️</div>
                                {/if}
                                
                                {#if showCoverageIndicators}
                                    <div class="coverage-indicator {dayInfo.dayData.coverageStatus}">
                                        {#if dayInfo.dayData.coverageStatus === 'green'}✓
                                        {:else if dayInfo.dayData.coverageStatus === 'yellow'}⚠
                                        {:else}❌{/if}
                                    </div>
                                {/if}
                            </div>
                            
                            <div class="day-preview">
                                {#each dayInfo.dayData.finalAssignments.slice(0, 2) as assignment}
                                    <div class="assignment-preview">
                                        {assignment.staff} ({assignment.time})
                                    </div>
                                {/each}
                                {#if dayInfo.dayData.finalAssignments.length > 2}
                                    <div class="more-assignments">
                                        +{dayInfo.dayData.finalAssignments.length - 2} more
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>

{#if showSidePanelDay}
    <DayDetailSidePanel />
{/if}

<style>
    .monthly-calendar {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 25px;
        margin: 20px 0;
    }
    
    .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .calendar-header h2 {
        color: white;
        margin: 0;
        font-size: 1.5rem;
    }
    
    .calendar-legend {
        display: flex;
        gap: 15px;
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        gap: 5px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.8rem;
    }
    
    .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
    }
    
    .coverage-green { background: #4CAF50; }
    .coverage-yellow { background: #FFC107; }
    .coverage-red { background: #F44336; }
    
    .calendar-grid {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    
    .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        margin-bottom: 10px;
    }
    
    .weekday {
        text-align: center;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.7);
        padding: 10px;
        font-size: 0.9rem;
    }
    
    .calendar-week {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
    }
    
    .calendar-day {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 8px;
        min-height: 100px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        position: relative;
    }
    
    .calendar-day:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
    }
    
    .calendar-day.has-data {
        border-color: rgba(255, 255, 255, 0.2);
    }
    
    .calendar-day.coverage-green {
        border-color: #4CAF50;
        background: rgba(76, 175, 80, 0.1);
    }
    
    .calendar-day.coverage-yellow {
        border-color: #FFC107;
        background: rgba(255, 193, 7, 0.1);
    }
    
    .calendar-day.coverage-red {
        border-color: #F44336;
        background: rgba(244, 67, 54, 0.1);
    }
    
    .calendar-day.has-conflicts {
        box-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
    }
    
    .calendar-day.other-month {
        opacity: 0.3;
        pointer-events: none;
    }
    
    .day-number {
        font-weight: 600;
        color: white;
        font-size: 1.1rem;
        margin-bottom: 5px;
    }
    
    .day-summary {
        display: flex;
        gap: 5px;
        margin-bottom: 5px;
        flex-wrap: wrap;
    }
    
    .staff-count, .event-count {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.8);
    }
    
    .conflict-indicator {
        font-size: 0.8rem;
    }
    
    .coverage-indicator {
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .coverage-indicator.green { color: #4CAF50; }
    .coverage-indicator.yellow { color: #FFC107; }
    .coverage-indicator.red { color: #F44336; }
    
    .day-preview {
        font-size: 0.65rem;
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.2;
    }
    
    .assignment-preview {
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .more-assignments {
        font-style: italic;
        color: rgba(255, 255, 255, 0.5);
    }
    
    @media (max-width: 768px) {
        .calendar-day {
            min-height: 80px;
            padding: 6px;
        }
        
        .calendar-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
        }
        
        .calendar-legend {
            flex-wrap: wrap;
        }
    }
</style>
