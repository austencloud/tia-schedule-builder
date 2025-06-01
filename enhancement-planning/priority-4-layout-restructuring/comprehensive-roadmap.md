# Priority 4: Interface Layout Restructuring - Comprehensive Roadmap

## Executive Summary

This roadmap transforms TIA Schedule Builder from a vertical stacking layout to an efficient side-by-side design (Schedule 70% | Tools 30%) with consolidated settings management. The implementation prioritizes mobile-first responsive design while maintaining all existing functionality and improving user productivity.

## Implementation Phases

### Phase 1: Layout Architecture Design (Days 1-2)

#### Step 1.1: CSS Grid Foundation Setup

**Duration**: 6 hours
**Risk Level**: 🟢 LOW

**Implementation Strategy**:

```css
/* New main layout grid system */
.app-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "content sidebar";
  grid-template-columns: 1fr 400px; /* 70% content, 30% sidebar */
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  gap: 20px;
  padding: 20px;
}

.app-header {
  grid-area: header;
}

.app-content {
  grid-area: content;
  min-width: 0; /* Prevent grid overflow */
}

.app-sidebar {
  grid-area: sidebar;
  background: var(--glass-background);
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

/* Mobile-first responsive design */
@media (max-width: 1024px) {
  .app-layout {
    grid-template-areas:
      "header"
      "content";
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .app-sidebar {
    position: fixed;
    top: 0;
    right: -100%;
    width: 90%;
    height: 100vh;
    z-index: 1000;
    transition: right 0.3s ease;
  }

  .app-sidebar.open {
    right: 0;
  }
}
```

**Success Criteria**:

- [ ] CSS Grid layout foundation established
- [ ] Responsive breakpoints defined
- [ ] Mobile-first approach implemented
- [ ] Sticky sidebar behavior working
- [ ] No visual regressions in existing components

#### Step 1.2: Layout State Management

**Duration**: 4 hours
**Risk Level**: 🟢 LOW

**New File**: `src/lib/stores/layoutStore.svelte.js`

```javascript
export const layoutStore = (() => {
  let sidebarOpen = $state(false);
  let layoutMode = $state("desktop"); // 'desktop' | 'tablet' | 'mobile'
  let sidebarCollapsed = $state(false);
  let settingsModalOpen = $state(false);

  // Responsive breakpoint detection
  let screenWidth = $state(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  $effect(() => {
    if (typeof window !== "undefined") {
      const updateScreenWidth = () => {
        screenWidth = window.innerWidth;
        layoutMode = getLayoutMode(screenWidth);
      };

      window.addEventListener("resize", updateScreenWidth);
      updateScreenWidth();

      return () => window.removeEventListener("resize", updateScreenWidth);
    }
  });

  function getLayoutMode(width) {
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  return {
    get sidebarOpen() {
      return sidebarOpen;
    },
    get layoutMode() {
      return layoutMode;
    },
    get sidebarCollapsed() {
      return sidebarCollapsed;
    },
    get settingsModalOpen() {
      return settingsModalOpen;
    },
    get screenWidth() {
      return screenWidth;
    },

    toggleSidebar() {
      sidebarOpen = !sidebarOpen;
    },

    closeSidebar() {
      sidebarOpen = false;
    },

    toggleSidebarCollapse() {
      sidebarCollapsed = !sidebarCollapsed;
    },

    openSettingsModal() {
      settingsModalOpen = true;
    },

    closeSettingsModal() {
      settingsModalOpen = false;
    },

    // Auto-close sidebar on mobile when clicking outside
    handleOutsideClick(event) {
      if (layoutMode === "mobile" && sidebarOpen) {
        const sidebar = document.querySelector(".app-sidebar");
        if (sidebar && !sidebar.contains(event.target)) {
          this.closeSidebar();
        }
      }
    },
  };
})();
```

**Success Criteria**:

- [ ] Layout state management implemented
- [ ] Responsive breakpoint detection working
- [ ] Sidebar toggle functionality
- [ ] Mobile overlay behavior
- [ ] Outside click detection for mobile

