<script>
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    let { 
        isOpen = $bindable(false),
        currentStep = $bindable(0),
        showTooltip = $bindable(false),
        tooltipTarget = $bindable(''),
        tooltipContent = $bindable(''),
        tourMode = $bindable(false)
    } = $props();
    
    // Help content structure
    const helpSections = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: '🚀',
            content: [
                {
                    title: 'Welcome to TIA Schedule Builder',
                    description: 'This application helps you manage museum staffing schedules efficiently.',
                    steps: [
                        'Choose between Weekly and Monthly views',
                        'Use filters to focus on specific departments or coverage',
                        'Customize colors and display options',
                        'Click on days or shifts for detailed information'
                    ]
                }
            ]
        },
        {
            id: 'navigation',
            title: 'Navigation',
            icon: '🧭',
            content: [
                {
                    title: 'View Modes',
                    description: 'Switch between different perspectives of your schedule.',
                    steps: [
                        'Weekly View: See all staff assignments for the week',
                        'Monthly View: Overview of coverage and events',
                        'Daily View: Detailed breakdown of a single day',
                        'Staff View: Individual staff member schedules'
                    ]
                }
            ]
        },
        {
            id: 'filters',
            title: 'Filters & Customization',
            icon: '🔍',
            content: [
                {
                    title: 'Using Filters',
                    description: 'Focus on specific aspects of your schedule.',
                    steps: [
                        'Department filters: Show only specific departments',
                        'Coverage filters: Highlight coverage issues',
                        'Staff type filters: Filter by paid, trainee, or volunteer',
                        'Use "Clear All Filters" to reset'
                    ]
                }
            ]
        },
        {
            id: 'accessibility',
            title: 'Accessibility Features',
            icon: '♿',
            content: [
                {
                    title: 'Keyboard Navigation',
                    description: 'Navigate efficiently using your keyboard.',
                    steps: [
                        'Tab: Move between interactive elements',
                        'Enter/Space: Activate buttons and links',
                        'Arrow keys: Navigate within grids and lists',
                        'Escape: Close dialogs and panels'
                    ]
                }
            ]
        }
    ];
    
    // Guided tour steps
    const tourSteps = [
        {
            target: '.system-header',
            title: 'System Switching',
            content: 'Switch between Weekly and Monthly scheduling systems here.',
            position: 'bottom'
        },
        {
            target: '.controls-panel',
            title: 'Control Panel',
            content: 'Customize your view with filters, colors, and display options.',
            position: 'left'
        },
        {
            target: '.schedule-grid',
            title: 'Schedule Grid',
            content: 'Your main schedule view. Click on days or shifts for details.',
            position: 'top'
        },
        {
            target: '.legend',
            title: 'Legend',
            content: 'Reference for understanding colors and patterns.',
            position: 'top'
        }
    ];
    
    let activeSection = 'getting-started';
    
    function selectSection(sectionId) {
        activeSection = sectionId;
    }
    
    function startTour() {
        tourMode = true;
        currentStep = 0;
        isOpen = false;
        showTooltip = true;
        showTourStep(0);
    }
    
    function showTourStep(step) {
        if (step >= tourSteps.length) {
            endTour();
            return;
        }
        
        const tourStep = tourSteps[step];
        tooltipTarget = tourStep.target;
        tooltipContent = `
            <div class="tour-step">
                <h4>${tourStep.title}</h4>
                <p>${tourStep.content}</p>
                <div class="tour-navigation">
                    <span class="tour-progress">Step ${step + 1} of ${tourSteps.length}</span>
                    <div class="tour-buttons">
                        ${step > 0 ? '<button onclick="previousStep()">Previous</button>' : ''}
                        ${step < tourSteps.length - 1 ? '<button onclick="nextStep()">Next</button>' : '<button onclick="endTour()">Finish</button>'}
                    </div>
                </div>
            </div>
        `;
        
        // Scroll target into view
        const targetElement = document.querySelector(tourStep.target);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetElement.classList.add('tour-highlight');
        }
    }
    
    function nextStep() {
        currentStep++;
        showTourStep(currentStep);
    }
    
    function previousStep() {
        currentStep--;
        showTourStep(currentStep);
    }
    
    function endTour() {
        tourMode = false;
        showTooltip = false;
        currentStep = 0;
        
        // Remove all tour highlights
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });
    }
    
    function closeHelp() {
        isOpen = false;
        dispatch('close');
    }
    
    // Make functions globally available for tour navigation
    if (typeof window !== 'undefined') {
        window.nextStep = nextStep;
        window.previousStep = previousStep;
        window.endTour = endTour;
    }
