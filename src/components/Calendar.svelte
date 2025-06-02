<script>
  import DayModal from './DayModal.svelte';

  let { days, staffList, updateDayData } = $props();
  
  let showModal = $state(false);
  let selectedDay = $state(null);
  let fullMonth = $state([]);
  
  function openDayModal(day) {
    selectedDay = day;
    showModal = true;
  }
  
  function closeDayModal() {
    showModal = false;
    selectedDay = null;
  }
  
  function handleDayUpdate(dayNumber, updatedDay) {
    updateDayData(dayNumber, updatedDay);
  }
  
  function initializeMonth() {
    const month = [];
    for (let i = 1; i <= 30; i++) {
      const existingDay = days.find(d => d.day === i);
      if (existingDay) {
        month.push(existingDay);
      } else {
        month.push({
          day: i,
          date: `2025-06-${i.toString().padStart(2, '0')}`,
          dayName: getDayName(i),
          totalHours: '0h',
          hasEvents: false,
          eventLabel: '',
          staff: [],
          events: []
        });
      }
    }
    return month;
  }
  
  function getDayName(day) {
    const date = new Date(2025, 5, day); // Month 5 = June (0-indexed)
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  $effect(() => {
    fullMonth = initializeMonth();
  });
</script>

<div class="section">
  <h2>📅 June 2025 Interactive Schedule Calendar</h2>
  <div class="interactive-info">
    <strong>💡 Interactive Feature:</strong> Click any day to view and edit
    detailed staff schedules, event information, and operational notes!
    <br>
    <strong>✏️ Edit Mode:</strong> Click "Edit Day" in the modal to modify staff assignments and events.
  </div>
  
  <div class="calendar-grid">
    <div class="calendar-header">Sun</div>
    <div class="calendar-header">Mon</div>
    <div class="calendar-header">Tue</div>
    <div class="calendar-header">Wed</div>
    <div class="calendar-header">Thu</div>
    <div class="calendar-header">Fri</div>
    <div class="calendar-header">Sat</div>

    {#each fullMonth as day}
      <button
        class="calendar-day"
        class:has-coverage={day.staff.length > 0}
        class:has-events={day.hasEvents}
        data-day={day.day}
        data-date={day.date}
        onclick={() => openDayModal(day)}
        aria-label="View and edit details for {day.dayName}, June {day.day}, 2025"
      >
        <div class="day-number">{day.day}</div>
        
        {#if day.hasEvents}
          <div class="event-indicator">{day.eventLabel}</div>
        {/if}
        
        <div class="staff-badges-container">
          {#each day.staff as staffMember}
            <div class="staff-badge {staffMember.color}">
              <span class="staff-name">{staffMember.name}</span>
              <span class="staff-time">{staffMember.time}</span>
              {#if staffMember.role}
                <span class="staff-role">{staffMember.role}</span>
              {/if}
            </div>
          {/each}
        </div>
        
        <div class="day-total">{day.totalHours}</div>
        
        {#if day.staff.length === 0}
          <div class="no-staff-indicator">No staff</div>
        {/if}
      </button>
    {/each}
  </div>
</div>

{#if showModal && selectedDay}
  <DayModal 
    day={selectedDay} 
    {staffList}
    onClose={closeDayModal} 
    onDayUpdate={handleDayUpdate}
  />
{/if}

<style>
  .section {
    margin-bottom: 40px;
  }

  .section h2 {
    color: #2c3e50;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #ecf0f1;
    font-size: 1.8em;
  }

  .interactive-info {
    background: linear-gradient(135deg, #e3f2fd, #fff3e0);
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 20px;
    text-align: center;
    border-left: 4px solid #2196f3;
    line-height: 1.6;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 15px;
    overflow: hidden;
    margin-bottom: 30px;
    padding: 3px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .calendar-header {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: white;
    padding: 15px 10px;
    text-align: center;
    font-weight: bold;
    font-size: 0.9em;
    letter-spacing: 1px;
  }

  .calendar-day {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    min-height: 140px;
    padding: 10px;
    position: relative;
    font-size: 0.85em;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 2px solid transparent;
    font-family: inherit;
    text-align: left;
  }

  .calendar-day:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
  }

  .calendar-day.has-coverage {
    border-left: 4px solid #27ae60;
    background: rgba(232, 245, 232, 0.95);
  }
  
  .calendar-day.has-events {
    border-right: 4px solid #f39c12;
  }
  
  .calendar-day.has-coverage.has-events {
    background: rgba(255, 248, 220, 0.95);
  }

  .day-number {
    font-weight: bold;
    font-size: 1.2em;
    margin-bottom: 8px;
    color: #2c3e50;
    text-align: center;
    padding: 2px;
  }

  .staff-badges-container {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex-grow: 1;
    overflow: hidden;
    max-height: 90px;
  }

  .staff-badge {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 0.7em;
    font-weight: 500;
    color: white;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    margin-bottom: 2px;
    min-height: 20px;
  }

  .staff-badge:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .staff-name {
    font-weight: 600;
    margin-right: 4px;
  }

  .staff-time {
    font-size: 0.9em;
    opacity: 0.9;
  }

  .staff-role {
    font-size: 0.8em;
    opacity: 0.8;
    font-style: italic;
    margin-left: 4px;
  }

  .day-total {
    position: absolute;
    bottom: 5px;
    right: 8px;
    background: linear-gradient(135deg, #34495e, #2c3e50);
    color: white;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.7em;
    font-weight: bold;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .event-indicator {
    position: absolute;
    top: 5px;
    right: 5px;
    background: #f39c12;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.6em;
    font-weight: bold;
    max-width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .no-staff-indicator {
    position: absolute;
    bottom: 25px;
    left: 8px;
    color: #7f8c8d;
    font-size: 0.7em;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .calendar-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .calendar-grid {
      grid-template-columns: 1fr;
    }
  }
</style>