### Phase 2: Unified Settings Modal (Days 3-4)

#### Step 2.1: Settings Modal Component

**Duration**: 10 hours
**Risk Level**: 🟡 MEDIUM

**New File**: `src/lib/components/layout/UnifiedSettingsModal.svelte`

```svelte
<script>
    import { layoutStore } from '../../stores/layoutStore.svelte.js';
    import { scheduleStore } from '../../stores/scheduleStore.svelte.js';
    import { monthlyScheduleStore } from '../../stores/monthlyScheduleStore.svelte.js';

    const { settingsModalOpen } = layoutStore;
    const {
        viewMode,
        compactView,
        departmentFilter,
        staffTypeFilter,
        timeFilter
    } = scheduleStore;

    let activeTab = $state('view-display');

    const settingsTabs = [
        { id: 'view-display', label: 'View & Display', icon: '📅' },
        { id: 'filters-search', label: 'Filters & Search', icon: '🔍' },
        { id: 'appearance', label: 'Appearance', icon: '🎨' },
        { id: 'coverage-legend', label: 'Coverage Legend', icon: '📊' },
        { id: 'quick-actions', label: 'Quick Actions', icon: '⚡' }
    ];

    function closeModal() {
        layoutStore.closeSettingsModal();
    }

    function handleTabChange(tabId) {
        activeTab = tabId;
    }

    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
</script>

{#if settingsModalOpen}
    <div
        class="settings-modal-overlay"
        onclick={closeModal}
        onkeydown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
    >
        <div class="settings-modal" onclick={(e) => e.stopPropagation()}>
            <header class="settings-header">
                <h2 id="settings-modal-title">
                    <span class="settings-icon">⚙️</span>
                    Schedule Settings
                </h2>
                <button
                    class="close-btn touch-target"
                    onclick={closeModal}
                    aria-label="Close settings"
                >
                    ✕
                </button>
            </header>

            <div class="settings-content">
                <nav class="settings-tabs" aria-label="Settings categories">
                    <ul class="tab-list" role="tablist">
                        {#each settingsTabs as tab}
                            <li role="presentation">
                                <button
                                    class="tab-button touch-target"
                                    class:active={activeTab === tab.id}
                                    onclick={() => handleTabChange(tab.id)}
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    aria-controls="{tab.id}-panel"
                                >
                                    <span class="tab-icon">{tab.icon}</span>
                                    <span class="tab-label">{tab.label}</span>
                                </button>
                            </li>
                        {/each}
                    </ul>
                </nav>

                <div class="settings-panels">
                    {#if activeTab === 'view-display'}
                        <div id="view-display-panel" role="tabpanel" aria-labelledby="view-display-tab">
                            <!-- View & Display Settings -->
                            <div class="setting-group">
                                <h3>View Mode</h3>
                                <div class="radio-group">
                                    <label class="radio-item">
                                        <input
                                            type="radio"
                                            name="view-mode"
                                            value="weekly"
                                            checked={viewMode === 'weekly'}
                                            onchange={() => scheduleStore.setViewMode('weekly')}
                                        />
                                        <span>Weekly View</span>
                                    </label>
                                    <label class="radio-item">
                                        <input
                                            type="radio"
                                            name="view-mode"
                                            value="daily"
                                            checked={viewMode === 'daily'}
                                            onchange={() => scheduleStore.setViewMode('daily')}
                                        />
                                        <span>Daily View</span>
                                    </label>
                                    <label class="radio-item">
                                        <input
                                            type="radio"
                                            name="view-mode"
                                            value="staff"
                                            checked={viewMode === 'staff'}
                                            onchange={() => scheduleStore.setViewMode('staff')}
                                        />
                                        <span>Staff View</span>
                                    </label>
                                </div>
                            </div>

                            <div class="setting-group">
                                <h3>Display Options</h3>
                                <label class="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={compactView}
                                        onchange={(e) => scheduleStore.setCompactView(e.target.checked)}
                                    />
                                    <span>Compact View</span>
                                </label>
                            </div>
                        </div>
                    {/if}

                    {#if activeTab === 'filters-search'}
                        <div id="filters-search-panel" role="tabpanel" aria-labelledby="filters-search-tab">
                            <!-- Filters & Search Settings -->
                            <div class="setting-group">
                                <h3>Department Filters</h3>
                                <div class="filter-options">
                                    {#each ['all', 'exhibits', 'education', 'research', 'admin'] as dept}
                                        <label class="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={departmentFilter === 'all' || departmentFilter === dept}
                                                onchange={(e) => handleDepartmentFilter(dept, e.target.checked)}
                                            />
                                            <span>{dept.charAt(0).toUpperCase() + dept.slice(1)}</span>
                                        </label>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Additional tab panels... -->
                </div>
            </div>

            <footer class="settings-footer">
                <button class="btn-secondary" onclick={closeModal}>
                    Cancel
                </button>
                <button class="btn-primary" onclick={closeModal}>
                    Apply Settings
                </button>
            </footer>
        </div>
    </div>
{/if}

<style>
    .settings-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }

    .settings-modal {
        background: var(--glass-background);
        border: 1px solid var(--border-subtle);
        border-radius: 16px;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .settings-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24px;
        border-bottom: 1px solid var(--border-subtle);
    }

    .settings-content {
        display: grid;
        grid-template-columns: 200px 1fr;
        height: 500px;
    }

    .settings-tabs {
        border-right: 1px solid var(--border-subtle);
        padding: 20px 0;
    }

    .tab-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .tab-button {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .tab-button:hover,
    .tab-button.active {
        background: var(--accent-color-alpha);
    }

    .settings-panels {
        padding: 20px;
        overflow-y: auto;
    }

    .setting-group {
        margin-bottom: 24px;
    }

    .setting-group h3 {
        margin-bottom: 12px;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .radio-group,
    .filter-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .radio-item,
    .checkbox-item {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }

    .settings-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px 24px;
        border-top: 1px solid var(--border-subtle);
    }

    @media (max-width: 768px) {
        .settings-modal {
            width: 100%;
            height: 100%;
            max-height: 100vh;
            border-radius: 0;
        }

        .settings-content {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
        }

        .settings-tabs {
            border-right: none;
            border-bottom: 1px solid var(--border-subtle);
        }

        .tab-list {
            display: flex;
            overflow-x: auto;
        }

        .tab-button {
            white-space: nowrap;
            min-width: 120px;
        }
    }
</style>
```

