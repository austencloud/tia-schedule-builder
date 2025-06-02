<script>
  let { event, onUpdate, onDelete } = $props();
  
  let isEditing = $state(false);
  let editedEvent = $state({});
  
  const eventTypes = ['recurring', 'special', 'workshop', 'outreach', 'internal'];
  
  function startEdit() {
    editedEvent = { ...event };
    isEditing = true;
  }
  
  function saveEdit() {
    onUpdate(editedEvent);
    isEditing = false;
  }
  
  function cancelEdit() {
    editedEvent = {};
    isEditing = false;
  }
  
  function handleDelete() {
    if (confirm(`Remove event "${event.name}"?`)) {
      onDelete();
    }
  }
</script>

{#if isEditing}
  <div class="event-editor">
    <div class="edit-form">
      <div class="form-row">
        <label>
          Event Name:
          <input 
            type="text" 
            bind:value={editedEvent.name} 
            placeholder="e.g., Cat Jam, Paint & Sip"
          />
        </label>
        
        <label>
          Time:
          <input 
            type="text" 
            bind:value={editedEvent.time} 
            placeholder="e.g., 7:00 pm - 10:00 pm"
          />
        </label>
      </div>
      
      <div class="form-row">
        <label>
          Event Type:
          <select bind:value={editedEvent.type}>
            {#each eventTypes as type}
              <option value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            {/each}
          </select>
        </label>
      </div>
      
      <div class="form-actions">
        <button class="save-btn" onclick={saveEdit} disabled={!editedEvent.name || !editedEvent.time}>
          ✓ Save
        </button>
        <button class="cancel-btn" onclick={cancelEdit}>
          ✕ Cancel
        </button>
      </div>
    </div>
  </div>
{:else}
  <div class="event-item" class:recurring={event.type === 'recurring'} class:special={event.type === 'special'} class:workshop={event.type === 'workshop'} class:outreach={event.type === 'outreach'} class:internal={event.type === 'internal'}>
    <div class="event-info">
      <span class="event-name">{event.name}</span>
      <span class="event-time">{event.time}</span>
      <span class="event-type">{event.type}</span>
    </div>
    <div class="event-actions">
      <button class="edit-btn" onclick={startEdit} title="Edit event">
        ✏️
      </button>
      <button class="delete-btn" onclick={handleDelete} title="Remove event">
        🗑️
      </button>
    </div>
  </div>
{/if}

<style>
  .event-item {
    padding: 15px;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    color: white;
  }
  
  .event-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  .event-item.recurring {
    background: linear-gradient(135deg, #27ae60, #2ecc71);
  }
  
  .event-item.special {
    background: linear-gradient(135deg, #9c27b0, #8e24aa);
  }
  
  .event-item.workshop {
    background: linear-gradient(135deg, #f39c12, #e67e22);
  }
  
  .event-item.outreach {
    background: linear-gradient(135deg, #4caf50, #388e3c);
  }
  
  .event-item.internal {
    background: linear-gradient(135deg, #607d8b, #455a64);
  }

  .event-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex: 1;
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
  
  .event-actions {
    display: flex;
    gap: 8px;
    margin-left: 10px;
  }
  
  .edit-btn, .delete-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 6px;
    padding: 6px 8px;
    cursor: pointer;
    font-size: 0.8em;
    transition: all 0.2s ease;
    color: white;
  }
  
  .edit-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
  
  .delete-btn:hover {
    background: rgba(255, 0, 0, 0.3);
    transform: scale(1.1);
  }

  .event-editor {
    background: white;
    border-radius: 10px;
    padding: 20px;
    border: 2px solid #f39c12;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .form-row:last-of-type {
    grid-template-columns: 1fr;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-weight: 600;
    color: #2c3e50;
  }

  input, select {
    padding: 12px 16px; /* Increased for better touch targets */
    border: 2px solid #ecf0f1;
    border-radius: 8px;
    font-size: 1rem; /* Increased for better readability */
    transition: border-color 0.2s ease;
    min-height: 44px; /* Ensure minimum touch target */
    -webkit-appearance: none; /* Remove default styling on iOS */
    appearance: none; /* Standard property */
  }

  input:focus, select:focus {
    outline: none;
    border-color: #f39c12;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .save-btn, .cancel-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    min-height: 44px; /* Ensure minimum touch target */
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .save-btn {
    background: #f39c12;
    color: white;
  }

  .save-btn:hover:not(:disabled) {
    background: #e67e22;
    transform: translateY(-1px);
  }

  .save-btn:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }

  .cancel-btn {
    background: #95a5a6;
    color: white;
  }

  .cancel-btn:hover {
    background: #7f8c8d;
    transform: translateY(-1px);
  }

  @media (max-width: 600px) {
    .form-row {
      grid-template-columns: 1fr;
    }
    
    .event-info {
      margin-bottom: 10px;
    }
    
    .event-actions {
      margin-left: 0;
    }
  }
</style>