<script>
  let { staff, onClose, onOpenDay } = $props();
  
  let isMobile = $state(false);
  let isEditing = $state(false);
  let editedStaff = $state({});
  let showSuccessMessage = $state(false);
  
  $effect(() => {
    if (typeof window !== 'undefined') {
      isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  });

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function startEdit() {
    editedStaff = {
      ...staff,
      contact: { ...getStaffContact(staff.name) },
      emergencyContact: getEmergencyContact(staff.name),
      medicalInfo: getMedicalInfo(staff.name)
    };
    isEditing = true;
  }

  function saveEdit() {
    // Save to localStorage
    const existingProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}');
    existingProfiles[staff.name] = {
      contact: editedStaff.contact,
      emergencyContact: editedStaff.emergencyContact,
      medicalInfo: editedStaff.medicalInfo
    };
    localStorage.setItem('staffProfiles', JSON.stringify(existingProfiles));
    
    showSuccessMessage = true;
    setTimeout(() => showSuccessMessage = false, 3000);
    isEditing = false;
  }

  function cancelEdit() {
    editedStaff = {};
    isEditing = false;
  }

  function handleDayClick(schedule) {
    onClose();
    if (onOpenDay) {
      onOpenDay(schedule.day);
    }
  }

  function getStaffSkills(staffName) {
    const skillsMap = {
      'Rob': ['Animal Care Specialist', 'Lab Management', 'Teaching', 'Event Coordination'],
      'Grace': ['Animal Care', 'Customer Service', 'Lab Support', 'Lunar Event Specialist'],
      'Domingo': ['Event Management', 'Class Instruction', 'Community Outreach', 'Teaching'],
      'Athena': ['Lab Specialist', 'Research', 'Equipment Maintenance', 'Class Instruction'],
      'Miranda': ['Animal Care', 'Paint & Sip Instructor', 'Yoga Instructor', 'Event Planning'],
      'Taylor': ['Animal Care Specialist', 'Maintenance', 'Customer Service', 'Tabling Events'],
      'Gemma': ['Guest Services', 'Customer Relations', 'Event Support', 'Field Studies'],
      'Bayla': ['Lab Specialist', 'Class Instruction', 'Reptile Care', 'Field Research'],
      'Morph': ['Desk Operations', 'Customer Service', 'Facility Management', 'General Support'],
      'Emilie': ['Animal Care Lead', 'Training Coordinator', 'Customer Service', 'Closing Procedures'],
      'Cam': ['Lab Operations', 'Training', 'Animal Care', 'Closing Supervisor', 'Shadow Training'],
      'Courtney': ['Guest Services', 'Customer Relations', 'Event Support', 'Weekend Operations']
    };
    return skillsMap[staffName] || ['General Staff', 'Customer Service', 'Team Collaboration'];
  }

  function getStaffContact(staffName) {
    const savedProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}');
    return savedProfiles[staffName]?.contact || { 
      email: 'staff@tiamuseum.org', 
      phone: '(555) 555-5555', 
      department: 'General Staff' 
    };
  }

  function getEmergencyContact(staffName) {
    const savedProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}');
    return savedProfiles[staffName]?.emergencyContact || { 
      name: 'John Smith', 
      relationship: 'Emergency Contact', 
      phone: '(555) 555-5555' 
    };
  }

  function getMedicalInfo(staffName) {
    const savedProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}');
    return savedProfiles[staffName]?.medicalInfo || { 
      allergies: 'None known', 
      medications: 'None', 
      conditions: 'None' 
    };
  }

  let skills = $derived(getStaffSkills(staff.name));
  let contact = $derived(isEditing ? editedStaff.contact : getStaffContact(staff.name));
  let emergencyContact = $derived(isEditing ? editedStaff.emergencyContact : getEmergencyContact(staff.name));
  let medicalInfo = $derived(isEditing ? editedStaff.medicalInfo : getMedicalInfo(staff.name));
</script>

<div 
  class="modal-backdrop" 
  onclick={handleBackdropClick}
  role="dialog"
  aria-modal="true"
  aria-labelledby="staff-profile-title"
  tabindex="-1"
  onkeydown={(e) => e.key === 'Escape' && onClose()}
