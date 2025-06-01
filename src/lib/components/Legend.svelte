<script>
    import { scheduleStore } from '../stores/scheduleStore.svelte.js';
    import { departments } from '../data/scheduleData.js';
    
    const {
        showPatterns
    } = scheduleStore;
    

    
    const legendItems = [
        {
            type: 'department',
            items: Object.entries(departments).map(([key, dept]) => ({
                key,
                name: dept.name,
                pattern: dept.pattern,
                description: dept.description
            }))
        },
        {
            type: 'staff-type',
            items: [
                { key: 'paid', name: 'Paid Staff', color: '#4CAF50', description: 'Regular paid employees' },
                { key: 'trainee', name: 'Trainee', color: '#BB8FCE', description: 'Staff in training' },
                { key: 'volunteer', name: 'Volunteer', color: '#82E0AA', description: 'Volunteer support staff' }
            ]
        }
    ];
</script>

<div class="legend glass-dark">
    <h3>Legend</h3>
    
    <div class="legend-sections">
        <div class="legend-section">
            <h4>Departments</h4>
            <p class="section-description">Departments are indicated by text labels and visual patterns</p>
            <div class="legend-grid">
                {#each legendItems[0].items as item}
                    <div class="legend-item">
                        <div class="legend-pattern {item.pattern}">
                            <span class="pattern-text">{item.name}</span>
                        </div>
                        <div class="legend-content">
                            <div class="legend-text">{item.name}</div>
                            <div class="legend-description">{item.description}</div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        
        <div class="legend-section">
            <h4>Staff Types</h4>
            <div class="legend-grid">
                {#each legendItems[1].items as item}
                    <div class="legend-item">
                        <div 
                            class="legend-color" 
                            style="background-color: {item.color};"
                        ></div>
                        <div class="legend-content">
                            <div class="legend-text">{item.name}</div>
                            <div class="legend-description">{item.description}</div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        
        <div class="legend-section">
            <h4>Visual Indicators</h4>
            <div class="legend-grid">
                <div class="legend-item">
                    <div class="legend-indicator">
                        <div class="sample-border"></div>
                    </div>
                    <div class="legend-content">
                        <div class="legend-text">Left Border</div>
                        <div class="legend-description">Individual staff member color</div>
                    </div>
                </div>
                
                <div class="legend-item">
                    <div class="legend-indicator">
                        <div class="sample-background"></div>
                    </div>
                    <div class="legend-content">
                        <div class="legend-text">Background</div>
                        <div class="legend-description">Translucent staff color</div>
                    </div>
                </div>
                
                {#if showPatterns}
                    <div class="legend-item">
                        <div class="legend-indicator">
                            <div class="sample-pattern pattern-dots"></div>
                        </div>
                        <div class="legend-content">
                            <div class="legend-text">Patterns</div>
                            <div class="legend-description">Department identification</div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .legend {
        margin-top: 30px;
        padding: 25px;
    }
    
    .legend h3 {
        color: white;
        margin-bottom: 20px;
        font-size: 1.2rem;
        text-align: center;
    }
    
    .legend-sections {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 25px;
    }
    
    .legend-section {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
    }
    
    .legend-section h4 {
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 15px;
        font-size: 1rem;
        font-weight: 500;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 8px;
    }
    
    .legend-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .legend-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 10px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        transition: background 0.3s ease;
    }
    
    .legend-item:hover {
        background: rgba(255, 255, 255, 0.08);
    }
    
    .legend-pattern {
        width: 60px;
        height: 24px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.1);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .pattern-text {
        font-size: 0.6rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.8);
        text-transform: uppercase;
        letter-spacing: 0.3px;
        position: relative;
        z-index: 1;
    }

    /* Pattern backgrounds for legend */
    .legend-pattern.pattern-dots::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
        background-size: 3px 3px;
        border-radius: 6px;
        pointer-events: none;
    }

    .legend-pattern.pattern-stripes::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.2) 0px, rgba(255, 255, 255, 0.2) 1px, transparent 1px, transparent 2px);
        border-radius: 6px;
        pointer-events: none;
    }

    .legend-pattern.pattern-waves::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0px, rgba(255, 255, 255, 0.2) 1px, transparent 1px, transparent 2px);
        border-radius: 6px;
        pointer-events: none;
    }

    .legend-pattern.pattern-grid::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
        background-size: 3px 3px;
        border-radius: 6px;
        pointer-events: none;
    }

    .legend-pattern.pattern-solid {
        border: 2px solid rgba(255, 255, 255, 0.4);
        font-weight: 600;
    }

    .section-description {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.8rem;
        margin-bottom: 10px;
        font-style: italic;
    }
    
    .legend-indicator {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .sample-border {
        width: 20px;
        height: 16px;
        border-left: 4px solid #4CAF50;
        background: rgba(76, 175, 80, 0.2);
        border-radius: 2px;
    }
    
    .sample-background {
        width: 20px;
        height: 16px;
        background: rgba(76, 175, 80, 0.3);
        border-radius: 2px;
    }
    
    .sample-pattern {
        width: 20px;
        height: 16px;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        background-size: 4px 4px;
    }
    
    .legend-content {
        flex: 1;
        min-width: 0;
    }
    
    .legend-text {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9rem;
        font-weight: 500;
        margin-bottom: 2px;
    }
    
    .legend-description {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.8rem;
        line-height: 1.3;
    }
    
    @media (max-width: 768px) {
        .legend-sections {
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .legend {
            padding: 20px;
        }
        
        .legend-item {
            padding: 8px;
        }
        
        .legend-color,
        .legend-indicator {
            width: 20px;
            height: 20px;
        }
    }
</style>
