<script>
    import { monthlyScheduleStore } from '../stores/monthlyScheduleStore.svelte.js';
    import { staffCapabilities, criticalRequirements, eventTypes } from '../data/monthlyScheduleData.js';
    
    const {
        viewMode,
        departmentFilter,
        coverageFilter,
        eventFilter,
        showCoverageIndicators,
        showConflictWarnings,
        showPatterns,
        showHours,
        compactView,
        staffColors,
        monthlyStats,
        coverageAnalysis,
        setViewMode,
        toggleDepartmentFilter,
        toggleCoverageFilter,
        toggleEventFilter,
        clearFilters,
        toggleCoverageIndicators,
        toggleConflictWarnings,
        togglePatterns,
        toggleHours,
        toggleCompactView,
        updateStaffColor,
        resetColors
    } = monthlyScheduleStore;
    
    const departments = ['animal-care', 'front-desk', 'lab', 'trainee', 'volunteer'];
    const coverageStatuses = ['green', 'yellow', 'red'];
    const eventTypeKeys = Object.keys(eventTypes);
    const staffKeys = Object.keys(staffCapabilities);
    
    function getStaffTierColor(tier) {
        switch (tier) {
            case 'senior': return '#FFD700';
            case 'mid': return '#87CEEB';
            case 'entry': return '#98FB98';
            case 'trainee': return '#DDA0DD';
            case 'volunteer': return '#F0E68C';
            default: return '#FFFFFF';
        }
    }
</script>

