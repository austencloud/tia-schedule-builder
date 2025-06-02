<script>
  import DayModal from './DayModal.svelte';
  import StaffProfileModal from './StaffProfileModal.svelte';

  let { days, staffList, updateDayData } = $props();
  
  let showModal = $state(false);
  let selectedDay = $state(null);
  let fullMonth = $state([]);
  let showStaffProfile = $state(false);
  let selectedStaff = $state(null);
  
  // Mobile detection
  let isMobile = $state(false);
  
  $effect(() => {
    if (typeof window !== 'undefined') {
      isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
      
      const handleResize = () => {
        isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  });
  
  function openDayModal(day) {
    selectedDay = day;
    showModal = true;
    
    // Add haptic feedback on mobile
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }
  
  function closeDayModal() {
    showModal = false;
    selectedDay = null;
  }

  function openStaffProfile(event, staffMember) {
    event.stopPropagation();
    selectedStaff = {
      ...staffMember,
      scheduledDates: getStaffScheduledDates(staffMember.name)
    };
    showStaffProfile = true;
    
    // Add haptic feedback on mobile
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(15);
    }
  }

  function closeStaffProfile() {
    showStaffProfile = false;
    selectedStaff = null;
  }

  function getStaffScheduledDates(staffName) {
    return fullMonth
      .filter(day => day.staff.some(s => s.name === staffName))
      .map(day => ({
        day: day.day,
        dayName: day.dayName,
        date: day.date,
        time: day.staff.find(s => s.name === staffName)?.time,
        role: day.staff.find(s => s.name === staffName)?.role
      }));
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
  
  function getShortDayName(day) {
    const date = new Date(2025, 5, day); // Month 5 = June (0-indexed)
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  $effect(() => {
    fullMonth = initializeMonth();
  });
</script>

<div class="section">
  <h2>📅 June 2025 Interactive Schedule Calendar</h2>
  
  <div class="calendar-container">
    {#if isMobile}
      <!-- Mobile-first calendar design -->
      <div class="mobile-calendar">
        {#each fullMonth as day}
          <button
            class="mobile-day-card"
            class:has-coverage={day.staff.length > 0}
            class:has-events={day.hasEvents}
            onclick={() => openDayModal(day)}
            aria-label="View and edit details for {day.dayName}, June {day.day}, 2025"
          >
            <div class="mobile-day-header">
              <div class="mobile-day-info">
                <span class="mobile-day-number">{day.day}</span>
                <span class="mobile-day-name">{getShortDayName(day.day)}</span>
              </div>
              {#if day.hasEvents}
                <div class="mobile-event-badge">{day.eventLabel}</div>
              {/if}
            </div>
            
            <div class="mobile-day-content">
              {#if day.staff.length > 0}
                <div class="mobile-staff-summary">
                  <div class="mobile-staff-count">{day.staff.length} staff</div>
                  <div class="mobile-hours">{day.totalHours}</div>
                </div>
                <div class="mobile-staff-preview">
                  {#each day.staff.slice(0, 2) as staffMember}
                    <div
                      class="mobile-staff-chip {staffMember.color}"
                      onclick={(e) => openStaffProfile(e, staffMember)}
                      role="button"
                      tabindex="0"
                      onkeydown={(e) => e.key === 'Enter' && openStaffProfile(e, staffMember)}
                      aria-label="View profile for {staffMember.name}"
                    >
                      {staffMember.name}
                    </div>
                  {/each}
                  {#if day.staff.length > 2}
                    <div class="mobile-more-indicator">+{day.staff.length - 2} more</div>
                  {/if}
                </div>
              {:else}
                <div class="mobile-no-staff">
                  <span class="mobile-no-staff-text">No staff scheduled</span>
                  <span class="mobile-tap-hint">Tap to add</span>
                </div>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    {:else}
      <!-- Desktop calendar grid -->
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
            onclick={() => openDayModal(day)}
            aria-label="View and edit details for {day.dayName}, June {day.day}, 2025"
          >
            <div class="day-number">{day.day}</div>
            
            {#if day.hasEvents}
              <div class="event-indicator">{day.eventLabel}</div>
            {/if}
            
            <div class="staff-badges-container">
              {#each day.staff as staffMember}
                <div
                  class="staff-badge {staffMember.color}"
                  onclick={(e) => openStaffProfile(e, staffMember)}
                  role="button"
                  tabindex="0"
                  onkeydown={(e) => e.key === 'Enter' && openStaffProfile(e, staffMember)}
                  aria-label="View profile for {staffMember.name}"
                >
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
    {/if}
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

{#if showStaffProfile && selectedStaff}
  <StaffProfileModal
    staff={selectedStaff}
    onClose={closeStaffProfile}
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

  .calendar-container {
    position: relative;
  }

  /* Mobile-first calendar design */
  .mobile-calendar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 4px;
  }

  .mobile-day-card {
    background: white;
    border: none;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    font-family: inherit;
    width: 100%;
    min-height: 88px;
    position: relative;
    border-left: 4px solid transparent;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .mobile-day-card:active {
    transform: scale(0.98);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }

  .mobile-day-card.has-coverage {
    border-left-color: #27ae60;
    background: linear-gradient(135deg, #f8fff8, #ffffff);
  }

  .mobile-day-card.has-events {
    border-right: 4px solid #f39c12;
  }

  .mobile-day-card.has-coverage.has-events {
    background: linear-gradient(135deg, #fff8f0, #ffffff);
  }

  .mobile-day-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .mobile-day-info {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .mobile-day-number {
    font-size: 1.8rem;
    font-weight: bold;
    color: #2c3e50;
    line-height: 1;
  }

  .mobile-day-name {
    font-size: 0.9rem;
    color: #7f8c8d;
    font-weight: 500;
  }

  .mobile-event-badge {
    background: #f39c12;
    color: white;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-day-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mobile-staff-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mobile-staff-count {
    font-size: 0.9rem;
    color: #34495e;
    font-weight: 600;
  }

  .mobile-hours {
    background: #34495e;
    color: white;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .mobile-staff-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .mobile-staff-chip {
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 0.8rem;
    font-weight: 500;
    color: white;
    background: #3498db;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .mobile-staff-chip:active {
    transform: scale(0.95);
  }

  .mobile-more-indicator {
    font-size: 0.75rem;
    color: #7f8c8d;
    font-weight: 500;
    padding: 4px 8px;
    background: #ecf0f1;
    border-radius: 12px;
  }

  .mobile-no-staff {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 0;
    gap: 4px;
  }

  .mobile-no-staff-text {
    color: #95a5a6;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .mobile-tap-hint {
    color: #bdc3c7;
    font-size: 0.75rem;
  }

  /* Desktop calendar styles (existing) */
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
    min-width: 44px; /* Ensure minimum touch target */
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
    /* Mobile touch optimization */
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
    touch-action: manipulation;
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
    cursor: pointer;
    background: none;
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  .staff-badge:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .staff-badge:active {
    transform: scale(0.98);
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

  /* Tablet responsive design */
  @media (max-width: 1024px) and (min-width: 769px) {
    .calendar-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    
    .calendar-day {
      min-height: 120px;
      padding: 12px;
    }
  }

  /* Small tablets */
  @media (max-width: 768px) and (min-width: 481px) {
    .mobile-calendar {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .mobile-day-card {
      min-height: 100px;
      padding: 16px;
    }
  }

  /* Touch device optimizations */
  @media (hover: none) and (pointer: coarse) {
    .calendar-day:hover {
      transform: none; /* Disable hover effects on touch devices */
    }

    .calendar-day:active {
      transform: scale(0.98);
      background: rgba(255, 255, 255, 1);
    }

    .staff-badge:hover {
      transform: none;
    }
  }
</style>