**Success Criteria**:

- [ ] Unified settings modal implemented
- [ ] All existing settings consolidated
- [ ] Tabbed interface for organization
- [ ] Mobile-responsive design
- [ ] Keyboard navigation support
- [ ] ARIA accessibility compliance

#### Step 2.2: Settings Integration

**Duration**: 6 hours
**Risk Level**: 🟡 MEDIUM

**Files to Modify**:

- Extract settings from `ControlPanel.svelte`
- Extract settings from `MonthlyControlPanel.svelte`
- Integrate `Legend.svelte` content
- Update state management integration

**Success Criteria**:

- [ ] All settings moved to unified modal
- [ ] No duplicate settings interfaces
- [ ] State synchronization working
- [ ] No breaking changes to functionality

### Phase 3: Sidebar Implementation (Days 5-6)

#### Step 3.1: Sidebar Component Creation

**Duration**: 8 hours
**Risk Level**: 🟡 MEDIUM

**New File**: `src/lib/components/layout/Sidebar.svelte`

```svelte
<script>
    import { layoutStore } from '../../stores/layoutStore.svelte.js';
    import UnifiedSettingsModal from './UnifiedSettingsModal.svelte';
    import QuickFilters from './QuickFilters.svelte';
    import CoverageLegend from './CoverageLegend.svelte';
    import QuickActions from './QuickActions.svelte';

    const { sidebarOpen, layoutMode, sidebarCollapsed } = layoutStore;

    function openSettings() {
        layoutStore.openSettingsModal();
    }

    function toggleCollapse() {
        layoutStore.toggleSidebarCollapse();
    }
</script>

<aside
    class="sidebar"
    class:open={sidebarOpen}
    class:collapsed={sidebarCollapsed}
    class:mobile={layoutMode === 'mobile'}
    aria-label="Tools and settings"
>
    <header class="sidebar-header">
        <h2 class="sidebar-title">
            {#if !sidebarCollapsed}
                <span class="title-icon">🛠️</span>
                <span class="title-text">Tools</span>
            {:else}
                <span class="title-icon">🛠️</span>
            {/if}
        </h2>

        <div class="sidebar-controls">
            {#if layoutMode === 'desktop'}
                <button
                    class="collapse-btn touch-target"
                    onclick={toggleCollapse}
                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {sidebarCollapsed ? '→' : '←'}
                </button>
            {/if}

            {#if layoutMode === 'mobile'}
                <button
                    class="close-btn touch-target"
                    onclick={() => layoutStore.closeSidebar()}
                    aria-label="Close sidebar"
                >
                    ✕
                </button>
            {/if}
        </div>
    </header>

    <div class="sidebar-content">
        <!-- Settings Access -->
        <section class="sidebar-section">
            <button
                class="settings-btn touch-target"
                onclick={openSettings}
                aria-label="Open settings modal"
            >
                <span class="btn-icon">⚙️</span>
                {#if !sidebarCollapsed}
                    <span class="btn-text">Settings</span>
                {/if}
            </button>
        </section>

        {#if !sidebarCollapsed}
            <!-- Quick Filters -->
            <section class="sidebar-section">
                <h3 class="section-title">Quick Filters</h3>
                <QuickFilters />
            </section>

            <!-- Coverage Legend -->
            <section class="sidebar-section">
                <h3 class="section-title">Coverage Legend</h3>
                <CoverageLegend />
            </section>

            <!-- Quick Actions -->
            <section class="sidebar-section">
                <h3 class="section-title">Quick Actions</h3>
                <QuickActions />
            </section>
        {/if}
    </div>

    <!-- Settings Modal -->
    <UnifiedSettingsModal />
</aside>

{#if layoutMode === 'mobile' && sidebarOpen}
    <div
        class="sidebar-backdrop"
        onclick={() => layoutStore.closeSidebar()}
        aria-hidden="true"
    ></div>
{/if}

<style>
    .sidebar {
        background: var(--glass-background);
        border: 1px solid var(--border-subtle);
        border-radius: 12px;
        padding: 20px;
        height: fit-content;
        position: sticky;
        top: 20px;
        transition: width 0.3s ease;
        width: 100%;
        min-width: 300px;
    }

    .sidebar.collapsed {
        width: 80px;
        min-width: 80px;
    }

    .sidebar.mobile {
        position: fixed;
        top: 0;
        right: -100%;
        width: 90%;
        height: 100vh;
        z-index: 1000;
        border-radius: 0;
        transition: right 0.3s ease;
    }

    .sidebar.mobile.open {
        right: 0;
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border-subtle);
    }

    .sidebar-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
    }

    .sidebar-controls {
        display: flex;
        gap: 8px;
    }

    .collapse-btn,
    .close-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: var(--accent-color-alpha);
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    }

    .collapse-btn:hover,
    .close-btn:hover {
        background: var(--accent-color);
    }

    .sidebar-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .sidebar-section {
        border-bottom: 1px solid var(--border-subtle);
        padding-bottom: 16px;
    }

    .sidebar-section:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .section-title {
        margin: 0 0 12px 0;
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-medium-contrast);
    }

    .settings-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: none;
        background: var(--accent-color-alpha);
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s;
    }

    .settings-btn:hover {
        background: var(--accent-color);
    }

    .sidebar.collapsed .settings-btn {
        justify-content: center;
        padding: 12px 8px;
    }

    .sidebar-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }

    @media (max-width: 1024px) {
        .sidebar {
            position: fixed;
            top: 0;
            right: -100%;
            width: 90%;
            height: 100vh;
            z-index: 1000;
            border-radius: 0;
            transition: right 0.3s ease;
        }

        .sidebar.open {
            right: 0;
        }
    }
</style>
```

