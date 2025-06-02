<script>
  import StaffEditor from './StaffEditor.svelte';
  import EventEditor from './EventEditor.svelte';
  import MobileModal from './MobileModal.svelte';

  let { day, staffList, onClose, onDayUpdate } = $props();

  // Detect mobile device
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
  
  let isEditing = $state(false);
  let editedDay = $state({});
  let showSuccessMessage = $state(false);
  
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }
  
  function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map(deepClone);
    
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  function startEdit() {
    editedDay = deepClone(day);
    isEditing = true;
  }
  
  function saveChanges() {
    // Update event indicators
    editedDay.hasEvents = editedDay.events.length > 0;
    if (editedDay.hasEvents) {
      if (editedDay.events.length === 1) {
        editedDay.eventLabel = editedDay.events[0].name.split(' ')[0];
      } else {
        editedDay.eventLabel = `${editedDay.events.length} Events`;
      }
    } else {
      editedDay.eventLabel = '';
    }
    
    // Calculate total hours (simple approximation)
    let totalHours = 0;
    editedDay.staff.forEach(staff => {
      const timeStr = staff.time.toLowerCase();
      if (timeStr.includes('-')) {
        // Simple hour calculation - this could be more sophisticated
        const hours = timeStr.split('-');
        if (hours.length === 2) {
          totalHours += 8; // Default assumption
        }
      }
    });
    editedDay.totalHours = totalHours > 0 ? `${totalHours}h` : '0h';
    
    onDayUpdate(day.day, editedDay);
    isEditing = false;
    showSuccessMessage = true;
    setTimeout(() => showSuccessMessage = false, 2000);
  }
  
  function cancelEdit() {
    editedDay = {};
    isEditing = false;
  }
  
  function addStaff() {
    const availableStaff = Object.values(staffList).find(staff => 
      !editedDay.staff.find(s => s.name === staff.name)
    );
    
    if (availableStaff) {
      editedDay.staff.push({
        name: availableStaff.name,
        time: '11am-5pm',
        role: '',
        color: availableStaff.color
      });
    }
  }
  
  function updateStaff(index, updatedStaff) {
    editedDay.staff[index] = { ...updatedStaff };
  }
  
  function deleteStaff(index) {
    editedDay.staff.splice(index, 1);
  }
  
  function addEvent() {
    editedDay.events.push({
      name: 'New Event',
      time: 'All day',
      type: 'special'
    });
  }
  
  function updateEvent(index, updatedEvent) {
    editedDay.events[index] = { ...updatedEvent };
  }
  
  function deleteEvent(index) {
    editedDay.events.splice(index, 1);
  }
  
  let currentDay = $derived(isEditing ? editedDay : day);
</script>

