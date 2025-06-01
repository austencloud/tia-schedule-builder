<script>
    import { scheduleStore } from '../stores/scheduleStore.svelte.js';
    import DayColumn from './DayColumn.svelte';
    import EnhancedDayDetailPanel from './EnhancedDayDetailPanel.svelte';

    const {
        useComprehensiveData,
        comprehensiveScheduleData,
        setUseComprehensiveData,
        showDayDetailPanel
    } = scheduleStore;

    // Enable comprehensive data mode for testing
    $effect(() => {
        setUseComprehensiveData(true);
    });

    // Test data - simulate a week of comprehensive schedule data
    const testWeekData = $derived(() => {
        if (comprehensiveScheduleData && comprehensiveScheduleData.length > 0) {
            return comprehensiveScheduleData.slice(0, 7); // First week
        }
        return [];
    });

    function handleToggleDataMode() {
        setUseComprehensiveData(!useComprehensiveData);
    }
</script>

<div class="enhanced-weekly-view-test">
    <header class="test-header">
        <h1>Enhanced Weekly View Test</h1>
        <div class="test-controls">
            <button class="toggle-btn" onclick={handleToggleDataMode}>
                {useComprehensiveData ? 'Switch to Legacy Data' : 'Switch to Comprehensive Data'}
            </button>
            <div class="data-mode-indicator" class:comprehensive={useComprehensiveData}>
                Mode: {useComprehensiveData ? 'Comprehensive' : 'Legacy'}
            </div>
        </div>
    </header>

    <main class="weekly-grid">
        {#if testWeekData.length > 0}
            {#each testWeekData as dayData}
                <DayColumn day={dayData} />
            {/each}
        {:else}
            <div class="no-data-message">
                <h3>No test data available</h3>
                <p>Please ensure the comprehensive schedule data is loaded.</p>
            </div>
        {/if}
    </main>

    <!-- Enhanced Day Detail Panel -->
    <EnhancedDayDetailPanel />

    <footer class="test-footer">
        <div class="test-instructions">
            <h3>Test Instructions:</h3>
            <ol>
                <li>Click on any day cell to open the Enhanced Day Detail Panel</li>
                <li>Test the drag-and-drop functionality by dragging staff from Available Staff to assignments</li>
                <li>Toggle edit mode to add/remove staff assignments</li>
                <li>Verify visual status indicators (green/yellow/red coverage)</li>
                <li>Check accessibility with keyboard navigation (Tab, Enter, Escape)</li>
                <li>Test responsive design by resizing the window</li>
            </ol>
        </div>
        
        <div class="test-status">
            <h3>Current Status:</h3>
            <ul>
                <li>Data Mode: {useComprehensiveData ? 'Comprehensive' : 'Legacy'}</li>
                <li>Panel Open: {showDayDetailPanel ? 'Yes' : 'No'}</li>
                <li>Days Loaded: {testWeekData.length}</li>
            </ul>
        </div>
    </footer>
</div>

<style>
    .enhanced-weekly-view-test {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .test-header {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
    }

    .test-header h1 {
        margin: 0;
        color: white;
        font-size: 1.8rem;
        font-weight: 600;
    }

    .test-controls {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .toggle-btn {
        background: rgba(33, 150, 243, 0.2);
        border: 1px solid rgba(33, 150, 243, 0.5);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
    }

    .toggle-btn:hover {
        background: rgba(33, 150, 243, 0.3);
        transform: scale(1.05);
    }

    .data-mode-indicator {
        background: rgba(244, 67, 54, 0.2);
        border: 1px solid rgba(244, 67, 54, 0.5);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .data-mode-indicator.comprehensive {
        background: rgba(76, 175, 80, 0.2);
        border-color: rgba(76, 175, 80, 0.5);
    }

    .weekly-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        flex: 1;
    }

    .no-data-message {
        grid-column: 1 / -1;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 40px;
        text-align: center;
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .no-data-message h3 {
        margin: 0 0 15px 0;
        font-size: 1.5rem;
        color: #FFD54F;
    }

    .no-data-message p {
        margin: 0;
        font-size: 1rem;
        opacity: 0.8;
    }

    .test-footer {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 30px;
        color: white;
    }

    .test-instructions h3, .test-status h3 {
        margin: 0 0 15px 0;
        color: #FFD54F;
        font-size: 1.2rem;
    }

    .test-instructions ol {
        margin: 0;
        padding-left: 20px;
        line-height: 1.6;
    }

    .test-instructions li {
        margin-bottom: 8px;
        font-size: 0.9rem;
    }

    .test-status ul {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .test-status li {
        background: rgba(255, 255, 255, 0.1);
        padding: 8px 12px;
        border-radius: 6px;
        margin-bottom: 8px;
        font-size: 0.9rem;
        border-left: 3px solid #4CAF50;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .enhanced-weekly-view-test {
            padding: 15px;
        }

        .test-header {
            flex-direction: column;
            text-align: center;
        }

        .test-header h1 {
            font-size: 1.5rem;
        }

        .weekly-grid {
            grid-template-columns: 1fr;
        }

        .test-footer {
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .test-controls {
            flex-direction: column;
            width: 100%;
        }

        .toggle-btn {
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        .enhanced-weekly-view-test {
            padding: 10px;
        }

        .test-header, .test-footer {
            padding: 15px;
        }
    }
</style>