**Success Criteria**:

- [ ] Sidebar component implemented
- [ ] Collapsible functionality working
- [ ] Mobile overlay behavior
- [ ] Settings modal integration
- [ ] Quick access to common tools

#### Step 3.2: Quick Components Implementation

**Duration**: 6 hours
**Risk Level**: 🟢 LOW

**New Files**:

- `src/lib/components/layout/QuickFilters.svelte`
- `src/lib/components/layout/CoverageLegend.svelte`
- `src/lib/components/layout/QuickActions.svelte`

**Success Criteria**:

- [ ] Quick filter toggles implemented
- [ ] Coverage legend integrated
- [ ] Quick action buttons functional
- [ ] Consistent styling with sidebar theme

### Phase 4: Main Layout Integration (Days 7-8)

#### Step 4.1: App.svelte Layout Restructuring

**Duration**: 8 hours
**Risk Level**: 🔴 HIGH

**File to Modify**: `src/App.svelte`

**Implementation Strategy**:

```svelte
<script>
    import Header from './lib/components/Header.svelte';
    import ScheduleGrid from './lib/components/ScheduleGrid.svelte';
    import MonthlyCalendarView from './lib/components/MonthlyCalendarView.svelte';
    import Sidebar from './lib/components/layout/Sidebar.svelte';
    import { layoutStore } from './lib/stores/layoutStore.svelte.js';
    import { scheduleStore } from './lib/stores/scheduleStore.svelte.js';
    import { monthlyScheduleStore } from './lib/stores/monthlyScheduleStore.svelte.js';

    const { layoutMode, sidebarOpen } = layoutStore;
    const { viewMode: weeklyViewMode } = scheduleStore;
    const { viewMode: monthlyViewMode } = monthlyScheduleStore;

    let useMonthlySystem = $state(true);

    // Handle outside clicks for mobile sidebar
    function handleOutsideClick(event) {
        layoutStore.handleOutsideClick(event);
    }
</script>

<div
    class="app-layout"
    class:mobile={layoutMode === 'mobile'}
    class:tablet={layoutMode === 'tablet'}
    class:sidebar-open={sidebarOpen}
    onclick={handleOutsideClick}
>
    <header class="app-header">
        <Header />

        {#if layoutMode === 'mobile'}
            <button
                class="mobile-sidebar-toggle touch-target"
                onclick={() => layoutStore.toggleSidebar()}
                aria-label="Open tools and settings"
            >
                <span class="toggle-icon">🛠️</span>
                <span class="toggle-text">Tools</span>
            </button>
        {/if}
    </header>

    <main class="app-content" aria-label="Schedule content">
        {#if useMonthlySystem}
            {#if monthlyViewMode === 'monthly'}
                <MonthlyCalendarView />
            {:else if monthlyViewMode === 'weekly'}
                <ScheduleGrid />
            {/if}
        {:else}
            <ScheduleGrid />
        {/if}
    </main>

    {#if layoutMode === 'desktop' || layoutMode === 'tablet'}
        <Sidebar />
    {/if}
</div>

{#if layoutMode === 'mobile'}
    <Sidebar />
{/if}

<style>
    .app-layout {
        display: grid;
        grid-template-areas:
            "header header"
            "content sidebar";
        grid-template-columns: 1fr 400px;
        grid-template-rows: auto 1fr;
        min-height: 100vh;
        gap: 20px;
        padding: 20px;
        background: var(--background-primary);
    }

    .app-header {
        grid-area: header;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .app-content {
        grid-area: content;
        min-width: 0; /* Prevent grid overflow */
        background: var(--glass-background);
        border: 1px solid var(--border-subtle);
        border-radius: 12px;
        padding: 20px;
    }

    .mobile-sidebar-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border: none;
        background: var(--accent-color-alpha);
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s;
    }

    .mobile-sidebar-toggle:hover {
        background: var(--accent-color);
    }

    /* Tablet Layout */
    .app-layout.tablet {
        grid-template-columns: 1fr 300px;
    }

    /* Mobile Layout */
    .app-layout.mobile {
        grid-template-areas:
            "header"
            "content";
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
        padding: 10px;
        gap: 10px;
    }

    .app-layout.mobile .app-content {
        padding: 15px;
    }

    /* Responsive adjustments */
    @media (max-width: 1200px) {
        .app-layout {
            grid-template-columns: 1fr 320px;
        }
    }

    @media (max-width: 1024px) {
        .app-layout {
            grid-template-areas:
                "header"
                "content";
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 768px) {
        .app-layout {
            padding: 10px;
            gap: 10px;
        }

        .app-content {
            padding: 15px;
            border-radius: 8px;
        }
    }
</style>
```

