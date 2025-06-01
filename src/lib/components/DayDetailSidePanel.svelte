<script>
    import { monthlyScheduleStore } from '../stores/monthlyScheduleStore.svelte.js';
    import { staffCapabilities, criticalRequirements } from '../data/monthlyScheduleData.js';
    
    const { 
        showSidePanelDay,
        setShowSidePanelDay,
        staffColors,
        updateDayAssignment,
        addStaffAssignment,
        removeStaffAssignment
    } = monthlyScheduleStore;
    
    let draggedStaff = null;
    let showAddStaffModal = false;
    
    function closeSidePanel() {
        setShowSidePanelDay(null);
    }
    
    function getAvailableStaff() {
        if (!showSidePanelDay) return [];
        
        const unavailableStaffNames = showSidePanelDay.unavailableStaff.map(u => u.staff);
        const assignedStaffNames = showSidePanelDay.finalAssignments.map(a => a.staff);
        
        return Object.keys(staffCapabilities).filter(staff => 
            !unavailableStaffNames.includes(staff) && !assignedStaffNames.includes(staff)
        );
    }
    
    function getStaffAvailabilityForDay(staffName) {
        if (!showSidePanelDay) return null;
        
        const availability = showSidePanelDay.staffAvailability.find(a => a.staff === staffName);
        const labAvailability = showSidePanelDay.labStaffAvailability.find(a => a.staff === staffName);
        
        return availability || labAvailability || null;
    }
    
    function getCoverageGaps() {
        if (!showSidePanelDay) return [];
        
        const gaps = [];
        const assignments = showSidePanelDay.finalAssignments;
        
        Object.entries(criticalRequirements).forEach(([key, requirement]) => {
            const hasRequiredStaff = assignments.some(assignment => {
                return requirement.requiredCapabilities.some(cap => 
                    assignment.capabilities.includes(cap)
                );
            });
            
            if (!hasRequiredStaff) {
                gaps.push({
                    requirement: requirement.name,
                    description: requirement.description,
                    capabilities: requirement.requiredCapabilities
                });
            }
        });
        
        return gaps;
    }
    
    function canStaffFillGap(staffName, gap) {
        const staff = staffCapabilities[staffName];
        if (!staff) return false;
        
        return gap.capabilities.some(cap => staff.capabilities.includes(cap));
    }
    
    function handleDragStart(event, staffName) {
        draggedStaff = staffName;
        event.dataTransfer.effectAllowed = 'move';
    }
    
    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }
    
    function handleDrop(event, assignmentIndex) {
        event.preventDefault();
        if (draggedStaff && showSidePanelDay) {
            // Add logic to reassign staff
            console.log(`Reassigning ${draggedStaff} to assignment ${assignmentIndex}`);
        }
        draggedStaff = null;
    }
    
    function addNewStaffAssignment(staffName, role, time, hours) {
        if (!showSidePanelDay) return;
        
        const staff = staffCapabilities[staffName];
        if (!staff) return;
        
        const newAssignment = {
            staff: staffName,
            time: time,
            role: role,
            hours: parseFloat(hours),
            capabilities: staff.capabilities
        };
        
        const dayIndex = showSidePanelDay.date - 1; // Assuming 1-indexed dates
        addStaffAssignment(dayIndex, newAssignment);
        showAddStaffModal = false;
    }
    
    function removeAssignment(assignmentIndex) {
        if (!showSidePanelDay) return;
        
        const dayIndex = showSidePanelDay.date - 1;
        removeStaffAssignment(dayIndex, assignmentIndex);
    }
</script>

