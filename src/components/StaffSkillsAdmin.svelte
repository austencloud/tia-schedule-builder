<script>
  import { scheduleData } from '../data/scheduleData.js';
  
  let staffSkills = $state({
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
  });

  let newSkill = $state('');
  let editingStaff = $state(null);

  function addSkill(staffName) {
    if (newSkill.trim()) {
      staffSkills[staffName] = [...staffSkills[staffName], newSkill.trim()];
      newSkill = '';
    }
  }

  function removeSkill(staffName, skillIndex) {
    staffSkills[staffName] = staffSkills[staffName].filter((_, i) => i !== skillIndex);
  }

  function exportData() {
    const dataStr = JSON.stringify(staffSkills, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'staff-skills.json';
    link.click();
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(JSON.stringify(staffSkills, null, 2));
    alert('Staff skills copied to clipboard!');
  }
</script>

<div class="admin-panel">
  <header class="panel-header">
    <h1>🛠️ Staff Skills Editor</h1>
    <p>Edit skills for each team member</p>
    <div class="action-buttons">
      <button onclick={exportData} class="export-btn">📥 Download JSON</button>
      <button onclick={copyToClipboard} class="copy-btn">📋 Copy to Clipboard</button>
    </div>
  </header>

  <div class="staff-grid">
    {#each Object.entries(scheduleData.staff) as [key, staff]}
      <div class="staff-card">
        <div class="staff-header">
          <div class="staff-avatar {staff.color}">
            {staff.name.charAt(0)}
          </div>
          <h3>{staff.name}</h3>
        </div>

        <div class="skills-section">
          <h4>Current Skills:</h4>
          <div class="skills-list">
            {#each staffSkills[staff.name] as skill, index}
              <div class="skill-item">
                <span>{skill}</span>
                <button onclick={() => removeSkill(staff.name, index)} class="remove-btn">×</button>
              </div>
            {/each}
          </div>

          <div class="add-skill">
            <input
              type="text"
              bind:value={newSkill}
              placeholder="Add new skill..."
              onkeydown={(e) => e.key === 'Enter' && addSkill(staff.name)}
            />
            <button onclick={() => addSkill(staff.name)} class="add-btn">+ Add</button>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .admin-panel {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .panel-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 20px;
  }

  .panel-header h1 {
    margin: 0 0 10px 0;
    font-size: 2rem;
  }

  .panel-header p {
    margin: 0 0 20px 0;
    opacity: 0.9;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .export-btn, .copy-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .export-btn:hover, .copy-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .staff-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .staff-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 2px solid #f1f3f4;
  }

  .staff-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f1f3f4;
  }

  .staff-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: white;
  }

  .staff-header h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.3rem;
  }

  .skills-section h4 {
    margin: 0 0 12px 0;
    color: #34495e;
    font-size: 1rem;
  }

  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
    min-height: 40px;
  }

  .skill-item {
    background: #e3f2fd;
    color: #1565c0;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .remove-btn {
    background: #ff5252;
    border: none;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .add-skill {
    display: flex;
    gap: 8px;
  }

  .add-skill input {
    flex: 1;
    padding: 10px 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .add-skill input:focus {
    outline: none;
    border-color: #667eea;
  }

  .add-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    white-space: nowrap;
  }

  .add-btn:hover {
    background: #229954;
  }

  @media (max-width: 768px) {
    .admin-panel {
      padding: 15px;
    }

    .staff-grid {
      grid-template-columns: 1fr;
    }

    .action-buttons {
      flex-direction: column;
    }
  }
</style>