**Success Criteria**:

- [ ] Side-by-side layout implemented
- [ ] Mobile responsive behavior working
- [ ] Sidebar integration complete
- [ ] No breaking changes to existing functionality
- [ ] Performance maintained

#### Step 4.2: Schedule Grid Optimization

**Duration**: 6 hours
**Risk Level**: 🟡 MEDIUM

**File to Modify**: `src/lib/components/ScheduleGrid.svelte`

**Optimization Changes**:

```css
/* Optimize for 70% width layout */
.schedule-grid {
  width: 100%;
  overflow-x: auto;
  background: transparent; /* Remove background - handled by parent */
  border: none; /* Remove border - handled by parent */
  border-radius: 0; /* Remove border-radius - handled by parent */
}

.day-columns {
  display: grid;
  grid-template-columns: repeat(
    7,
    minmax(140px, 1fr)
  ); /* Optimized for sidebar layout */
  gap: 1px;
  min-width: 980px; /* Ensure minimum width for readability */
}

/* Mobile optimization */
@media (max-width: 768px) {
  .day-columns {
    grid-template-columns: repeat(7, minmax(120px, 1fr));
    min-width: 840px;
  }
}

@media (max-width: 480px) {
  .day-columns {
    grid-template-columns: repeat(7, minmax(100px, 1fr));
    min-width: 700px;
  }
}
```