</script>

<!-- Help Panel -->
{#if isOpen}
    <div class="help-overlay" onclick={closeHelp} role="dialog" aria-modal="true" aria-labelledby="help-title">
        <div class="help-panel glass" onclick={(e) => e.stopPropagation()}>
            <header class="help-header">
                <h2 id="help-title" class="text-high-contrast">Help & Guide</h2>
                <button class="close-btn touch-target" onclick={closeHelp} aria-label="Close help panel">
                    ✕
                </button>
            </header>
            
            <div class="help-content">
                <nav class="help-navigation" aria-label="Help sections">
                    <ul class="help-nav-list">
                        {#each helpSections as section}
                            <li>
                                <button 
                                    class="help-nav-item touch-target"
                                    class:active={activeSection === section.id}
                                    onclick={() => selectSection(section.id)}
                                    aria-pressed={activeSection === section.id}
                                >
                                    <span class="help-icon">{section.icon}</span>
                                    <span class="help-title">{section.title}</span>
                                </button>
                            </li>
                        {/each}
                    </ul>
                    
                    <div class="help-actions">
                        <button class="tour-btn touch-target" onclick={startTour}>
                            🎯 Start Guided Tour
                        </button>
                    </div>
                </nav>
                
                <main class="help-main">
                    {#each helpSections as section}
                        {#if activeSection === section.id}
                            <div class="help-section">
                                {#each section.content as item}
                                    <article class="help-article">
                                        <h3 class="text-high-contrast">{item.title}</h3>
                                        <p class="text-medium-contrast">{item.description}</p>
                                        
                                        {#if item.steps}
                                            <ol class="help-steps">
                                                {#each item.steps as step}
                                                    <li class="text-medium-contrast">{step}</li>
                                                {/each}
                                            </ol>
                                        {/if}
                                    </article>
                                {/each}
                            </div>
                        {/if}
                    {/each}
                </main>
            </div>
        </div>
    </div>
{/if}

<!-- Tooltip for guided tour -->
{#if showTooltip && tourMode}
    <div class="tour-tooltip glass" style="position: fixed; z-index: 10000;">
        {@html tooltipContent}
    </div>
{/if}

<style>
    .help-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    }
    
    .help-panel {
        width: 90%;
        max-width: 900px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        border-radius: 16px;
        overflow: hidden;
    }
    
    .help-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .help-header h2 {
        margin: 0;
        font-size: 1.5rem;
    }
    
    .close-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        border-radius: 8px;
        font-size: 1.2rem;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .help-content {
        display: flex;
        flex: 1;
        overflow: hidden;
    }
    
    .help-navigation {
        width: 250px;
        background: rgba(0, 0, 0, 0.2);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .help-nav-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .help-nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.8);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        width: 100%;
    }
    
    .help-nav-item:hover,
    .help-nav-item.active {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border-color: rgba(255, 255, 255, 0.4);
    }
    
    .help-icon {
        font-size: 1.2rem;
    }
    
    .help-title {
        font-weight: 500;
    }
    
    .tour-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .tour-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .help-main {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
    }
    
    .help-article {
        margin-bottom: 32px;
    }
    
    .help-article h3 {
        margin: 0 0 12px 0;
        font-size: 1.3rem;
    }
    
    .help-article p {
        margin: 0 0 16px 0;
        line-height: 1.6;
    }
    
    .help-steps {
        margin: 0;
        padding-left: 20px;
    }
    
    .help-steps li {
        margin-bottom: 8px;
        line-height: 1.5;
    }
    
    .tour-tooltip {
        padding: 20px;
        border-radius: 12px;
        max-width: 300px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    .tour-step h4 {
        margin: 0 0 8px 0;
        color: white;
    }
    
    .tour-step p {
        margin: 0 0 16px 0;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.5;
    }
    
    .tour-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .tour-progress {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .tour-buttons {
        display: flex;
        gap: 8px;
    }
    
    .tour-buttons button {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    .tour-buttons button:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    /* Tour highlight effect */
    :global(.tour-highlight) {
        position: relative;
        z-index: 999;
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3) !important;
        border-radius: 8px;
    }
    
    @media (max-width: 768px) {
        .help-panel {
            width: 95%;
            max-height: 90vh;
        }
        
        .help-content {
            flex-direction: column;
        }
        
        .help-navigation {
            width: 100%;
            padding: 16px;
        }
        
        .help-nav-list {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .help-nav-item {
            flex: 1;
            min-width: 120px;
        }
        
        .help-main {
            padding: 16px;
        }
    }
</style>
