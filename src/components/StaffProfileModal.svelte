<script>
  let { staff, onClose } = $props();
  
  let isMobile = $state(false);
  
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
    const contactMap = {
      'Rob': { email: 'rob@tiamuseum.org', phone: '(555) 0101', department: 'Animal Care & Education' },
      'Grace': { email: 'grace@tiamuseum.org', phone: '(555) 0102', department: 'Animal Care' },
      'Domingo': { email: 'domingo@tiamuseum.org', phone: '(555) 0103', department: 'Events & Education' },
      'Athena': { email: 'athena@tiamuseum.org', phone: '(555) 0104', department: 'Laboratory' },
      'Miranda': { email: 'miranda@tiamuseum.org', phone: '(555) 0105', department: 'Animal Care & Events' },
      'Taylor': { email: 'taylor@tiamuseum.org', phone: '(555) 0106', department: 'Animal Care & Outreach' },
      'Gemma': { email: 'gemma@tiamuseum.org', phone: '(555) 0107', department: 'Guest Services' },
      'Bayla': { email: 'bayla@tiamuseum.org', phone: '(555) 0108', department: 'Laboratory & Education' },
      'Morph': { email: 'morph@tiamuseum.org', phone: '(555) 0109', department: 'Operations' },
      'Emilie': { email: 'emilie@tiamuseum.org', phone: '(555) 0110', department: 'Animal Care Lead' },
      'Cam': { email: 'cam@tiamuseum.org', phone: '(555) 0111', department: 'Laboratory & Training' },
      'Courtney': { email: 'courtney@tiamuseum.org', phone: '(555) 0112', department: 'Guest Services' }
    };
    return contactMap[staffName] || { email: 'staff@tiamuseum.org', phone: '(555) 0100', department: 'General' };
  }

  let skills = $derived(getStaffSkills(staff.name));
  let contact = $derived(getStaffContact(staff.name));
</script>

<div class="modal-backdrop" onclick={handleBackdropClick}>
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
              <div class="schedule-item">
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
  }
</style>