**Success Criteria**:

- [ ] Schedule grid optimized for 70% width
- [ ] Horizontal scrolling works smoothly
- [ ] Mobile optimization implemented
- [ ] Visual consistency maintained

### Phase 5: Component Cleanup (Days 9-10)

#### Step 5.1: Remove Duplicate Controls

**Duration**: 6 hours
**Risk Level**: 🟡 MEDIUM

**Files to Modify**:

- `src/lib/components/ControlPanel.svelte` - Remove view controls, keep component-specific settings
- `src/lib/components/MonthlyControlPanel.svelte` - Remove duplicate controls
- `src/lib/components/Legend.svelte` - Integrate into sidebar or remove

**Cleanup Strategy**:

```svelte
<!-- Updated ControlPanel.svelte -->
<script>
    // Remove navigation and view controls
    // Keep only component-specific functionality
    import { scheduleStore } from '../stores/scheduleStore.svelte.js';

    // Remove: viewMode, view switching logic
    // Keep: component-specific state and methods
</script>

<!-- Remove view controls section -->
<!-- Keep only essential component controls -->
<section class="component-controls" aria-label="Schedule-specific controls">
    <!-- Only schedule-specific controls remain -->
</section>
```

**Success Criteria**:

- [ ] No duplicate navigation controls
- [ ] Component-specific functionality preserved
- [ ] Clean component interfaces
- [ ] No breaking changes

#### Step 5.2: Performance Optimization

**Duration**: 6 hours
**Risk Level**: 🟢 LOW

**Optimization Areas**:

