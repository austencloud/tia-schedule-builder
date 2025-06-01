<script>
    import { scheduleStore } from '$lib/stores/scheduleStore.svelte.js';
    import DayColumn from '$lib/components/DayColumn.svelte';

    const { setUseComprehensiveData, comprehensiveScheduleData } = scheduleStore;

    // Enable comprehensive data mode
    setUseComprehensiveData(true);

    // Test data with known staff counts
    const testDays = [
        {
            date: 1,
            dayOfWeek: 'Monday',
            fullDate: 'June 1, 2025',
            coverageStatus: 'green',
            finalAssignments: [
                { staff: 'Alice Johnson', role: 'Lead Instructor', time: '9:00-17:00', hours: 8, capabilities: ['Teaching', 'Safety'] },
                { staff: 'Bob Smith', role: 'Assistant', time: '10:00-18:00', hours: 8, capabilities: ['Teaching'] },
                { staff: 'Carol Davis', role: 'Lab Tech', time: '12:00-20:00', hours: 8, capabilities: ['Lab Management'] }
            ],
            events: [
                { name: 'Beginner Class', type: 'class' },
                { name: 'Advanced Workshop', type: 'workshop' }
            ]
        },
        {
            date: 2,
            dayOfWeek: 'Tuesday',
            fullDate: 'June 2, 2025',
            coverageStatus: 'yellow',
            finalAssignments: [
                { staff: 'Alice Johnson', role: 'Lead Instructor', time: '9:00-17:00', hours: 8, capabilities: ['Teaching', 'Safety'] },
                { staff: 'Bob Smith', role: 'Assistant', time: '10:00-18:00', hours: 8, capabilities: ['Teaching'] }
            ],
            events: [
                { name: 'Intermediate Class', type: 'class' }
            ]
        },
        {
            date: 3,
            dayOfWeek: 'Wednesday',
            fullDate: 'June 3, 2025',
            coverageStatus: 'red',
            finalAssignments: [
                { staff: 'Alice Johnson', role: 'Lead Instructor', time: '9:00-17:00', hours: 8, capabilities: ['Teaching', 'Safety'] }
            ],
            events: []
        }
    ];
</script>

<svelte:head>
    <title>Staff Count Test - TIA Schedule Builder</title>
</svelte:head>

<div class="test-page">
    <header class="test-header">
        <h1>Staff Count Display Test</h1>
        <p>This page tests that staff counts are displayed as numbers, not function code.</p>
    </header>

    <main class="test-content">
        <section class="expected-results">
            <h2>Expected Results:</h2>
            <ul>
                <li><strong>Monday:</strong> Should show "👥 3" (3 staff members)</li>
                <li><strong>Tuesday:</strong> Should show "👥 2" (2 staff members)</li>
                <li><strong>Wednesday:</strong> Should show "👥 1" (1 staff member)</li>
            </ul>
            <p><strong>❌ Bug:</strong> If you see function code like <code>() => { if (useComprehensiveData && $$props.day.finalAssignments) { return $$props.day.finalAssignments.length; } return $$props.day.shifts ? $$props.day.shifts.length : 0; }</code> instead of numbers, the bug is still present.</p>
            <p><strong>✅ Fixed:</strong> If you see actual numbers (3, 2, 1), the bug has been resolved.</p>
        </section>

        <section class="test-grid">
            <h2>Test Results:</h2>
            <div class="day-columns-grid">
                {#each testDays as day}
                    <div class="test-day-wrapper">
                        <h3>Test Day: {day.dayOfWeek}</h3>
                        <p>Expected staff count: {day.finalAssignments.length}</p>
                        <DayColumn {day} />
                    </div>
                {/each}
            </div>
        </section>

        <section class="debug-info">
            <h2>Debug Information:</h2>
            <div class="debug-grid">
                {#each testDays as day, index}
                    <div class="debug-card">
                        <h4>{day.dayOfWeek}</h4>
                        <p><strong>Staff Count:</strong> {day.finalAssignments.length}</p>
                        <p><strong>Event Count:</strong> {day.events.length}</p>
                        <p><strong>Coverage Status:</strong> {day.coverageStatus}</p>
                        <details>
                            <summary>Staff Details</summary>
                            <ul>
                                {#each day.finalAssignments as assignment}
                                    <li>{assignment.staff} - {assignment.role}</li>
                                {/each}
                            </ul>
                        </details>
                    </div>
                {/each}
            </div>
        </section>
    </main>
</div>

<style>
    .test-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        color: white;
    }

    .test-header {
        text-align: center;
        margin-bottom: 30px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .test-header h1 {
        margin: 0 0 10px 0;
        font-size: 2rem;
        font-weight: 600;
    }

    .test-header p {
        margin: 0;
        font-size: 1.1rem;
        opacity: 0.9;
    }

    .test-content {
        display: flex;
        flex-direction: column;
        gap: 30px;
    }

    .expected-results {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .expected-results h2 {
        margin: 0 0 15px 0;
        color: #FFD54F;
    }

    .expected-results ul {
        margin: 15px 0;
        padding-left: 20px;
    }

    .expected-results li {
        margin-bottom: 8px;
        font-size: 1rem;
    }

    .expected-results code {
        background: rgba(0, 0, 0, 0.3);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
        word-break: break-all;
    }

    .test-grid {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .test-grid h2 {
        margin: 0 0 20px 0;
        color: #FFD54F;
    }

    .day-columns-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
    }

    .test-day-wrapper {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .test-day-wrapper h3 {
        margin: 0 0 10px 0;
        color: #4CAF50;
        font-size: 1.2rem;
    }

    .test-day-wrapper p {
        margin: 0 0 15px 0;
        font-size: 0.9rem;
        opacity: 0.8;
    }

    .debug-info {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .debug-info h2 {
        margin: 0 0 20px 0;
        color: #FFD54F;
    }

    .debug-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
    }

    .debug-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .debug-card h4 {
        margin: 0 0 10px 0;
        color: #2196F3;
    }

    .debug-card p {
        margin: 5px 0;
        font-size: 0.9rem;
    }

    .debug-card details {
        margin-top: 10px;
    }

    .debug-card summary {
        cursor: pointer;
        font-weight: 500;
        color: #FFD54F;
    }

    .debug-card ul {
        margin: 10px 0 0 0;
        padding-left: 20px;
    }

    .debug-card li {
        font-size: 0.85rem;
        margin-bottom: 4px;
    }

    @media (max-width: 768px) {
        .test-page {
            padding: 15px;
        }

        .day-columns-grid, .debug-grid {
            grid-template-columns: 1fr;
        }

        .test-header h1 {
            font-size: 1.5rem;
        }

        .test-header p {
            font-size: 1rem;
        }
    }
</style>