{#if isMobile}
  <MobileModal
    isOpen={true}
    {onClose}
    title="{currentDay.dayName}, June {currentDay.day}, 2025"
  >
    {#snippet children()}
      <div class="mobile-modal-header-actions">
        {#if !isEditing}
          <button class="mobile-edit-btn" onclick={startEdit}>
            ✏️ Edit Day
          </button>
        {/if}
      </div>

      {#if showSuccessMessage}
        <div class="success-message mobile">
          ✅ Day updated successfully!
        </div>
      {/if}

      <!-- Mobile-optimized content -->
      <div class="mobile-day-content">
        <div class="mobile-day-stats">
          <div class="mobile-stat">
            <span class="mobile-stat-value">{currentDay.totalHours}</span>
            <span class="mobile-stat-label">Total Hours</span>
          </div>
          <div class="mobile-stat">
            <span class="mobile-stat-value">{currentDay.staff.length}</span>
            <span class="mobile-stat-label">Staff Count</span>
          </div>
          <div class="mobile-stat">
            <span class="mobile-stat-value">{currentDay.events.length}</span>
            <span class="mobile-stat-label">Events</span>
          </div>
        </div>

        <!-- Mobile staff section -->
        <div class="mobile-section">
          <div class="mobile-section-header">
            <h4>👥 Staff Schedule</h4>
            {#if isEditing}
              <button class="mobile-add-btn" onclick={addStaff}>
                ➕ Add Staff
              </button>
            {/if}
          </div>

          {#if currentDay.staff.length > 0}
            <div class="mobile-staff-list">
              {#each currentDay.staff as staffMember, index}
                {#if isEditing}
                  <StaffEditor
                    {staffMember}
                    {staffList}
                    onUpdate={(updated) => updateStaff(index, updated)}
                    onDelete={() => deleteStaff(index)}
                  />
                {:else}
                  <div class="mobile-staff-item {staffMember.color}">
                    <div class="mobile-staff-info">
                      <span class="mobile-staff-name">{staffMember.name}</span>
                      <span class="mobile-staff-time">{staffMember.time}</span>
                      {#if staffMember.role}
                        <span class="mobile-staff-role">{staffMember.role}</span>
                      {/if}
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          {:else}
            <div class="mobile-no-content">
              <p>No staff scheduled for this day.</p>
              {#if isEditing}
                <button class="mobile-add-first-btn" onclick={addStaff}>
                  ➕ Add First Staff Member
                </button>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Mobile events section -->
        <div class="mobile-section">
          <div class="mobile-section-header">
            <h4>🎉 Events</h4>
            {#if isEditing}
              <button class="mobile-add-btn" onclick={addEvent}>
                ➕ Add Event
              </button>
            {/if}
          </div>

          {#if currentDay.events.length > 0}
            <div class="mobile-events-list">
              {#each currentDay.events as event, index}
                {#if isEditing}
                  <EventEditor
                    {event}
                    onUpdate={(updated) => updateEvent(index, updated)}
                    onDelete={() => deleteEvent(index)}
                  />
                {:else}
                  <div class="mobile-event-item">
                    <div class="mobile-event-info">
                      <span class="mobile-event-name">{event.name}</span>
                      <span class="mobile-event-time">{event.time}</span>
                      <span class="mobile-event-type">{event.type}</span>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          {:else}
            <div class="mobile-no-content">
              <p>No special events scheduled for this day.</p>
              {#if isEditing}
                <button class="mobile-add-first-btn" onclick={addEvent}>
                  ➕ Add First Event
                </button>
              {/if}
            </div>
          {/if}
        </div>

        {#if isEditing}
          <div class="mobile-edit-actions">
            <button class="mobile-save-btn" onclick={saveChanges}>
              ✅ Save Changes
            </button>
            <button class="mobile-cancel-btn" onclick={cancelEdit}>
              ❌ Cancel
            </button>
          </div>
        {/if}
      </div>
    {/snippet}
  </MobileModal>
{:else}
  <div 
    class="modal-backdrop" 
    onclick={handleBackdropClick} 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="modal-title" 
    tabindex="-1"
    onkeydown={(e) => e.key === 'Escape' && onClose()}
  >
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modal-title">{currentDay.dayName}, June {currentDay.day}, 2025</h3>
        <div class="header-actions">
          {#if !isEditing}
            <button class="edit-btn" onclick={startEdit} title="Edit this day">
              ✏️ Edit Day
            </button>
          {/if}
          <button class="close-btn" onclick={onClose}>×</button>
        </div>
      </div>
    
    {#if showSuccessMessage}
      <div class="success-message">
        ✅ Day updated successfully!
      </div>
    {/if}
    
    <div class="modal-body">
      <div class="day-stats">
        <div class="stat">
          <span class="stat-label">Total Hours:</span>
          <span class="stat-value">{currentDay.totalHours}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Staff Count:</span>
          <span class="stat-value">{currentDay.staff.length}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Events:</span>
          <span class="stat-value">{currentDay.events.length}</span>
        </div>
      </div>
      
      <div class="staff-section">
        <div class="section-header">
          <h4>👥 Staff Schedule</h4>
          {#if isEditing}
            <button class="add-btn" onclick={addStaff} title="Add staff member">
              ➕ Add Staff
            </button>
          {/if}
        </div>
        
        {#if currentDay.staff.length > 0}
          <div class="staff-list">
            {#each currentDay.staff as staffMember, index}
              {#if isEditing}
                <StaffEditor 
                  {staffMember} 
                  {staffList}
                  onUpdate={(updated) => updateStaff(index, updated)}
                  onDelete={() => deleteStaff(index)}
                />
              {:else}
                <div class="staff-item {staffMember.color}">
                  <div class="staff-info">
                    <span class="staff-name">{staffMember.name}</span>
                    <span class="staff-time">{staffMember.time}</span>
                    {#if staffMember.role}
                      <span class="staff-role">{staffMember.role}</span>
                    {/if}
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {:else}
          <div class="no-staff">
            <p>No staff scheduled for this day.</p>
            {#if isEditing}
              <button class="add-first-btn" onclick={addStaff}>
                ➕ Add First Staff Member
              </button>
            {/if}
          </div>
        {/if}
      </div>
      
      <div class="events-section">
        <div class="section-header">
          <h4>🎉 Events</h4>
          {#if isEditing}
            <button class="add-btn" onclick={addEvent} title="Add event">
              ➕ Add Event
            </button>
          {/if}
        </div>
        
        {#if currentDay.events.length > 0}
          <div class="events-list">
            {#each currentDay.events as event, index}
              {#if isEditing}
                <EventEditor 
                  {event}
                  onUpdate={(updated) => updateEvent(index, updated)}
                  onDelete={() => deleteEvent(index)}
                />
              {:else}
                <div class="event-item">
                  <div class="event-info">
                    <span class="event-name">{event.name}</span>
                    <span class="event-time">{event.time}</span>
                    <span class="event-type">{event.type}</span>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {:else}
          <div class="no-events">
            <p>No special events scheduled for this day.</p>
            {#if isEditing}
              <button class="add-first-btn" onclick={addEvent}>
                ➕ Add First Event
              </button>
            {/if}
          </div>
        {/if}
      </div>
      
      {#if isEditing}
        <div class="edit-actions">
          <button class="save-btn" onclick={saveChanges}>
            ✅ Save Changes
          </button>
          <button class="cancel-btn" onclick={cancelEdit}>
            ❌ Cancel
          </button>
        </div>
      {/if}
    </div>
  </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-content {
    background: white;
    border-radius: 15px;
    max-width: 700px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 15px 15px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.5em;
    font-weight: 300;
  }
  
  .header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  
  .edit-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.2s ease;
  }
  
  .edit-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 2em;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 15px;
    text-align: center;
    border-bottom: 1px solid #c3e6cb;
    font-weight: 600;
  }

  .modal-body {
    padding: 20px;
  }

  .day-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 25px;
  }

  .stat {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 10px;
    text-align: center;
    border-left: 4px solid #3498db;
  }

  .stat-label {
    display: block;
    font-size: 0.9em;
    color: #7f8c8d;
    margin-bottom: 5px;
  }

  .stat-value {
    display: block;
    font-size: 1.5em;
    font-weight: bold;
    color: #2c3e50;
  }

  .staff-section, .events-section {
    margin-bottom: 25px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .section-header h4 {
    color: #2c3e50;
    margin: 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #ecf0f1;
  }
  
  .add-btn, .add-first-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.2s ease;
  }
  
  .add-btn:hover, .add-first-btn:hover {
    background: #229954;
    transform: translateY(-1px);
  }

  .staff-list, .events-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .staff-item {
    padding: 15px;
    border-radius: 10px;
    color: white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .staff-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .staff-name {
    font-weight: bold;
    font-size: 1.1em;
  }

  .staff-time {
    font-size: 0.9em;
    opacity: 0.9;
  }

  .staff-role {
    font-size: 0.8em;
    opacity: 0.8;
    font-style: italic;
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 12px;
  }

  .event-item {
    background: linear-gradient(135deg, #f39c12, #e67e22);
    color: white;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  .event-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .event-name {
    font-weight: bold;
    font-size: 1.1em;
  }

  .event-time {
    font-size: 0.9em;
    opacity: 0.9;
  }
  
  .event-type {
    font-size: 0.8em;
    opacity: 0.8;
    font-style: italic;
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 12px;
    align-self: flex-start;
  }

  .no-events, .no-staff {
    text-align: center;
    color: #7f8c8d;
    font-style: italic;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
  }
  
  .edit-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    padding-top: 20px;
    border-top: 2px solid #ecf0f1;
  }
  
  .save-btn, .cancel-btn {
    padding: 12px 30px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1em;
    transition: all 0.2s ease;
  }
  
  .save-btn {
    background: #27ae60;
    color: white;
  }
  
  .save-btn:hover {
    background: #229954;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  
  .cancel-btn {
    background: #e74c3c;
    color: white;
  }
  
  .cancel-btn:hover {
    background: #c0392b;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  /* Mobile-specific styles */
  .mobile-modal-header-actions {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .mobile-edit-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    min-height: 44px;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .mobile-edit-btn:active {
    transform: scale(0.95);
    background: #5a6fd8;
  }

  .success-message.mobile {
    background: #d4edda;
    color: #155724;
    padding: 12px;
    text-align: center;
    border-radius: 8px;
    margin-bottom: 20px;
    font-weight: 600;
  }

  .mobile-day-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }

  .mobile-stat {
    background: #f8f9fa;
    padding: 16px 12px;
    border-radius: 12px;
    text-align: center;
    border-left: 4px solid #3498db;
  }

  .mobile-stat-value {
    display: block;
    font-size: 1.4em;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 4px;
  }

  .mobile-stat-label {
    display: block;
    font-size: 0.85em;
    color: #7f8c8d;
  }

  .mobile-section {
    margin-bottom: 24px;
  }

  .mobile-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .mobile-section-header h4 {
    color: #2c3e50;
    margin: 0;
    font-size: 1.1em;
    font-weight: 600;
  }

  .mobile-add-btn, .mobile-add-first-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 0.9em;
    font-weight: 600;
    cursor: pointer;
    min-height: 44px;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .mobile-add-btn:active, .mobile-add-first-btn:active {
    transform: scale(0.95);
    background: #229954;
  }

  .mobile-staff-list, .mobile-events-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mobile-staff-item {
    padding: 16px;
    border-radius: 12px;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .mobile-staff-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mobile-staff-name {
    font-weight: bold;
    font-size: 1.1em;
  }

  .mobile-staff-time {
    font-size: 0.95em;
    opacity: 0.9;
  }

  .mobile-staff-role {
    font-size: 0.85em;
    opacity: 0.8;
    font-style: italic;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    border-radius: 12px;
    align-self: flex-start;
    margin-top: 4px;
  }

  .mobile-event-item {
    background: linear-gradient(135deg, #f39c12, #e67e22);
    color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .mobile-event-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mobile-event-name {
    font-weight: bold;
    font-size: 1.1em;
  }

  .mobile-event-time {
    font-size: 0.95em;
    opacity: 0.9;
  }

  .mobile-event-type {
    font-size: 0.85em;
    opacity: 0.8;
    font-style: italic;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    border-radius: 12px;
    align-self: flex-start;
    margin-top: 4px;
  }

  .mobile-no-content {
    text-align: center;
    color: #7f8c8d;
    font-style: italic;
    padding: 24px;
    background: #f8f9fa;
    border-radius: 12px;
  }

  .mobile-edit-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 2px solid #ecf0f1;
  }

  .mobile-save-btn, .mobile-cancel-btn {
    padding: 16px;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    min-height: 44px;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .mobile-save-btn {
    background: #27ae60;
    color: white;
  }

  .mobile-save-btn:active {
    transform: scale(0.98);
    background: #229954;
  }

  .mobile-cancel-btn {
    background: #e74c3c;
    color: white;
  }

  .mobile-cancel-btn:active {
    transform: scale(0.98);
    background: #c0392b;
  }

  @media (max-width: 600px) {
    .modal-content {
      margin: 10px;
      max-height: 95vh;
    }

    .day-stats {
      grid-template-columns: 1fr;
    }

    .staff-info {
      flex-direction: column;
      align-items: flex-start;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .edit-actions {
      flex-direction: column;
    }
  }
</style>