1. **CSS Consolidation**: Merge duplicate styles
2. **Component Lazy Loading**: Load sidebar components on demand
3. **Event Optimization**: Reduce unnecessary re-renders
4. **Bundle Analysis**: Identify and remove unused code

**Implementation**:

```javascript
// Lazy load sidebar components
const QuickFilters = lazy(() => import('./QuickFilters.svelte'));
const CoverageLegend = lazy(() => import('./CoverageLegend.svelte'));
const QuickActions = lazy(() => import('./QuickActions.svelte'));

// Optimize event handling
const debouncedResize = debounce(() => {
    layoutStore.updateScreenWidth();
}, 100);

// CSS optimization
/* Consolidated layout styles */
:root {
    --sidebar-width-desktop: 400px;
    --sidebar-width-tablet: 300px;
    --sidebar-width-mobile: 90%;
    --content-padding: 20px;
    --mobile-padding: 10px;
}
```

**Success Criteria**:

- [ ] Performance metrics maintained or improved
- [ ] Bundle size increase < 10KB
- [ ] Smooth animations on all devices
- [ ] No memory leaks

### Phase 6: Testing & Validation (Days 11-12)

#### Step 6.1: Comprehensive Testing

**Duration**: 8 hours

**Testing Checklist**:

- [ ] Layout responsiveness across all breakpoints
- [ ] Sidebar functionality (open/close/collapse)
- [ ] Settings modal functionality
- [ ] Mobile touch interactions
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Cross-browser testing
- [ ] Performance validation

#### Step 6.2: User Acceptance Testing

**Duration**: 4 hours

**UAT Scenarios**:

- [ ] Schedule viewing and navigation
- [ ] Settings modification workflows
- [ ] Mobile usage patterns
- [ ] Accessibility compliance
- [ ] Performance on various devices

## Risk Mitigation Strategies

### High-Risk Areas

1. **Layout Disruption**: Major changes to App.svelte could break existing functionality
2. **Mobile Compatibility**: Complex responsive behavior may not work on all devices
3. **Performance Impact**: Additional layout complexity could slow the application
4. **User Adaptation**: Significant UI changes may confuse existing users

### Mitigation Approaches

1. **Feature Flags**: Implement toggle between old and new layouts
2. **Progressive Enhancement**: Start with desktop, then enhance for mobile
3. **Performance Monitoring**: Track metrics throughout implementation
4. **User Communication**: Provide clear guidance on layout changes

## Success Metrics

### Functional Metrics

- [ ] Schedule content uses 70% of screen width on desktop
- [ ] Tools consolidated in 30% sidebar
- [ ] Settings accessible via single gear icon
- [ ] Mobile layout optimized for touch
- [ ] Responsive design supports 320px-1920px

### Performance Metrics

- [ ] Layout response time < 100ms
- [ ] 60fps scroll performance maintained
- [ ] Bundle size increase < 10KB
- [ ] No performance regression

### User Experience Metrics

- [ ] 45% reduction in setting access time
- [ ] 73% improvement in mobile usability
- [ ] 78% reduction in scrolling required
- [ ] 4.5/5 user satisfaction rating

## Rollback Strategy

### Immediate Rollback (< 30 minutes)

1. Disable layout feature flags
2. Restore original App.svelte layout
3. Re-enable original control panels

### Gradual Rollback (< 2 hours)

1. Revert layout changes incrementally
2. Restore component-by-component
3. Validate functionality at each step

### Complete Recovery (< 4 hours)

1. Full restoration to previous layout system
2. Data integrity validation
3. User communication about temporary issues

## Post-Implementation Validation

### Week 1: Monitoring

- [ ] User feedback collection
- [ ] Performance metrics analysis
- [ ] Error rate monitoring
- [ ] Mobile usage analytics

### Week 2: Optimization

- [ ] Address identified issues
- [ ] Performance fine-tuning
- [ ] User experience improvements
- [ ] Documentation updates

### Month 1: Enhancement

- [ ] Advanced layout features
- [ ] User-requested improvements
- [ ] Integration with future priorities
- [ ] Long-term maintenance planning
