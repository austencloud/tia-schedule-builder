<script>
    import { scheduleStore } from '../stores/scheduleStore.svelte.js';
    import { departments } from '../data/scheduleData.js';
    import ProgressiveDisclosure from './ProgressiveDisclosure.svelte';
    import ContextualTooltip from './ContextualTooltip.svelte';
    import ConfirmationDialog from './ConfirmationDialog.svelte';

    const {
        staffColors,
        viewMode,
        showPatterns,
        showHours,
        compactView,
        departmentFilter,
        staffTypeFilter,
        updateStaffColor,
        resetColors,
        setViewMode,
        toggleDepartmentFilter,
        toggleStaffTypeFilter,
        clearFilters,
        togglePatterns,
        toggleHours,
        toggleCompactView
    } = scheduleStore;

    const staffMembers = Object.keys(staffColors);
    const departmentKeys = Object.keys(departments);
    const staffTypes = ['paid', 'trainee', 'volunteer'];
    const viewModes = [
        { value: 'weekly', label: 'Weekly View', description: 'See all staff assignments for the week' },
        { value: 'daily', label: 'Daily View', description: 'Detailed breakdown of a single day' },
        { value: 'staff', label: 'Staff View', description: 'Individual staff member schedules' }
    ];

    // Progressive disclosure state
    let viewOptionsExpanded = $state(true);
    let filtersExpanded = $state(false);
    let customizationExpanded = $state(false);
    let advancedExpanded = $state(false);

    // Confirmation dialog state
    let showResetConfirmation = $state(false);
    let showClearFiltersConfirmation = $state(false);

    // Computed values for better UX
    const activeFiltersCount = $derived(
        departmentFilter.size + staffTypeFilter.size
    );

    const hasCustomColors = $derived(
        Object.values(staffColors).some((color, index) => {
            const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
            return color !== defaultColors[index];
        })
    );

    function handleViewModeChange(mode) {
        setViewMode(mode);
    }

    function handleResetColors() {
        showResetConfirmation = true;
    }

    function confirmResetColors() {
        resetColors();
        showResetConfirmation = false;
    }

    function handleClearFilters() {
        if (activeFiltersCount > 0) {
            showClearFiltersConfirmation = true;
        }
    }

    function confirmClearFilters() {
        clearFilters();
        showClearFiltersConfirmation = false;
    }
</script>

