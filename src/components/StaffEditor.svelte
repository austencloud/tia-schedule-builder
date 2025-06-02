<script>
  let { staffMember, staffList, onUpdate, onDelete } = $props();
  
  let isEditing = $state(false);
  let editedStaff = $state({});
  
  function startEdit() {
    editedStaff = { ...staffMember };
    isEditing = true;
  }
  
  function saveEdit() {
    onUpdate(editedStaff);
    isEditing = false;
  }
  
  function cancelEdit() {
    editedStaff = {};
    isEditing = false;
  }
  
  function handleDelete() {
    if (confirm(`Remove ${staffMember.name} from this day?`)) {
      onDelete();
    }
  }
  
  // Time validation
  function validateTime(timeStr) {
    const timePattern = /^(\d{1,2})(:\d{2})?\s*(am|pm)?(\s*-\s*(\d{1,2})(:\d{2})?\s*(am|pm)?)?$/i;
    return timePattern.test(timeStr.trim());
  }
</script>

{#if isEditing}
  <div class="staff-editor">
    <div class="edit-form">
      <div class="form-row">
        <label>
          Name:
          <select bind:value={editedStaff.name}>
            {#each Object.values(staffList) as staff}
              <option value={staff.name}>{staff.name}</option>
            {/each}
          </select>
        </label>
        
        <label>
          Time:
          <input
            type="time"
            bind:value={editedStaff.time}
            placeholder="e.g., 11am-5pm"
            class:invalid={editedStaff.time && !validateTime(editedStaff.time)}
            inputmode="numeric"
          />
        </label>
      </div>
      
      <div class="form-row">
        <label>
          Role (optional):
          <input 
            type="text" 
            bind:value={editedStaff.role} 
            placeholder="e.g., Animal, Lab, Training"
          />
        </label>
        
        <label>
          Color:
          <select bind:value={editedStaff.color}>
            {#each Object.values(staffList) as staff}
              <option value={staff.color}>{staff.name} Color</option>
            {/each}
          </select>
        </label>
      </div>
      
      <div class="form-actions">
        <button class="save-btn" onclick={saveEdit} disabled={!editedStaff.name || !editedStaff.time || (editedStaff.time && !validateTime(editedStaff.time))}>
          ✓ Save
        </button>
        <button class="cancel-btn" onclick={cancelEdit}>
          ✕ Cancel
        </button>
      </div>
    </div>
  </div>
{:else}
  <div class="staff-item {staffMember.color}">
    <div class="staff-info">
      <span class="staff-name">{staffMember.name}</span>
      <span class="staff-time">{staffMember.time}</span>
      {#if staffMember.role}
        <span class="staff-role">{staffMember.role}</span>
      {/if}
    </div>
    <div class="staff-actions">
      <button class="edit-btn" onclick={startEdit} title="Edit staff member">
        ✏️
      </button>
      <button class="delete-btn" onclick={handleDelete} title="Remove staff member">
        🗑️
      </button>
    </div>
  </div>
{/if}

<style>
  .staff-item {
    padding: 15px;
    border-radius: 10px;
    color: white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
  }
  
  .staff-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  .staff-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    flex: 1;
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
  
  .staff-actions {
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

  .staff-editor {
    background: white;
    border-radius: 10px;
    padding: 20px;
    border: 2px solid #3498db;
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
    border-color: #3498db;
  }

  input.invalid {
    border-color: #e74c3c;
    background: #fdf2f2;
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
    background: #27ae60;
    color: white;
  }

  .save-btn:hover:not(:disabled) {
    background: #229954;
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
    
    .staff-info {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .staff-actions {
      margin-left: 0;
      margin-top: 10px;
    }
  }
</style>