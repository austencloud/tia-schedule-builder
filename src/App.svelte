<script>
    import Header from './lib/components/Header.svelte';
    import ControlPanel from './lib/components/ControlPanel.svelte';
    import ScheduleGrid from './lib/components/ScheduleGrid.svelte';
    import Legend from './lib/components/Legend.svelte';
    import MonthlyControlPanel from './lib/components/MonthlyControlPanel.svelte';
    import MonthlyCalendarView from './lib/components/MonthlyCalendarView.svelte';
    import HelpSystem from './lib/components/HelpSystem.svelte';
    import ContextualTooltip from './lib/components/ContextualTooltip.svelte';
    import KeyboardShortcuts from './lib/components/KeyboardShortcuts.svelte';
    import PerformanceMonitor from './lib/components/PerformanceMonitor.svelte';
    import AdvancedSearch from './lib/components/AdvancedSearch.svelte';
    import EnhancedDayDetailPanel from './lib/components/EnhancedDayDetailPanel.svelte';
    import { scheduleStore } from './lib/stores/scheduleStore.svelte.js';
    import { monthlyScheduleStore } from './lib/stores/monthlyScheduleStore.svelte.js';
    import { userPreferencesStore } from './lib/stores/userPreferencesStore.svelte.js';

    const { viewMode: weeklyViewMode } = scheduleStore;
    const { viewMode: monthlyViewMode } = monthlyScheduleStore;

    // Determine which system to use based on URL or default to monthly
    let useMonthlySystem = $state(true); // Default to new monthly system
    let showHelp = $state(false);
    let showPerformanceMonitor = $state(false);
    let showKeyboardShortcuts = $state(false);
    let showAdvancedSearch = $state(false);

    // Performance monitoring
    let performanceMonitorMethods;

    // Search data - combine all schedule data for searching
    const searchData = $derived(() => {
        const weeklyData = scheduleStore.filteredSchedule?.flatMap(day =>
            day.shifts?.map(shift => ({ ...shift, date: day.date, day: day.day })) || []
        ) || [];

        const monthlyData = monthlyScheduleStore.filteredSchedule?.flatMap(day =>
            day.finalAssignments?.map(assignment => ({
                ...assignment,
                date: day.date,
                day: day.dayName
            })) || []
        ) || [];

        return useMonthlySystem ? monthlyData : weeklyData;
    });

    // Toggle between systems for demonstration
    function toggleSystem() {
        useMonthlySystem = !useMonthlySystem;
        performanceMonitorMethods?.trackFeatureUsage('system-toggle');
        performanceMonitorMethods?.trackUserFlow('toggle-system', {
            from: useMonthlySystem ? 'weekly' : 'monthly',
            to: useMonthlySystem ? 'monthly' : 'weekly'
        });
    }

    function openHelp() {
        showHelp = true;
        performanceMonitorMethods?.trackFeatureUsage('help-system');
    }

    function closeHelp() {
        showHelp = false;
    }

    function openPerformanceMonitor() {
        showPerformanceMonitor = true;
        performanceMonitorMethods?.trackFeatureUsage('performance-monitor');
    }

    function openKeyboardShortcuts() {
        showKeyboardShortcuts = true;
        performanceMonitorMethods?.trackFeatureUsage('keyboard-shortcuts');
    }

    function toggleAdvancedSearch() {
        showAdvancedSearch = !showAdvancedSearch;
        performanceMonitorMethods?.trackFeatureUsage('advanced-search');
    }

    // Handle keyboard shortcuts
    function handleShortcut(event) {
        const { action } = event.detail;

        switch (action) {
            case 'openHelp':
                openHelp();
                break;
            case 'closeModal':
                showHelp = false;
                showPerformanceMonitor = false;
                showKeyboardShortcuts = false;
                showAdvancedSearch = false;
                break;
            case 'toggleSystem':
                toggleSystem();
                break;
            case 'weeklyView':
                if (useMonthlySystem) {
                    monthlyScheduleStore.setViewMode('weekly');
                } else {
                    scheduleStore.setViewMode('weekly');
                }
                break;
            case 'monthlyView':
                if (useMonthlySystem) {
                    monthlyScheduleStore.setViewMode('monthly');
                } else {
                    useMonthlySystem = true;
                    monthlyScheduleStore.setViewMode('monthly');
                }
                break;
            case 'dailyView':
                scheduleStore.setViewMode('daily');
                break;
            case 'staffView':
                scheduleStore.setViewMode('staff');
                break;
            case 'focusSearch':
                toggleAdvancedSearch();
                break;
            default:
                // Forward to other components
                break;
        }

        performanceMonitorMethods?.trackUserFlow('keyboard-shortcut', { action });
    }

    // Handle search selection
    function handleSearchSelect(event) {
        const { item } = event.detail;
        performanceMonitorMethods?.trackFeatureUsage('search-select');
        performanceMonitorMethods?.trackUserFlow('search-select', {
            staff: item.staff,
            role: item.role
        });

        // Navigate to the selected item's context
        // Implementation depends on your navigation system
        console.log('Selected search result:', item);
    }