<div class="monthly-control-panel">
    <div class="control-header">
        <h2>Monthly Schedule Controls</h2>
        <div class="view-mode-selector">
            <button 
                class="view-btn"
                class:active={viewMode === 'monthly'}
                onclick={() => setViewMode('monthly')}
            >
                Monthly
            </button>
            <button 
                class="view-btn"
                class:active={viewMode === 'weekly'}
                onclick={() => setViewMode('weekly')}
            >
                Weekly
            </button>
            <button 
                class="view-btn"
                class:active={viewMode === 'daily'}
                onclick={() => setViewMode('daily')}
            >
                Daily
            </button>
        </div>
    </div>
    
    <div class="control-sections">
        <!-- Monthly Statistics -->
        <div class="control-group">
            <h3>Monthly Overview</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">{monthlyStats?.totalDays || 0}</div>
                    <div class="stat-label">Total Days</div>
                </div>
                <div class="stat-item coverage-green">
                    <div class="stat-value">{monthlyStats?.greenDays || 0}</div>
                    <div class="stat-label">Fully Covered</div>
                </div>
                <div class="stat-item coverage-yellow">
                    <div class="stat-value">{monthlyStats?.yellowDays || 0}</div>
                    <div class="stat-label">Partial Coverage</div>
                </div>
                <div class="stat-item coverage-red">
                    <div class="stat-value">{monthlyStats?.redDays || 0}</div>
                    <div class="stat-label">Critical Gaps</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{monthlyStats?.totalEvents || 0}</div>
                    <div class="stat-label">Total Events</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{monthlyStats?.totalStaffHours?.toFixed(1) || '0.0'}</div>
                    <div class="stat-label">Staff Hours</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${monthlyStats?.totalCost?.toLocaleString() || '0'}</div>
                    <div class="stat-label">Total Cost</div>
                </div>
            </div>
        </div>
        
        <!-- Coverage Analysis -->
        {#if coverageAnalysis?.criticalGaps?.length > 0 || coverageAnalysis?.conflictWarnings?.length > 0}
            <div class="control-group">
                <h3>Coverage Issues</h3>
                
                {#if coverageAnalysis?.criticalGaps?.length > 0}
                    <div class="issue-section">
                        <h4>Critical Gaps ({coverageAnalysis.criticalGaps.length})</h4>
                        {#each coverageAnalysis.criticalGaps.slice(0, 3) as gap}
                            <div class="issue-item critical">
                                <div class="issue-date">{gap.dayOfWeek}, {gap.date}</div>
                                <div class="issue-description">{gap.requirement}</div>
                            </div>
                        {/each}
                        {#if coverageAnalysis.criticalGaps.length > 3}
                            <div class="more-issues">+{coverageAnalysis.criticalGaps.length - 3} more gaps</div>
                        {/if}
                    </div>
                {/if}
                
                {#if coverageAnalysis?.conflictWarnings?.length > 0}
                    <div class="issue-section">
                        <h4>Conflicts ({coverageAnalysis.conflictWarnings.length})</h4>
                        {#each coverageAnalysis.conflictWarnings.slice(0, 3) as conflict}
                            <div class="issue-item warning">
                                <div class="issue-date">{conflict.dayOfWeek}, {conflict.date}</div>
                                <div class="issue-description">{conflict.staff}: {conflict.conflict}</div>
                            </div>
                        {/each}
                        {#if coverageAnalysis.conflictWarnings.length > 3}
                            <div class="more-issues">+{coverageAnalysis.conflictWarnings.length - 3} more conflicts</div>
                        {/if}
                    </div>
                {/if}
            </div>
        {/if}
        
        <!-- Filters -->
        <div class="control-group">
            <h3>Filters</h3>
            
            <!-- Coverage Status Filter -->
            <div class="filter-section">
                <h4>Coverage Status</h4>
                <div class="filter-chips">
                    {#each coverageStatuses as status}
                        <button 
                            class="filter-chip coverage-{status}"
                            class:active={coverageFilter.has(status)}
                            onclick={() => toggleCoverageFilter(status)}
                            aria-pressed={coverageFilter.has(status)}
                        >
                            {#if status === 'green'}✓ Fully Covered
                            {:else if status === 'yellow'}⚠ Partial
                            {:else}❌ Critical{/if}
                        </button>
                    {/each}
                </div>
            </div>
            
            <!-- Department Filter -->
            <div class="filter-section">
                <h4>Departments</h4>
                <div class="filter-chips">
                    {#each departments as dept}
                        <button 
                            class="filter-chip department-chip"
                            class:active={departmentFilter.has(dept)}
                            onclick={() => toggleDepartmentFilter(dept)}
                            aria-pressed={departmentFilter.has(dept)}
                        >
                            {dept.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                    {/each}
                </div>
            </div>
            
            <!-- Event Type Filter -->
            <div class="filter-section">
                <h4>Event Types</h4>
                <div class="filter-chips">
                    <button 
                        class="filter-chip"
                        class:active={eventFilter.has('no-events')}
                        onclick={() => toggleEventFilter('no-events')}
                    >
                        No Events
                    </button>
                    {#each eventTypeKeys as eventType}
                        <button 
                            class="filter-chip"
                            class:active={eventFilter.has(eventType)}
                            onclick={() => toggleEventFilter(eventType)}
                        >
                            {eventTypes[eventType].name}
                        </button>
                    {/each}
                </div>
            </div>
            
            <button class="clear-filters-btn" onclick={clearFilters}>
                Clear All Filters
            </button>
        </div>
        
        <!-- Staff Colors -->
        <div class="control-group">
            <h3>Staff Colors</h3>
            <div class="color-picker-grid">
                {#each staffKeys as staff}
                    <div class="color-picker-item">
                        <label for="staff-{staff}">
                            <span class="staff-name">{staff}</span>
                            <span 
                                class="staff-tier-badge" 
                                style="background-color: {getStaffTierColor(staffCapabilities[staff].tier)}"
                            >
                                {staffCapabilities[staff].tier}
                            </span>
                        </label>
                        <input 
                            type="color" 
                            id="staff-{staff}"
                            value={staffColors[staff]}
                            onchange={(e) => updateStaffColor(staff, e.target.value)}
                            aria-label="Color for {staff}"
                        />
                    </div>
                {/each}
            </div>
            <button class="reset-colors-btn" onclick={resetColors}>
                Reset Colors
            </button>
        </div>
        
        <!-- Display Options -->
        <div class="control-group">
            <h3>Display Options</h3>
            <div class="toggle-options">
                <label class="toggle-option">
                    <input 
                        type="checkbox" 
                        checked={showCoverageIndicators}
                        onchange={toggleCoverageIndicators}
                    />
                    <span>Show Coverage Indicators</span>
                </label>
                
                <label class="toggle-option">
                    <input 
                        type="checkbox" 
                        checked={showConflictWarnings}
                        onchange={toggleConflictWarnings}
                    />
                    <span>Show Conflict Warnings</span>
                </label>
                
                <label class="toggle-option">
                    <input 
                        type="checkbox" 
                        checked={showPatterns}
                        onchange={togglePatterns}
                    />
                    <span>Show Department Patterns</span>
                </label>
                
                <label class="toggle-option">
                    <input 
                        type="checkbox" 
                        checked={showHours}
                        onchange={toggleHours}
                    />
                    <span>Show Hours</span>
                </label>
                
                <label class="toggle-option">
                    <input 
                        type="checkbox" 
                        checked={compactView}
                        onchange={toggleCompactView}
                    />
                    <span>Compact View</span>
                </label>
            </div>
        </div>
    </div>
</div>

<style>
    .monthly-control-panel {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 25px;
        margin: 20px 0;
    }
    
    .control-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .control-header h2 {
        color: white;
        margin: 0;
        font-size: 1.5rem;
    }
    
    .view-mode-selector {
        display: flex;
        gap: 5px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 4px;
    }
    
    .view-btn {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
    }
    
    .view-btn.active {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-weight: 500;
    }
    
    .control-sections {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 25px;
    }
    
    .control-group {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 20px;
    }
    
    .control-group h3 {
        color: white;
        margin: 0 0 15px 0;
        font-size: 1.1rem;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
    }
    
    .stat-item {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .stat-item.coverage-green {
        border-color: #4CAF50;
        background: rgba(76, 175, 80, 0.1);
    }
    
    .stat-item.coverage-yellow {
        border-color: #FFC107;
        background: rgba(255, 193, 7, 0.1);
    }
    
    .stat-item.coverage-red {
        border-color: #F44336;
        background: rgba(244, 67, 54, 0.1);
    }
    
    .stat-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: white;
        margin-bottom: 5px;
    }
    
    .stat-label {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .issue-section {
        margin-bottom: 15px;
    }
    
    .issue-section h4 {
        color: rgba(255, 255, 255, 0.9);
        margin: 0 0 10px 0;
        font-size: 0.95rem;
    }
    
    .issue-item {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 8px 10px;
        margin-bottom: 8px;
        border-left: 3px solid;
    }
    
    .issue-item.critical {
        border-left-color: #F44336;
        background: rgba(244, 67, 54, 0.1);
    }
    
    .issue-item.warning {
        border-left-color: #FFC107;
        background: rgba(255, 193, 7, 0.1);
    }
    
    .issue-date {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 3px;
    }
    
    .issue-description {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.9);
    }
    
    .more-issues {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
        font-style: italic;
        text-align: center;
        padding: 5px;
    }
    
    .filter-section {
        margin-bottom: 15px;
    }
    
    .filter-section h4 {
        color: rgba(255, 255, 255, 0.9);
        margin: 0 0 8px 0;
        font-size: 0.9rem;
    }
    
    .filter-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .filter-chip {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.8);
        padding: 6px 12px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.3s ease;
    }
    
    .filter-chip:hover {
        background: rgba(255, 255, 255, 0.15);
    }
    
    .filter-chip.active {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
        color: white;
        font-weight: 500;
    }
    
    .filter-chip.coverage-green.active {
        background: rgba(76, 175, 80, 0.3);
        border-color: #4CAF50;
        color: #4CAF50;
    }
    
    .filter-chip.coverage-yellow.active {
        background: rgba(255, 255, 255, 0.3);
        border-color: #FFC107;
        color: #FFC107;
    }
    
    .filter-chip.coverage-red.active {
        background: rgba(244, 67, 54, 0.3);
        border-color: #F44336;
        color: #F44336;
    }
    
    .clear-filters-btn, .reset-colors-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: rgba(255, 255, 255, 0.8);
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.85rem;
        margin-top: 10px;
        transition: all 0.3s ease;
    }
    
    .clear-filters-btn:hover, .reset-colors-btn:hover {
        background: rgba(255, 255, 255, 0.15);
    }
    
    .color-picker-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
        margin-bottom: 15px;
    }
    
    .color-picker-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 8px 10px;
    }
    
    .color-picker-item label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.85rem;
        cursor: pointer;
    }
    
    .staff-name {
        font-weight: 500;
    }
    
    .staff-tier-badge {
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 10px;
        color: #000;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .color-picker-item input[type="color"] {
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        background: none;
    }
    
    .toggle-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .toggle-option {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9rem;
        cursor: pointer;
    }
    
    .toggle-option input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: #4CAF50;
    }
    
    @media (max-width: 768px) {
        .control-sections {
            grid-template-columns: 1fr;
        }
        
        .control-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
        }
        
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .color-picker-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