{#if showSidePanelDay}
    <div class="side-panel-overlay" onclick={closeSidePanel}>
        <div class="side-panel" onclick={(e) => e.stopPropagation()}>
            <div class="panel-header">
                <h2>{showSidePanelDay.dayOfWeek}, {showSidePanelDay.fullDate}</h2>
                <button class="close-btn" onclick={closeSidePanel}>×</button>
            </div>
            
            <div class="panel-content">
                <!-- Coverage Status -->
                <div class="section coverage-status">
                    <h3>Coverage Status</h3>
                    <div class="status-indicator coverage-{showSidePanelDay.coverageStatus}">
                        {#if showSidePanelDay.coverageStatus === 'green'}
                            ✓ Fully Covered
                        {:else if showSidePanelDay.coverageStatus === 'yellow'}
                            ⚠ Partial Coverage
                        {:else}
                            ❌ Critical Gaps
                        {/if}
                    </div>
                </div>
                
                <!-- Coverage Gaps -->
                {#if getCoverageGaps().length > 0}
                    <div class="section coverage-gaps">
                        <h3>Coverage Gaps</h3>
                        {#each getCoverageGaps() as gap}
                            <div class="gap-item">
                                <div class="gap-name">{gap.requirement}</div>
                                <div class="gap-description">{gap.description}</div>
                                <div class="gap-capabilities">
                                    Required: {gap.capabilities.join(', ')}
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
                
                <!-- Current Staff Assignments -->
                <div class="section staff-assignments">
                    <h3>Current Staff Assignments</h3>
                    {#each showSidePanelDay.finalAssignments as assignment, index}
                        <div 
                            class="assignment-card"
                            style="border-left: 4px solid {staffColors[assignment.staff]}"
                            ondragover={handleDragOver}
                            ondrop={(e) => handleDrop(e, index)}
                        >
                            <div class="assignment-header">
                                <span class="staff-name">{assignment.staff}</span>
                                <span class="assignment-time">{assignment.time}</span>
                                <button class="remove-btn" onclick={() => removeAssignment(index)}>×</button>
                            </div>
                            <div class="assignment-role">{assignment.role}</div>
                            <div class="assignment-hours">{assignment.hours} hours</div>
                            <div class="assignment-capabilities">
                                {assignment.capabilities.join(', ')}
                            </div>
                        </div>
                    {/each}
                    
                    <button class="add-assignment-btn" onclick={() => showAddStaffModal = true}>
                        + Add Staff Assignment
                    </button>
                </div>
                
                <!-- Available Staff -->
                <div class="section available-staff">
                    <h3>Available Staff</h3>
                    {#each getAvailableStaff() as staffName}
                        <div 
                            class="staff-card available"
                            style="border-left: 4px solid {staffColors[staffName]}"
                            draggable="true"
                            ondragstart={(e) => handleDragStart(e, staffName)}
                        >
                            <div class="staff-header">
                                <span class="staff-name">{staffName}</span>
                                <span class="staff-tier">{staffCapabilities[staffName].tier}</span>
                            </div>
                            <div class="staff-availability">
                                {#if getStaffAvailabilityForDay(staffName)}
                                    Available: {getStaffAvailabilityForDay(staffName).hours}
                                {:else}
                                    No specific availability listed
                                {/if}
                            </div>
                            <div class="staff-capabilities">
                                {staffCapabilities[staffName].capabilities.join(', ')}
                            </div>
                            <div class="staff-rate">
                                ${staffCapabilities[staffName].hourlyRate}/hour
                            </div>
                        </div>
                    {/each}
                </div>
                
                <!-- Unavailable Staff -->
                {#if showSidePanelDay.unavailableStaff.length > 0}
                    <div class="section unavailable-staff">
                        <h3>Unavailable Staff</h3>
                        {#each showSidePanelDay.unavailableStaff as unavailable}
                            <div class="staff-card unavailable">
                                <div class="staff-name">{unavailable.staff}</div>
                                <div class="unavailable-reason">{unavailable.reason}</div>
                            </div>
                        {/each}
                    </div>
                {/if}
                
                <!-- Events -->
                {#if showSidePanelDay.events.length > 0}
                    <div class="section events">
                        <h3>Events & Classes</h3>
                        {#each showSidePanelDay.events as event, index}
                            <div class="event-card">
                                <div class="event-name">{event.name}</div>
                                <div class="event-details">
                                    {#if showSidePanelDay.eventTimes[index]}
                                        <div class="event-time">{showSidePanelDay.eventTimes[index]}</div>
                                    {/if}
                                    {#if showSidePanelDay.eventLocations[index]}
                                        <div class="event-location">{showSidePanelDay.eventLocations[index]}</div>
                                    {/if}
                                    {#if showSidePanelDay.eventInstructors[index]}
                                        <div class="event-instructor">Instructor: {showSidePanelDay.eventInstructors[index]}</div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<!-- Add Staff Modal -->
{#if showAddStaffModal}
    <div class="modal-overlay" onclick={() => showAddStaffModal = false}>
        <div class="modal" onclick={(e) => e.stopPropagation()}>
            <h3>Add Staff Assignment</h3>
            <form onsubmit={(e) => e.preventDefault()}>
                <select name="staff" required>
                    <option value="">Select Staff Member</option>
                    {#each getAvailableStaff() as staffName}
                        <option value={staffName}>{staffName}</option>
                    {/each}
                </select>
                
                <input type="text" name="role" placeholder="Role/Position" required />
                <input type="text" name="time" placeholder="Time (e.g., 11-5)" required />
                <input type="number" name="hours" placeholder="Hours" step="0.5" required />
                
                <div class="modal-actions">
                    <button type="button" onclick={() => showAddStaffModal = false}>Cancel</button>
                    <button type="submit">Add Assignment</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .side-panel-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1000;
        display: flex;
        justify-content: flex-end;
    }
    
    .side-panel {
        width: 500px;
        max-width: 90vw;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        height: 100vh;
        overflow-y: auto;
        box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
    }
    
    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        position: sticky;
        top: 0;
        background: inherit;
        z-index: 10;
    }
    
    .panel-header h2 {
        color: white;
        margin: 0;
        font-size: 1.3rem;
    }
    
    .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .panel-content {
        padding: 20px;
    }
    
    .section {
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .section:last-child {
        border-bottom: none;
    }
    
    .section h3 {
        color: white;
        margin: 0 0 15px 0;
        font-size: 1.1rem;
    }
    
    .coverage-status .status-indicator {
        padding: 8px 12px;
        border-radius: 6px;
        font-weight: 500;
        display: inline-block;
    }
    
    .status-indicator.coverage-green {
        background: rgba(76, 175, 80, 0.2);
        color: #4CAF50;
        border: 1px solid #4CAF50;
    }
    
    .status-indicator.coverage-yellow {
        background: rgba(255, 193, 7, 0.2);
        color: #FFC107;
        border: 1px solid #FFC107;
    }
    
    .status-indicator.coverage-red {
        background: rgba(244, 67, 54, 0.2);
        color: #F44336;
        border: 1px solid #F44336;
    }
    
    .gap-item {
        background: rgba(244, 67, 54, 0.1);
        border: 1px solid rgba(244, 67, 54, 0.3);
        border-radius: 6px;
        padding: 10px;
        margin-bottom: 10px;
    }
    
    .gap-name {
        font-weight: 600;
        color: #F44336;
        margin-bottom: 5px;
    }
    
    .gap-description {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
        margin-bottom: 5px;
    }
    
    .gap-capabilities {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.8rem;
        font-style: italic;
    }
    
    .assignment-card, .staff-card {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 10px;
        transition: all 0.3s ease;
    }
    
    .assignment-card:hover, .staff-card:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
    }
    
    .staff-card.available {
        cursor: grab;
    }
    
    .staff-card.available:active {
        cursor: grabbing;
    }
    
    .staff-card.unavailable {
        opacity: 0.6;
        background: rgba(255, 255, 255, 0.05);
    }
    
    .assignment-header, .staff-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }
    
    .staff-name {
        font-weight: 600;
        color: white;
    }
    
    .assignment-time, .staff-tier {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
    }
    
    .remove-btn {
        background: rgba(244, 67, 54, 0.2);
        border: 1px solid #F44336;
        color: #F44336;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .assignment-role, .assignment-hours, .assignment-capabilities,
    .staff-availability, .staff-capabilities, .staff-rate,
    .unavailable-reason {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.85rem;
        margin-bottom: 4px;
    }
    
    .add-assignment-btn {
        background: rgba(76, 175, 80, 0.2);
        border: 1px solid #4CAF50;
        color: #4CAF50;
        padding: 10px 15px;
        border-radius: 6px;
        cursor: pointer;
        width: 100%;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }
    
    .add-assignment-btn:hover {
        background: rgba(76, 175, 80, 0.3);
    }
    
    .event-card {
        background: rgba(255, 193, 7, 0.1);
        border: 1px solid rgba(255, 193, 7, 0.3);
        border-radius: 6px;
        padding: 10px;
        margin-bottom: 10px;
    }
    
    .event-name {
        font-weight: 600;
        color: #FFC107;
        margin-bottom: 8px;
    }
    
    .event-details div {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.85rem;
        margin-bottom: 4px;
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        border-radius: 10px;
        padding: 25px;
        width: 400px;
        max-width: 90vw;
    }
    
    .modal h3 {
        color: white;
        margin: 0 0 20px 0;
    }
    
    .modal form {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .modal select, .modal input {
        padding: 10px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 0.9rem;
    }
    
    .modal select option {
        background: #1e3c72;
        color: white;
    }
    
    .modal-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    
    .modal-actions button {
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    .modal-actions button[type="button"] {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
    }
    
    .modal-actions button[type="submit"] {
        background: rgba(76, 175, 80, 0.2);
        color: #4CAF50;
        border-color: #4CAF50;
    }
</style>