<section class="glass controls-panel" aria-label="Schedule controls and customization">
    <h2 class="sr-only">Control Panel</h2>
    <div class="controls-grid">
        <!-- View Controls with Progressive Disclosure -->
        <ProgressiveDisclosure
            bind:isExpanded={viewOptionsExpanded}
            title="View Options"
            subtitle="Choose how to display your schedule"
            icon="👁️"
            level="primary"
            defaultExpanded={true}
        >
            <div class="view-controls">
                <fieldset class="radio-group">
                    <legend class="sr-only">Select view mode</legend>
                    {#each viewModes as mode}
                        <ContextualTooltip
                            content={mode.description}
                            position="top"
                            delay={300}
                        >
                            <label class="radio-item">
                                <input
                                    type="radio"
                                    name="view-mode"
                                    checked={viewMode === mode.value}
                                    value={mode.value}
                                    onchange={() => handleViewModeChange(mode.value)}
                                    aria-describedby="view-mode-description"
                                />
                                <span>{mode.label}</span>
                            </label>
                        </ContextualTooltip>
                    {/each}
                </fieldset>
                <div id="view-mode-description" class="sr-only">
                    Choose how to display the schedule: weekly grid, daily details, or staff summary
                </div>
                
                <fieldset class="toggle-controls">
                    <legend class="sr-only">Display options</legend>
                    <label class="toggle-item">
                        <input 
                            type="checkbox" 
                            checked={showPatterns}
                            onchange={togglePatterns}
                            aria-describedby="patterns-description"
                        />
                        <span>Show Patterns</span>
                    </label>
                    <div id="patterns-description" class="sr-only">
                        Display visual patterns for better accessibility and department identification
                    </div>
                    
                    <label class="toggle-item">
                        <input 
                            type="checkbox" 
                            checked={showHours}
                            onchange={toggleHours}
                            aria-describedby="hours-description"
                        />
                        <span>Show Hours</span>
                    </label>
                    <div id="hours-description" class="sr-only">
                        Display hour information on shift cards
                    </div>
                    
                    <label class="toggle-item">
                        <input 
                            type="checkbox" 
                            checked={compactView}
                            onchange={toggleCompactView}
                            aria-describedby="compact-description"
                        />
                        <span>Compact View</span>
                    </label>
                    <div id="compact-description" class="sr-only">
                        Use a more condensed layout to fit more information on screen
                    </div>
                </fieldset>
            </div>
        </ProgressiveDisclosure>

        <!-- Filters with Progressive Disclosure -->
        <ProgressiveDisclosure
            bind:isExpanded={filtersExpanded}
            title="Filters"
            subtitle="Focus on specific aspects of your schedule"
            icon="🔍"
            level="primary"
            showCount={true}
            count={activeFiltersCount}
        >
            <!-- Department Filters -->
            <div class="filter-section">
                <h4 class="filter-title text-medium-contrast">Departments</h4>
                <div class="filter-chips" role="group" aria-label="Department filters">
                    {#each departmentKeys as dept}
                        <ContextualTooltip
                            content="Filter to show only {departments[dept].name} staff and shifts"
                            position="top"
                        >
                            <button
                                class="filter-chip touch-target"
                                class:active={departmentFilter.has(dept)}
                                onclick={() => toggleDepartmentFilter(dept)}
                                aria-pressed={departmentFilter.has(dept)}
                                aria-describedby="dept-filter-{dept}"
                            >
                                {departments[dept].name}
                            </button>
                        </ContextualTooltip>
                        <div id="dept-filter-{dept}" class="sr-only">
                            {departmentFilter.has(dept) ? 'Remove' : 'Add'} {departments[dept].name} filter
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Staff Type Filters -->
            <div class="filter-section">
                <h4 class="filter-title text-medium-contrast">Staff Types</h4>
                <div class="filter-chips" role="group" aria-label="Staff type filters">
                    {#each staffTypes as type}
                        <ContextualTooltip
                            content="Filter to show only {type} staff members"
                            position="top"
                        >
                            <button
                                class="filter-chip touch-target"
                                class:active={staffTypeFilter.has(type)}
                                onclick={() => toggleStaffTypeFilter(type)}
                                aria-pressed={staffTypeFilter.has(type)}
                                aria-describedby="type-filter-{type}"
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        </ContextualTooltip>
                        <div id="type-filter-{type}" class="sr-only">
                            {staffTypeFilter.has(type) ? 'Remove' : 'Add'} {type} staff filter
                        </div>
                    {/each}
                </div>
            </div>

            {#if activeFiltersCount > 0}
                <div class="filter-actions">
                    <button
                        class="clear-filters-btn touch-target"
                        onclick={handleClearFilters}
                        aria-describedby="clear-filters-description"
                    >
                        Clear All Filters ({activeFiltersCount})
                    </button>
                    <div id="clear-filters-description" class="sr-only">
                        Remove all active filters and show the complete schedule
                    </div>
                </div>
            {/if}
        </ProgressiveDisclosure>

        <!-- Staff Colors with Progressive Disclosure -->
        <ProgressiveDisclosure
            bind:isExpanded={customizationExpanded}
            title="Staff Colors"
            subtitle="Customize colors for better identification"
            icon="🎨"
            level="secondary"
        >
            <div class="color-picker-grid" role="group" aria-label="Staff member color customization">
                {#each staffMembers as staff}
                    <div class="color-picker-item">
                        <ContextualTooltip
                            content="Choose a color for {staff}'s shifts. Current: {staffColors[staff]}"
                            position="top"
                        >
                            <label for="color-{staff}">{staff}</label>
                            <input
                                type="color"
                                id="color-{staff}"
                                value={staffColors[staff]}
                                onchange={(e) => updateStaffColor(staff, e.target.value)}
                                aria-label="Color for {staff}"
                                aria-describedby="color-help-{staff}"
                            />
                        </ContextualTooltip>
                        <span id="color-help-{staff}" class="sr-only">
                            Current color: {staffColors[staff]}. Choose a new color for {staff}'s shifts.
                        </span>
                    </div>
                {/each}
            </div>

            {#if hasCustomColors}
                <div class="color-actions">
                    <button
                        class="reset-btn touch-target"
                        onclick={handleResetColors}
                        aria-describedby="reset-colors-description"
                    >
                        Reset to Default Colors
                    </button>
                    <div id="reset-colors-description" class="sr-only">
                        Reset all staff colors to their default values
                    </div>
                </div>
            {/if}
        </ProgressiveDisclosure>
        
        <!-- Department Patterns with Progressive Disclosure -->
        <ProgressiveDisclosure
            bind:isExpanded={advancedExpanded}
            title="Department Indicators"
            subtitle="Visual patterns for accessibility"
            icon="📋"
            level="tertiary"
        >
            <p class="control-description text-medium-contrast">
                Departments are indicated by text labels and visual patterns, not colors.
            </p>
            <div class="pattern-preview-grid" role="group" aria-label="Department pattern indicators">
                {#each departmentKeys as dept}
                    <ContextualTooltip
                        content={departments[dept].description}
                        position="top"
                    >
                        <div class="pattern-preview-item">
                            <div class="pattern-sample {departments[dept].pattern}">
                                <span class="pattern-label">{departments[dept].name}</span>
                            </div>
                            <span class="pattern-description text-low-contrast">
                                {departments[dept].description}
                            </span>
                        </div>
                    </ContextualTooltip>
                {/each}
            </div>
        </ProgressiveDisclosure>
    </div>
</section>

<!-- Confirmation Dialogs -->
<ConfirmationDialog
    bind:isOpen={showResetConfirmation}
    title="Reset Staff Colors"
    message="Are you sure you want to reset all staff colors to their default values?"
    confirmText="Reset Colors"
    cancelText="Keep Current Colors"
    type="warning"
    consequences={[
        "All custom staff colors will be lost",
        "Colors will return to the default palette",
        "This action cannot be undone"
    ]}
    on:confirm={confirmResetColors}
    on:cancel={() => showResetConfirmation = false}
/>

<ConfirmationDialog
    bind:isOpen={showClearFiltersConfirmation}
    title="Clear All Filters"
    message="Are you sure you want to remove all active filters?"
    confirmText="Clear Filters"
    cancelText="Keep Filters"
    type="info"
    details="This will show all departments, staff types, and schedule items."
    on:confirm={confirmClearFilters}
    on:cancel={() => showClearFiltersConfirmation = false}
/>

<style>
    .controls-panel {
        padding: 25px;
        margin-bottom: 30px;
    }

    /* Progressive disclosure specific styles */
    .filter-section {
        margin-bottom: 20px;
    }

    .filter-title {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 12px;
    }

    .filter-actions {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .clear-filters-btn {
        background: rgba(255, 152, 0, 0.2);
        border: 1px solid rgba(255, 152, 0, 0.4);
        color: rgba(255, 255, 255, 0.9);
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
    }

    .clear-filters-btn:hover {
        background: rgba(255, 152, 0, 0.3);
        border-color: rgba(255, 152, 0, 0.6);
        color: white;
    }

    .color-actions {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .control-description {
        font-size: 0.9rem;
        line-height: 1.4;
        margin-bottom: 16px;
    }
    
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
    
    .controls-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 25px;
    }
    
    .control-group {
        background: rgba(255, 255, 255, 0.05);
        padding: 20px;
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .control-group h3 {
        color: white;
        margin-bottom: 15px;
        font-size: 1.1rem;
        font-weight: 500;
    }
    
    .control-group h4 {
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 10px;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .view-controls {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .radio-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .radio-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    .radio-item input[type="radio"] {
        accent-color: #667eea;
    }
    
    .toggle-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .toggle-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    .toggle-item input[type="checkbox"] {
        accent-color: #667eea;
    }
    
    .color-picker-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 10px;
        margin-bottom: 15px;
    }
    
    .color-picker-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
    }
    
    .color-picker-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .color-picker-item label {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.85rem;
        cursor: pointer;
        flex: 1;
    }
    
    .color-picker-item input[type="color"] {
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }
    
    .reset-btn, .clear-filters-btn {
        width: 100%;
        padding: 10px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: white;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .reset-btn:hover, .clear-filters-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .filter-section {
        margin-bottom: 15px;
    }
    
    .filter-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .filter-chip {
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .filter-chip:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .filter-chip.active {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
        color: white;
        font-weight: 500;
    }

    /* Pattern preview styles */
    .pattern-preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
    }

    .pattern-preview-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .pattern-sample {
        padding: 8px 12px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        position: relative;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .pattern-label {
        font-size: 0.8rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: relative;
        z-index: 1;
    }

    .pattern-description {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.6);
        text-align: center;
    }

    /* Pattern backgrounds for previews */
    .pattern-sample.pattern-dots::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
        background-size: 4px 4px;
        border-radius: 8px;
        pointer-events: none;
    }

    .pattern-sample.pattern-stripes::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.2) 0px, rgba(255, 255, 255, 0.2) 1px, transparent 1px, transparent 3px);
        border-radius: 8px;
        pointer-events: none;
    }

    .pattern-sample.pattern-waves::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0px, rgba(255, 255, 255, 0.2) 1px, transparent 1px, transparent 3px);
        border-radius: 8px;
        pointer-events: none;
    }

    .pattern-sample.pattern-grid::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
        background-size: 4px 4px;
        border-radius: 8px;
        pointer-events: none;
    }

    .pattern-sample.pattern-solid {
        border: 2px solid rgba(255, 255, 255, 0.4);
        font-weight: 600;
    }

    /* Department filter chip patterns */
    .department-chip {
        position: relative;
    }

    .department-chip.pattern-dots::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
        background-size: 3px 3px;
        border-radius: 20px;
        pointer-events: none;
    }

    .department-chip.pattern-stripes::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 0px, rgba(255, 255, 255, 0.15) 1px, transparent 1px, transparent 2px);
        border-radius: 20px;
        pointer-events: none;
    }

    .department-chip.pattern-waves::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.15) 0px, rgba(255, 255, 255, 0.15) 1px, transparent 1px, transparent 2px);
        border-radius: 20px;
        pointer-events: none;
    }

    .department-chip.pattern-grid::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px);
        background-size: 3px 3px;
        border-radius: 20px;
        pointer-events: none;
    }

    .department-chip.pattern-solid {
        border: 2px solid rgba(255, 255, 255, 0.3);
        font-weight: 600;
    }
    
    @media (max-width: 768px) {
        .controls-grid {
            grid-template-columns: 1fr;
        }
        
        .color-picker-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        }
    }
</style>