>
  <div class="modal-content" class:mobile={isMobile}>
    <div class="modal-header">
      <div class="staff-header-info">
        <div class="staff-avatar {staff.color}">
          {staff.name.charAt(0)}
        </div>
        <div class="staff-basic-info">
          <h2>{staff.name}</h2>
          <p class="staff-department">{contact.department}</p>
        </div>
      </div>
      <button class="close-btn" onclick={onClose}>×</button>
    </div>

    <div class="modal-body">
      <div class="info-section">
        <h3>📞 Contact Information</h3>
        {#if isEditing}
          <div class="edit-form">
            <div class="form-row">
              <label>
                Email:
                <input type="email" bind:value={editedStaff.contact.email} />
              </label>
              <label>
                Phone:
                <input type="tel" bind:value={editedStaff.contact.phone} />
              </label>
            </div>
            <div class="form-row">
              <label>
                Department:
                <input type="text" bind:value={editedStaff.contact.department} />
              </label>
            </div>
          </div>
        {:else}
          <div class="contact-grid">
            <div class="contact-item">
              <span class="contact-label">Email:</span>
              <span class="contact-value">{contact.email}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Phone:</span>
              <span class="contact-value">{contact.phone}</span>
            </div>
          </div>
        {/if}
      </div>

      <div class="info-section">
        <h3>🛠️ Skills & Certifications</h3>
        <div class="skills-grid">
          {#each skills as skill}
            <div class="skill-badge">{skill}</div>
          {/each}
        </div>
      </div>

      <div class="info-section">
        <h3>📅 Scheduled Dates ({staff.scheduledDates?.length || 0} days)</h3>
        {#if staff.scheduledDates && staff.scheduledDates.length > 0}
          <div class="schedule-list">
            {#each staff.scheduledDates as schedule}
              <div class="schedule-item" onclick={() => handleDayClick(schedule)}>
                <div class="schedule-date">
                  <span class="schedule-day">{schedule.day}</span>
                  <span class="schedule-day-name">{schedule.dayName}</span>
                </div>
                <div class="schedule-details">
                  <span class="schedule-time">{schedule.time}</span>
                  {#if schedule.role}
                    <span class="schedule-role">{schedule.role}</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="no-schedule">
            <p>No scheduled dates this month</p>
          </div>
        {/if}
      </div>

      <div class="info-section">
        <h3>🚑 Emergency Contact</h3>
        {#if isEditing}
          <div class="edit-form">
            <div class="form-row">
              <label>
                Name:
                <input type="text" bind:value={editedStaff.emergencyContact.name} />
              </label>
              <label>
                Relationship:
                <input type="text" bind:value={editedStaff.emergencyContact.relationship} />
              </label>
            </div>
            <div class="form-row">
              <label>
                Phone:
                <input type="tel" bind:value={editedStaff.emergencyContact.phone} />
              </label>
            </div>
          </div>
        {:else}
          <div class="contact-grid">
            <div class="contact-item">
              <span class="contact-label">Name:</span>
              <span class="contact-value">{emergencyContact.name}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Relationship:</span>
              <span class="contact-value">{emergencyContact.relationship}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Phone:</span>
              <span class="contact-value">{emergencyContact.phone}</span>
            </div>
          </div>
        {/if}
      </div>

      <div class="info-section">
        <h3>💊 Medical Information</h3>
        {#if isEditing}
          <div class="edit-form">
            <div class="form-row">
              <label>
                Allergies:
                <input type="text" bind:value={editedStaff.medicalInfo.allergies} />
              </label>
              <label>
                Medications:
                <input type="text" bind:value={editedStaff.medicalInfo.medications} />
              </label>
            </div>
            <div class="form-row">
              <label>
                Medical Conditions:
                <input type="text" bind:value={editedStaff.medicalInfo.conditions} />
              </label>
            </div>
          </div>
        {:else}
          <div class="medical-info-grid">
            <div class="medical-info-item">
              <span class="medical-info-label">Allergies:</span>
              <span class="medical-info-value">{medicalInfo.allergies}</span>
            </div>
            <div class="medical-info-item">
              <span class="medical-info-label">Medications:</span>
              <span class="medical-info-value">{medicalInfo.medications}</span>
            </div>
            <div class="medical-info-item">
              <span class="medical-info-label">Conditions:</span>
              <span class="medical-info-value">{medicalInfo.conditions}</span>
            </div>
          </div>
        {/if}
      </div>

      <div class="edit-section" class:mobile={isMobile}>
        {#if showSuccessMessage}
          <div class="success-message" class:mobile={isMobile}>
            <p>Changes saved successfully!</p>
          </div>
        {/if}
        {#if !isEditing}
          <button class="edit-btn" onclick={startEdit} class:mobile={isMobile}>
            Edit Profile
          </button>
        {:else}
          <div class="edit-actions">
            <button class="save-btn" onclick={saveEdit}>Save</button>
            <button class="cancel-btn" onclick={cancelEdit}>Cancel</button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

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
    z-index: 1001;
    padding: 20px;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: white;
    border-radius: 20px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
  }

  .modal-content.mobile {
    max-width: 100%;
    margin: 10px;
    border-radius: 16px;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 24px;
    border-radius: 20px 20px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-content.mobile .modal-header {
    border-radius: 16px 16px 0 0;
    padding: 20px;
  }

  .staff-header-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .staff-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .staff-basic-info h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .staff-department {
    margin: 4px 0 0 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 1.8rem;
    cursor: pointer;
    line-height: 1;
    padding: 8px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .modal-body {
    padding: 24px;
  }

  .modal-content.mobile .modal-body {
    padding: 20px;
  }

  .info-section {
    margin-bottom: 32px;
  }

  .info-section:last-child {
    margin-bottom: 0;
  }

  .info-section h3 {
    color: #2c3e50;
    margin: 0 0 16px 0;
    font-size: 1.1rem;
    font-weight: 600;
    border-bottom: 2px solid #ecf0f1;
    padding-bottom: 8px;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .contact-item {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 12px;
    border-left: 4px solid #3498db;
  }

  .contact-label {
    display: block;
    font-size: 0.85rem;
    color: #7f8c8d;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .contact-value {
    display: block;
    font-size: 1rem;
    color: #2c3e50;
    font-weight: 500;
  }

  .skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .skill-badge {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .schedule-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 200px;
    overflow-y: auto;
  }

  .schedule-item {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 4px solid #27ae60;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .schedule-item:hover {
    background: #ecf0f1;
  }

  .schedule-date {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .schedule-day {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2c3e50;
  }

  .schedule-day-name {
    font-size: 0.85rem;
    color: #7f8c8d;
    font-weight: 500;
  }

  .schedule-details {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .schedule-time {
    font-size: 0.9rem;
    color: #34495e;
    font-weight: 600;
  }

  .schedule-role {
    background: #e74c3c;
    color: white;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .no-schedule {
    text-align: center;
    color: #7f8c8d;
    font-style: italic;
    padding: 32px;
    background: #f8f9fa;
    border-radius: 12px;
  }

  .medical-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  .medical-info-item {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 12px;
    border-left: 4px solid #e67e22;
  }

  .medical-info-label {
    display: block;
    font-size: 0.85rem;
    color: #7f8c8d;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .medical-info-value {
    display: block;
    font-size: 1rem;
    color: #2c3e50;
    font-weight: 500;
  }

  .edit-section {
    margin-top: 24px;
    text-align: center;
  }

  .edit-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 12px 24px;
    border-radius: 20px;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .edit-btn:hover {
    background: linear-gradient(135deg, #764ba2, #667eea);
  }

  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 12px;
    border-radius: 12px;
    margin-bottom: 16px;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .edit-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
  }

  .save-btn, .cancel-btn {
    background: #27ae60;
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;
  }

  .save-btn:hover {
    background: #229954;
    transform: translateY(-1px);
  }

  .cancel-btn {
    background: #e74c3c;
  }

  .cancel-btn:hover {
    background: #c0392b;
    transform: translateY(-1px);
  }

  .edit-form {
    margin-top: 16px;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .form-row label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.9rem;
  }

  .form-row input {
    padding: 12px 16px;
    border: 2px solid #ecf0f1;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
    min-height: 44px;
    font-family: inherit;
  }

  .form-row input:focus {
    outline: none;
    border-color: #3498db;
  }

  /* Staff Avatar Color Classes */
  .staff-avatar.staff-rob {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
  }
  .staff-avatar.staff-grace {
    background: linear-gradient(135deg, #3498db, #2980b9);
  }
  .staff-avatar.staff-domingo {
    background: linear-gradient(135deg, #9b59b6, #8e44ad);
  }
  .staff-avatar.staff-athena {
    background: linear-gradient(135deg, #e67e22, #d35400);
  }
  .staff-avatar.staff-miranda {
    background: linear-gradient(135deg, #1abc9c, #16a085);
  }
  .staff-avatar.staff-taylor {
    background: linear-gradient(135deg, #f39c12, #e67e22);
  }
  .staff-avatar.staff-gemma {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
  }
  .staff-avatar.staff-bayla {
    background: linear-gradient(135deg, #34495e, #2c3e50);
  }
  .staff-avatar.staff-morph {
    background: linear-gradient(135deg, #e91e63, #ad1457);
  }
  .staff-avatar.staff-emilie {
    background: linear-gradient(135deg, #8e44ad, #7b1fa2);
  }
  .staff-avatar.staff-cam {
    background: linear-gradient(135deg, #16a085, #138d75);
  }
  .staff-avatar.staff-courtney {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
  }

  @media (max-width: 480px) {
    .modal-backdrop {
      padding: 10px;
    }

    .staff-header-info {
      gap: 12px;
    }

    .staff-avatar {
      width: 50px;
      height: 50px;
      font-size: 1.2rem;
    }

    .staff-basic-info h2 {
      font-size: 1.3rem;
    }

    .contact-grid {
      grid-template-columns: 1fr;
    }

    .schedule-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .schedule-details {
      align-items: flex-start;
    }

    .medical-info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>