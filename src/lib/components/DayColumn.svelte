<script>
    import { scheduleStore } from '../stores/scheduleStore.svelte.js';
    import { staffCapabilities } from '../data/monthlyScheduleData.js';
    import ShiftCard from './ShiftCard.svelte';

    const { day } = $props();

    const {
        compactView,
        showHours,
        selectDay,
        openDayDetailPanel,
        useComprehensiveData,
        getStaffColor
    } = scheduleStore;

    // Enhanced day data handling for comprehensive schedule
    const dayData = $derived(() => {
        if (useComprehensiveData && day.finalAssignments) {
            return day; // Already comprehensive data
        } else if (day.shifts) {
            return day; // Legacy data format
        }
        return null;
    });

    const coverageStatus = $derived(() => {
        if (useComprehensiveData && day.coverageStatus) {
            return day.coverageStatus;
        }
        // Calculate coverage for legacy data
        const localStaffCount = day.shifts ? day.shifts.length : 0;
        if (localStaffCount >= 3) return 'green';
        if (localStaffCount >= 2) return 'yellow';
        return 'red';
    });

    // Fix for staffCount - use direct computation instead of $derived
    let staffCount = $state(0);
    $effect(() => {
        if (useComprehensiveData && day.finalAssignments) {
            staffCount = day.finalAssignments.length;
        } else {
            staffCount = day.shifts ? day.shifts.length : 0;
        }
    });

    // Fix for eventCount - use direct computation instead of $derived
    let eventCount = $state(0);
    $effect(() => {
        eventCount = day.events ? day.events.length : 0;
    });

    // Fix for hasConflicts - use direct computation instead of $derived
    let hasConflicts = $state(false);
    $effect(() => {
        hasConflicts = day.conflictWarnings ? day.conflictWarnings.length > 0 : false;
    });

    function handleDayClick() {
        if (useComprehensiveData && day.finalAssignments) {
            openDayDetailPanel(day);
        } else {
            selectDay(day.day);
        }
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleDayClick();
        }
    }

    function getCoveragePercentage() {
        const maxStaff = 4; // Ideal staffing level
        return Math.min(100, (staffCount / maxStaff) * 100);
    }
</script>

<div
    class="day-column touch-target coverage-{coverageStatus}"
    class:compact={compactView}
    class:has-events={eventCount > 0}
    class:has-conflicts={hasConflicts}
    onclick={handleDayClick}
    onkeydown={handleKeyDown}
    tabindex="0"
    role="button"
    aria-label="View details for {useComprehensiveData ? day.dayOfWeek : day.day}, {useComprehensiveData ? day.fullDate : day.date}. {staffCount} staff members scheduled."
    aria-describedby="day-summary-{useComprehensiveData ? day.date : day.day}"