</script>

<div class="app-container">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Advanced Search -->
    {#if showAdvancedSearch}
        <div class="advanced-search-container">
            <AdvancedSearch
                data={searchData}
                placeholder="Search schedules, staff, departments..."
                on:select={handleSearchSelect}
                on:search={(e) => performanceMonitorMethods?.trackFeatureUsage('search')}
            />
        </div>
    {/if}

    <!-- Action Buttons -->
    <div class="action-buttons">
        <ContextualTooltip content="Advanced search (/)">
            <button
                class="action-button search-button touch-target"
                class:active={showAdvancedSearch}
                onclick={toggleAdvancedSearch}
                aria-label="Toggle advanced search"
                title="Search (/)"
            >
                🔍
            </button>
        </ContextualTooltip>

        <ContextualTooltip content="Keyboard shortcuts (h)">
            <button
                class="action-button shortcuts-button touch-target"
                onclick={openKeyboardShortcuts}
                aria-label="Show keyboard shortcuts"
                title="Shortcuts (h)"
            >
                ⌨️
            </button>
        </ContextualTooltip>

        {#if userPreferencesStore.developerMode}
            <ContextualTooltip content="Performance monitor">
                <button
                    class="action-button performance-button touch-target"
                    onclick={openPerformanceMonitor}
                    aria-label="Open performance monitor"
                    title="Performance"
                >
                    📊
                </button>
            </ContextualTooltip>
        {/if}

        <ContextualTooltip content="Open help and guided tour (F1)">
            <button
                class="action-button help-button touch-target"
                onclick={openHelp}
                aria-label="Open help and guided tour"
                title="Help (F1)"
            >
                ❓
            </button>
        </ContextualTooltip>


    </div>

    <Header />

    <!-- Navigation breadcrumb for better information architecture -->
    <nav class="breadcrumb-nav" aria-label="Navigation breadcrumb">
        <ol class="breadcrumb">
            <li><a href="/" class="breadcrumb-link">Home</a></li>
            <li aria-current="page" class="breadcrumb-current">
                {useMonthlySystem ? 'Monthly Schedule' : 'Weekly Schedule'}
            </li>
        </ol>
    </nav>

    <main id="main-content" aria-label="Museum staffing schedule application">
        {#if useMonthlySystem}
            <!-- Monthly Scheduling System -->
            <div class="system-header">
                <div class="system-info">
                    <h2 class="text-high-contrast">June 2025 - Monthly Scheduling System</h2>
                    <p class="system-description text-medium-contrast">
                        Comprehensive monthly view with coverage analysis and optimization tools
                    </p>
                </div>
                <button
                    class="system-toggle touch-target"
                    onclick={toggleSystem}
                    aria-describedby="toggle-description"
                >
                    Switch to Weekly View
                </button>
                <div id="toggle-description" class="sr-only">
                    Switch from monthly calendar view to weekly detailed schedule view
                </div>
            </div>

            <MonthlyControlPanel />

            {#if monthlyViewMode === 'monthly'}
                <MonthlyCalendarView />
            {:else if monthlyViewMode === 'weekly'}
                <ScheduleGrid />
                <Legend />
            {/if}
        {:else}
            <!-- Original Weekly System -->
            <div class="system-header">
                <div class="system-info">
                    <h2 class="text-high-contrast">Weekly Schedule View</h2>
                    <p class="system-description text-medium-contrast">
                        Detailed weekly schedule with staff assignments and shift management
                    </p>
                </div>
                <button
                    class="system-toggle touch-target"
                    onclick={toggleSystem}
                    aria-describedby="toggle-description-weekly"
                >
                    Switch to Monthly System
                </button>
                <div id="toggle-description-weekly" class="sr-only">
                    Switch from weekly detailed view to monthly calendar overview
                </div>
            </div>

            <ControlPanel />
            <ScheduleGrid />

            {#if weeklyViewMode === 'weekly'}
                <Legend />
            {/if}
        {/if}
    </main>
</div>

<!-- Advanced Components -->
<KeyboardShortcuts
    bind:showHelp={showKeyboardShortcuts}
    on:shortcut={handleShortcut}
/>

<PerformanceMonitor
    bind:isOpen={showPerformanceMonitor}
    on:methods={(e) => performanceMonitorMethods = e.detail}
/>

<HelpSystem
    bind:isOpen={showHelp}
    on:close={closeHelp}
/>

<!-- Enhanced Day Detail Panel Integration -->
<EnhancedDayDetailPanel />

<style>
    .app-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 10px;
    }
    
    .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 12px 16px;
        text-decoration: none;
        border-radius: 8px;
        z-index: 1000;
        transition: top 0.3s;
        font-weight: 600;
        min-height: 44px;
        display: flex;
        align-items: center;
    }

    .skip-link:focus {
        top: 6px;
    }

    /* Screen reader only utility */
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

    /* Breadcrumb navigation */
    .breadcrumb-nav {
        margin: 20px 0 10px 0;
        padding: 0 20px;
    }

    .breadcrumb {
        list-style: none;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
    }

    .breadcrumb li:not(:last-child)::after {
        content: '›';
        margin-left: 8px;
        color: rgba(255, 255, 255, 0.5);
    }

    .breadcrumb-link {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }

    .breadcrumb-link:hover,
    .breadcrumb-link:focus {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
        text-decoration: underline;
    }

    .breadcrumb-current {
        color: #ffffff;
        font-weight: 500;
    }

    /* Advanced search container */
    .advanced-search-container {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        width: 90%;
        max-width: 600px;
    }

    /* Action buttons */
    .action-buttons {
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        gap: 8px;
        z-index: 999;
    }

    .action-button {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .action-button:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    .action-button:active {
        transform: translateY(0);
    }

    .action-button.active {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.6);
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
    }

    /* Specific button styles */
    .search-button.active {
        background: rgba(33, 150, 243, 0.3);
        border-color: rgba(33, 150, 243, 0.6);
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
    }

    .performance-button {
        background: rgba(76, 175, 80, 0.2);
        border-color: rgba(76, 175, 80, 0.4);
    }

    .performance-button:hover {
        background: rgba(76, 175, 80, 0.3);
        border-color: rgba(76, 175, 80, 0.6);
    }

    .system-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin: 20px 0;
        padding: 20px 24px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        gap: 20px;
    }

    .system-info {
        flex: 1;
    }

    .system-header h2 {
        margin: 0 0 8px 0;
        font-size: 1.4rem;
        font-weight: 600;
    }

    .system-description {
        font-size: 0.95rem;
        margin: 0;
        line-height: 1.4;
    }

    .system-toggle {
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: rgba(255, 255, 255, 0.95);
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 500;
        transition: all 0.2s ease;
        flex-shrink: 0;
    }

    .system-toggle:hover {
        background: rgba(255, 255, 255, 0.18);
        border-color: rgba(255, 255, 255, 0.5);
        color: white;
        transform: translateY(-1px);
    }

    .system-toggle:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        .app-container {
            padding: 0 5px;
        }

        .breadcrumb-nav {
            padding: 0 10px;
        }

        .system-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
            padding: 16px 20px;
        }

        .system-toggle {
            width: 100%;
            justify-content: center;
        }
    }

    @media (max-width: 480px) {
        .breadcrumb {
            font-size: 0.8rem;
        }

        .system-header {
            padding: 14px 16px;
        }

        .system-header h2 {
            font-size: 1.2rem;
        }

        .system-description {
            font-size: 0.9rem;
        }

        .action-buttons {
            top: 16px;
            right: 16px;
            gap: 6px;
        }

        .action-button {
            width: 44px;
            height: 44px;
            font-size: 1.1rem;
        }

        .advanced-search-container {
            top: 70px;
            width: 95%;
        }
    }
</style>
