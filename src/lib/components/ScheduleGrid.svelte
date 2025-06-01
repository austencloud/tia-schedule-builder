<script>
    import { scheduleStore } from '../stores/scheduleStore.svelte.js';
    import { scheduleData } from '../data/scheduleData.js';
    import DayColumn from './DayColumn.svelte';
    import StaffView from './StaffView.svelte';
    import DailyView from './DailyView.svelte';

    const {
        viewMode,
        compactView,
        departmentFilter,
        staffTypeFilter,
        timeFilter
    } = scheduleStore;

    // Calculate filteredSchedule directly to avoid Svelte 5 runes store issues
    const filteredSchedule = $derived(() => {
        return scheduleData.map((day) => ({
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

                // Time filter (simplified - could be enhanced)
                if (timeFilter.start || timeFilter.end) {
                    // Add time filtering logic here if needed
                }

                return true;
            }),
        }));
    });
    
    let innerWidth = $state(0);
    
    const responsiveClass = $derived(() => {
        if (innerWidth <= 480) return 'responsive-sm';
        if (innerWidth <= 768) return 'responsive-md';
        if (innerWidth <= 1200) return 'responsive-lg';
        return '';
    });
</script>

<svelte:window bind:innerWidth />

<div class="glass schedule-container">
    {#if viewMode === 'weekly'}
        <div class="schedule-grid {responsiveClass}" class:compact={compactView}>
            {#each filteredSchedule() as day}
                <DayColumn {day} />
            {/each}
        </div>
    {:else if viewMode === 'daily'}
        <DailyView />
    {:else if viewMode === 'staff'}
        <StaffView />
    {/if}
</div>

<style>
    .schedule-container {
        padding: 30px;
    }
    
    .schedule-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 20px;
        margin-top: 20px;
    }
    
    .schedule-grid.compact {
        gap: 15px;
    }
    
    .schedule-grid.compact :global(.day-column) {
        padding: 15px;
        min-height: 400px;
    }
    
    .schedule-grid.responsive-lg {
        grid-template-columns: repeat(4, 1fr);
    }
    
    .schedule-grid.responsive-md {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }
    
    .schedule-grid.responsive-sm {
        grid-template-columns: 1fr;
    }
    
    @media (max-width: 768px) {
        .schedule-container {
            padding: 20px;
        }
    }
</style>