>
    <header class="day-header">
        <div class="day-title-row">
            <h3 class="day-name text-high-contrast">
                {useComprehensiveData ? day.dayOfWeek : day.day}
            </h3>
            <div class="coverage-status-indicator coverage-{coverageStatus}"
                 aria-label="Coverage status: {coverageStatus}">
                {#if coverageStatus === 'green'}✓
                {:else if coverageStatus === 'yellow'}⚠
                {:else}❌{/if}
            </div>
        </div>
        <div class="day-date text-medium-contrast">
            {useComprehensiveData ? day.fullDate : day.date}
        </div>
        {#if !useComprehensiveData && day.hours}
            <div class="day-hours text-low-contrast">{day.hours}</div>
        {/if}
        {#if showHours && day.totalHours}
            <div class="day-total-hours text-medium-contrast">
                Total: {day.totalHours}h
            </div>
        {/if}

        <!-- Enhanced status indicators -->
        <div class="status-indicators">
            <div class="staff-indicator" aria-label="{staffCount} staff members">
                👥 {staffCount}
            </div>
            {#if eventCount > 0}
                <div class="event-indicator" aria-label="{eventCount} events">
                    🎯 {eventCount}
                </div>
            {/if}
            {#if hasConflicts}
                <div class="conflict-indicator" aria-label="Has scheduling conflicts">
                    ⚠️
                </div>
            {/if}
        </div>
    </header>
    
    <div class="assignments" role="list" aria-label="Staff assignments for {useComprehensiveData ? day.dayOfWeek : day.day}">
        {#if useComprehensiveData && day.finalAssignments}
            {#each day.finalAssignments as assignment}
                <div role="listitem">
                    <div class="assignment-card"
                         style="border-left: 4px solid {getStaffColor(assignment.staff)}">
                        <div class="assignment-header">
                            <span class="staff-name">{assignment.staff}</span>
                            <span class="assignment-time">{assignment.time}</span>
                        </div>
                        <div class="assignment-role">{assignment.role}</div>
                        <div class="assignment-hours">{assignment.hours}h</div>
                        {#if assignment.capabilities}
                            <div class="assignment-capabilities">
                                {assignment.capabilities.slice(0, 2).join(', ')}
                                {#if assignment.capabilities.length > 2}
                                    <span class="capability-more">+{assignment.capabilities.length - 2}</span>
                                {/if}
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        {:else if day.shifts}
            {#each day.shifts as shift}
                <div role="listitem">
                    <ShiftCard {shift} />
                </div>
            {/each}
        {/if}

        {#if staffCount === 0}
            <div class="no-assignments" role="status" aria-label="No staff scheduled for {useComprehensiveData ? day.dayOfWeek : day.day}">
                <span>No staff scheduled</span>
                <button class="add-staff-btn" onclick={handleDayClick}>
                    + Add Staff
                </button>
            </div>
        {/if}
    </div>
    
    <footer class="day-footer">
        <div class="enhanced-coverage-indicator" aria-label="Staffing coverage for {useComprehensiveData ? day.dayOfWeek : day.day}">
            <span class="coverage-count text-medium-contrast" aria-label="{staffCount} staff members scheduled">
                {staffCount} staff
            </span>
            <div class="coverage-bar"
                 role="progressbar"
                 aria-valuenow={getCoveragePercentage()}
                 aria-valuemin="0"
                 aria-valuemax="100"
                 aria-label="Coverage level: {Math.round(getCoveragePercentage())}%">
                <div class="coverage-fill coverage-{coverageStatus}"
                     style="width: {getCoveragePercentage()}%">
                </div>
            </div>
            <span class="coverage-percentage text-low-contrast">
                {Math.round(getCoveragePercentage())}%
            </span>
        </div>

        {#if useComprehensiveData}
            <div class="quick-actions">
                <button class="quick-action-btn" onclick={handleDayClick} aria-label="Edit day schedule">
                    ✏️ Edit
                </button>
            </div>
        {/if}

        <div id="day-summary-{useComprehensiveData ? day.date : day.day}" class="sr-only">
            {useComprehensiveData ? day.dayOfWeek : day.day}, {useComprehensiveData ? day.fullDate : day.date}.
            {#if !useComprehensiveData && day.hours}Operating hours: {day.hours}.{/if}
            {staffCount} staff members scheduled.
            {#if eventCount > 0}{eventCount} events scheduled.{/if}
            {#if hasConflicts}Warning: scheduling conflicts detected.{/if}
            Click to view detailed schedule.
        </div>
    </footer>
</div>

<style>
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    .day-column {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 15px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        min-height: 500px;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
    }

    /* Enhanced coverage status styling */
    .day-column.coverage-green {
        border-left: 4px solid #4CAF50;
        background: rgba(76, 175, 80, 0.05);
    }

    .day-column.coverage-yellow {
        border-left: 4px solid #FFC107;
        background: rgba(255, 193, 7, 0.05);
    }

    .day-column.coverage-red {
        border-left: 4px solid #F44336;
        background: rgba(244, 67, 54, 0.05);
    }

    .day-column.has-events {
        border-top: 2px solid #2196F3;
    }

    .day-column.has-conflicts {
        box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.5);
    }

    .day-column:hover, .day-column:focus {
        background: rgba(255, 255, 255, 0.12);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        outline: 2px solid rgba(255, 255, 255, 0.3);
        outline-offset: 2px;
    }
    
    .day-column.compact {
        padding: 15px;
        min-height: 400px;
    }
    
    .day-header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    }

    .day-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .coverage-status-indicator {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: bold;
        color: white;
    }

    .coverage-status-indicator.coverage-green {
        background: #4CAF50;
    }

    .coverage-status-indicator.coverage-yellow {
        background: #FFC107;
        color: #333;
    }

    .coverage-status-indicator.coverage-red {
        background: #F44336;
    }

    .status-indicators {
        display: flex;
        gap: 8px;
        justify-content: center;
        margin-top: 10px;
        flex-wrap: wrap;
    }

    .staff-indicator, .event-indicator, .conflict-indicator {
        background: rgba(255, 255, 255, 0.1);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .event-indicator {
        background: rgba(33, 150, 243, 0.2);
        border: 1px solid rgba(33, 150, 243, 0.5);
    }

    .conflict-indicator {
        background: rgba(255, 152, 0, 0.2);
        border: 1px solid rgba(255, 152, 0, 0.5);
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    .day-name {
        font-size: 1.3rem;
        font-weight: 600;
        margin-bottom: 5px;
    }

    .day-date {
        font-size: 0.9rem;
        margin-bottom: 5px;
    }

    .day-hours {
        font-size: 0.8rem;
        margin-bottom: 5px;
    }

    .day-total-hours {
        font-size: 0.85rem;
        font-weight: 500;
        background: rgba(255, 255, 255, 0.1);
        padding: 4px 8px;
        border-radius: 12px;
        display: inline-block;
        margin-top: 5px;
    }
    
    .assignments {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .assignment-card {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 10px;
        transition: all 0.2s ease;
        border-left: 4px solid transparent;
    }

    .assignment-card:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateX(2px);
    }

    .assignment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
    }

    .staff-name {
        font-weight: 600;
        color: white;
        font-size: 0.9rem;
    }

    .assignment-time {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        font-weight: 500;
    }

    .assignment-role {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.8rem;
        margin-bottom: 4px;
    }

    .assignment-hours {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.75rem;
        margin-bottom: 4px;
    }

    .assignment-capabilities {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .capability-more {
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 0.65rem;
    }

    .no-assignments {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100px;
        color: rgba(255, 255, 255, 0.5);
        font-style: italic;
        border: 2px dashed rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        gap: 10px;
    }

    .add-staff-btn {
        background: rgba(76, 175, 80, 0.2);
        border: 1px solid #4CAF50;
        color: #4CAF50;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .add-staff-btn:hover {
        background: rgba(76, 175, 80, 0.3);
        transform: scale(1.05);
    }
    
    .day-footer {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .enhanced-coverage-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
    }

    .coverage-count {
        font-size: 0.75rem;
        min-width: 50px;
    }

    .coverage-bar {
        flex: 1;
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;
    }

    .coverage-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .coverage-fill.coverage-green {
        background: linear-gradient(90deg, #4CAF50, #8BC34A);
    }

    .coverage-fill.coverage-yellow {
        background: linear-gradient(90deg, #FFC107, #FFD54F);
    }

    .coverage-fill.coverage-red {
        background: linear-gradient(90deg, #F44336, #EF5350);
    }

    .coverage-percentage {
        font-size: 0.7rem;
        min-width: 35px;
        text-align: right;
    }

    .quick-actions {
        display: flex;
        justify-content: center;
        margin-top: 8px;
    }

    .quick-action-btn {
        background: rgba(33, 150, 243, 0.2);
        border: 1px solid rgba(33, 150, 243, 0.5);
        color: #2196F3;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 0.7rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .quick-action-btn:hover {
        background: rgba(33, 150, 243, 0.3);
        transform: scale(1.05);
    }
    
    @media (max-width: 768px) {
        .day-column {
            padding: 15px;
            min-height: 400px;
        }
        
        .day-name {
            font-size: 1.1rem;
        }
        
        .shifts {
            gap: 10px;
        }
    }
</style>
