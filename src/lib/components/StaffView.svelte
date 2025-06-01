<script>
    import { scheduleStore } from '../stores/scheduleStore.svelte.js';
    import { staffInfo } from '../data/scheduleData.js';
    
    const { 
        staffHoursSummary,
        getStaffColor,
        selectStaff,
        selectedStaff
    } = scheduleStore;
    
    const sortedStaff = $derived(Object.entries(staffHoursSummary).sort((a, b) => b[1].totalHours - a[1].totalHours));
</script>

<div class="staff-view">
    <h2>Staff Summary</h2>
    
    <div class="staff-grid">
        {#each sortedStaff as [staffName, summary]}
            <div 
                class="staff-card"
                class:selected={selectedStaff === staffName}
                style="border-left-color: {getStaffColor(staffName)};"
                onclick={() => selectStaff(staffName)}
            >
                <div class="staff-header">
                    <h3>{staffName}</h3>
                    <div class="staff-tier">{summary.info.tier}</div>
                </div>
                
                <div class="staff-stats">
                    <div class="stat">
                        <span class="stat-label">Total Hours</span>
                        <span class="stat-value">{summary.totalHours}h</span>
                    </div>
                    
                    <div class="stat">
                        <span class="stat-label">Shifts</span>
                        <span class="stat-value">{summary.shifts}</span>
                    </div>
                    
                    <div class="stat">
                        <span class="stat-label">Hourly Rate</span>
                        <span class="stat-value">${summary.info.hourlyRate}</span>
                    </div>
                    
                    <div class="stat">
                        <span class="stat-label">Weekly Cost</span>
                        <span class="stat-value">${(summary.totalHours * summary.info.hourlyRate).toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="departments">
                    <span class="departments-label">Departments:</span>
                    <div class="department-tags">
                        {#each Array.from(summary.departments) as dept}
                            <span class="department-tag">{dept}</span>
                        {/each}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .staff-view {
        padding: 20px;
    }
    
    .staff-view h2 {
        color: white;
        margin-bottom: 25px;
        font-size: 1.5rem;
        text-align: center;
    }
    
    .staff-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
    }
    
    .staff-card {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 15px;
        padding: 20px;
        border-left: 4px solid;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .staff-card:hover {
        background: rgba(255, 255, 255, 0.12);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
    
    .staff-card.selected {
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
    }
    
    .staff-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    
    .staff-header h3 {
        color: white;
        font-size: 1.2rem;
        margin: 0;
    }
    
    .staff-tier {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 0.8rem;
        text-transform: capitalize;
    }
    
    .staff-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 15px;
    }
    
    .stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .stat-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .stat-value {
        color: white;
        font-size: 1.1rem;
        font-weight: 600;
    }
    
    .departments {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 15px;
    }
    
    .departments-label {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
        margin-bottom: 8px;
        display: block;
    }
    
    .department-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
    
    .department-tag {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 4px 8px;
        border-radius: 10px;
        font-size: 0.8rem;
        text-transform: capitalize;
    }
    
    @media (max-width: 768px) {
        .staff-grid {
            grid-template-columns: 1fr;
        }
        
        .staff-stats {
            grid-template-columns: 1fr;
            gap: 10px;
        }
    }
</style>
