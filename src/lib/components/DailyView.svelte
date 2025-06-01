<script>
    import { scheduleStore } from '../stores/scheduleStore.svelte.js';
    import { scheduleData } from '../data/scheduleData.js';
    import ShiftCard from './ShiftCard.svelte';
    
    const { 
        selectedDay,
        selectDay 
    } = scheduleStore;
    
    const currentDay = $derived(selectedDay ? scheduleData.find(d => d.day === selectedDay) : scheduleData[0]);
    
    function handleDaySelect(event) {
        selectDay(event.target.value);
    }
</script>

<div class="daily-view">
    <div class="day-selector">
        <label for="day-select">Select Day:</label>
        <select id="day-select" value={currentDay.day} onchange={handleDaySelect}>
            {#each scheduleData as day}
                <option value={day.day}>{day.day} - {day.date}</option>
            {/each}
        </select>
    </div>
    
    <div class="day-detail">
        <div class="day-info">
            <h2>{currentDay.day}</h2>
            <p class="day-date">{currentDay.date}</p>
            <p class="day-hours">{currentDay.hours}</p>
            <div class="day-stats">
                <span class="stat">
                    <strong>{currentDay.totalHours}h</strong> total
                </span>
                <span class="stat">
                    <strong>{currentDay.shifts.length}</strong> staff
                </span>
            </div>
        </div>
        
        <div class="timeline">
            <h3>Schedule Timeline</h3>
            <div class="timeline-container">
                {#each currentDay.shifts as shift, index}
                    <div class="timeline-item" style="--delay: {index * 0.1}s">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <ShiftCard {shift} />
                        </div>
                    </div>
                {/each}
                
                {#if currentDay.shifts.length === 0}
                    <div class="no-shifts-message">
                        <p>No shifts scheduled for this day</p>
                    </div>
                {/if}
            </div>
        </div>
        
        <div class="coverage-analysis">
            <h3>Coverage Analysis</h3>
            <div class="coverage-grid">
                <div class="coverage-item">
                    <span class="coverage-label">Animal Care Staff</span>
                    <span class="coverage-value">
                        {currentDay.shifts.filter(s => s.department === 'animal-care').length}
                    </span>
                </div>
                
                <div class="coverage-item">
                    <span class="coverage-label">Lab Staff</span>
                    <span class="coverage-value">
                        {currentDay.shifts.filter(s => s.department === 'lab').length}
                    </span>
                </div>
                
                <div class="coverage-item">
                    <span class="coverage-label">Front Desk Staff</span>
                    <span class="coverage-value">
                        {currentDay.shifts.filter(s => s.department === 'front-desk').length}
                    </span>
                </div>
                
                <div class="coverage-item">
                    <span class="coverage-label">Trainees</span>
                    <span class="coverage-value">
                        {currentDay.shifts.filter(s => s.type === 'trainee').length}
                    </span>
                </div>
                
                <div class="coverage-item">
                    <span class="coverage-label">Volunteers</span>
                    <span class="coverage-value">
                        {currentDay.shifts.filter(s => s.type === 'volunteer').length}
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .daily-view {
        padding: 20px;
    }
    
    .day-selector {
        margin-bottom: 30px;
        text-align: center;
    }
    
    .day-selector label {
        color: white;
        margin-right: 10px;
        font-weight: 500;
    }
    
    .day-selector select {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: white;
        padding: 8px 12px;
        font-size: 1rem;
    }
    
    .day-selector select option {
        background: #333;
        color: white;
    }
    
    .day-detail {
        display: grid;
        grid-template-columns: 300px 1fr 250px;
        gap: 30px;
    }
    
    .day-info {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 15px;
        padding: 25px;
        height: fit-content;
    }
    
    .day-info h2 {
        color: white;
        font-size: 2rem;
        margin-bottom: 10px;
    }
    
    .day-date {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.1rem;
        margin-bottom: 8px;
    }
    
    .day-hours {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1rem;
        margin-bottom: 20px;
    }
    
    .day-stats {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .stat {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1rem;
    }
    
    .timeline {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 25px;
    }
    
    .timeline h3 {
        color: white;
        margin-bottom: 20px;
        font-size: 1.3rem;
    }
    
    .timeline-container {
        position: relative;
    }
    
    .timeline-container::before {
        content: '';
        position: absolute;
        left: 15px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
    }
    
    .timeline-item {
        position: relative;
        margin-bottom: 20px;
        padding-left: 40px;
        animation: slideIn 0.5s ease-out var(--delay, 0s) both;
    }
    
    .timeline-marker {
        position: absolute;
        left: 8px;
        top: 15px;
        width: 14px;
        height: 14px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.3);
    }
    
    .timeline-content {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 5px;
    }
    
    .no-shifts-message {
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
        font-style: italic;
        padding: 40px;
    }
    
    .coverage-analysis {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 15px;
        padding: 25px;
        height: fit-content;
    }
    
    .coverage-analysis h3 {
        color: white;
        margin-bottom: 20px;
        font-size: 1.2rem;
    }
    
    .coverage-grid {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .coverage-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
    }
    
    .coverage-label {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
    }
    
    .coverage-value {
        color: white;
        font-weight: 600;
        font-size: 1.1rem;
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 8px;
        border-radius: 6px;
        min-width: 30px;
        text-align: center;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @media (max-width: 1024px) {
        .day-detail {
            grid-template-columns: 1fr;
            gap: 20px;
        }
    }
    
    @media (max-width: 768px) {
        .timeline-item {
            padding-left: 30px;
        }
        
        .timeline-marker {
            left: 5px;
            width: 10px;
            height: 10px;
        }
        
        .timeline-container::before {
            left: 10px;
        }
    }
</style>
