<script>
    import { scheduleStore } from '../stores/scheduleStore.svelte.js';
    import { staffCapabilities, criticalRequirements } from '../data/monthlyScheduleData.js';
    
    const {
        showDayDetailPanel,
        selectedDayData,
        isEditingAssignments,
        draggedStaff,
        validationErrors,
        conflictWarnings,
        staffColors,
        closeDayDetailPanel,
        toggleEditingMode,
        addStaffAssignment,
        removeStaffAssignment,
        updateStaffAssignment,
        setDraggedStaff,
        validateDayAssignments,
        clearValidationErrors,
        clearConflictWarnings
    } = scheduleStore;

    // Local state for forms and interactions
    let showAddStaffModal = $state(false);
    let showAddEventModal = $state(false);
    let selectedAssignmentIndex = $state(null);
    let hoveredDropZone = $state(null);

    // Form data
    let newAssignmentForm = $state({
        staff: '',
        role: '',
        time: '',
        hours: 0,
        capabilities: []
    });

    let newEventForm = $state({
        name: '',
        type: 'class',
        time: '',
        location: '',
        instructor: '',
        eventbriteLink: ''
    });

    // Computed values for available staff and coverage analysis
    const availableStaff = $derived(() => {
        if (!selectedDayData) return [];
        
        const unavailableStaffNames = selectedDayData.unavailableStaff?.map(u => u.staff) || [];
        const assignedStaffNames = selectedDayData.finalAssignments?.map(a => a.staff) || [];
        
        return Object.keys(staffCapabilities).filter(staff => 
            !unavailableStaffNames.includes(staff) && !assignedStaffNames.includes(staff)
        );
    });

    const coverageGaps = $derived(() => {
        if (!selectedDayData) return [];
        
        const gaps = [];
        const assignments = selectedDayData.finalAssignments || [];
        
        Object.entries(criticalRequirements).forEach(([key, requirement]) => {
            const hasRequiredStaff = assignments.some(assignment => {
                return requirement.requiredCapabilities.some(cap => 
                    assignment.capabilities?.includes(cap)
                );
            });
            
            if (!hasRequiredStaff) {
                gaps.push({
                    requirement: requirement.name,
                    description: requirement.description,
                    capabilities: requirement.requiredCapabilities,
                    severity: requirement.priority || 'medium'
                });
            }
        });
        
        return gaps;
    });

    const staffUtilization = $derived(() => {
        if (!selectedDayData) return {};
        
        const utilization = {};
        selectedDayData.finalAssignments?.forEach(assignment => {
            const staff = staffCapabilities[assignment.staff];
            if (staff) {
                utilization[assignment.staff] = {
                    hours: assignment.hours,
                    maxHours: staff.maxHoursPerWeek / 7, // Daily max
                    utilization: (assignment.hours / (staff.maxHoursPerWeek / 7)) * 100,
                    tier: staff.tier,
                    hourlyRate: staff.hourlyRate
                };
            }
        });
        
        return utilization;
    });

    // Event handlers
    function handleClosePanel() {
        closeDayDetailPanel();
        clearValidationErrors();
        clearConflictWarnings();
        showAddStaffModal = false;
        showAddEventModal = false;
        selectedAssignmentIndex = null;
    }

    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            handleClosePanel();
        }
    }

    function handleDragStart(event, staffName) {
        setDraggedStaff(staffName);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', staffName);
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(event, dropZone) {
        event.preventDefault();
        hoveredDropZone = dropZone;
    }

    function handleDragLeave(event) {
        event.preventDefault();
        hoveredDropZone = null;
    }

    function handleDrop(event, assignmentIndex = null) {
        event.preventDefault();
        const staffName = event.dataTransfer.getData('text/plain');
        
        if (staffName && selectedDayData) {
            if (assignmentIndex !== null) {
                // Replace existing assignment
                const existingAssignment = selectedDayData.finalAssignments[assignmentIndex];
                const staff = staffCapabilities[staffName];
                
                if (staff) {
                    const updatedAssignment = {
                        ...existingAssignment,
                        staff: staffName,
                        capabilities: staff.capabilities
                    };
                    
                    const dayIndex = selectedDayData.date - 1;
                    updateStaffAssignment(dayIndex, assignmentIndex, updatedAssignment);
                }
            } else {
                // Add new assignment
                openAddStaffModal(staffName);
            }
        }
        
        setDraggedStaff(null);
        hoveredDropZone = null;
    }

    function openAddStaffModal(preselectedStaff = '') {
        newAssignmentForm = {
            staff: preselectedStaff,
            role: '',
            time: '',
            hours: 0,
            capabilities: preselectedStaff ? staffCapabilities[preselectedStaff]?.capabilities || [] : []
        };
        showAddStaffModal = true;
    }

    function handleAddStaffSubmit(event) {
        event.preventDefault();
        
        if (!selectedDayData || !newAssignmentForm.staff) return;
        
        const staff = staffCapabilities[newAssignmentForm.staff];
        if (!staff) return;
        
        const newAssignment = {
            staff: newAssignmentForm.staff,
            time: newAssignmentForm.time,
            role: newAssignmentForm.role,
            hours: parseFloat(newAssignmentForm.hours),
            capabilities: staff.capabilities
        };
        
        const dayIndex = selectedDayData.date - 1;
        addStaffAssignment(dayIndex, newAssignment);
        
        showAddStaffModal = false;
        newAssignmentForm = { staff: '', role: '', time: '', hours: 0, capabilities: [] };
    }

    function handleRemoveAssignment(assignmentIndex) {
        if (!selectedDayData) return;
        
        const dayIndex = selectedDayData.date - 1;
        removeStaffAssignment(dayIndex, assignmentIndex);
    }

    function getStaffAvailabilityForDay(staffName) {
        if (!selectedDayData) return null;
        
        const availability = selectedDayData.staffAvailability?.find(a => a.staff === staffName);
        const labAvailability = selectedDayData.labStaffAvailability?.find(a => a.staff === staffName);
        
        return availability || labAvailability || null;
    }

    function canStaffFillGap(staffName, gap) {
        const staff = staffCapabilities[staffName];
        if (!staff) return false;
        
        return gap.capabilities.some(cap => staff.capabilities.includes(cap));
    }

    function getQualificationMatch(staffName, assignment) {
        const staff = staffCapabilities[staffName];
        if (!staff || !assignment.capabilities) return 0;
        
        const matchingCaps = assignment.capabilities.filter(cap => 
            staff.capabilities.includes(cap)
        );
        
        return (matchingCaps.length / assignment.capabilities.length) * 100;
    }
</script>

{#if showDayDetailPanel && selectedDayData}
    <div class="panel-overlay"
         role="dialog"
         aria-modal="true"
         aria-labelledby="panel-title"
         tabindex="-1"
         onclick={handleClosePanel}
         onkeydown={handleKeyDown}>
        <div class="enhanced-detail-panel"
             role="document"
             onclick={(e) => e.stopPropagation()}
             onkeydown={(e) => e.stopPropagation()}>
            <!-- Panel Header -->
            <header class="panel-header">
                <div class="header-content">
                    <h2 class="panel-title">
                        {selectedDayData.dayOfWeek}, {selectedDayData.fullDate}
                    </h2>
                    <div class="header-status">
                        <div class="coverage-status coverage-{selectedDayData.coverageStatus}">
                            {#if selectedDayData.coverageStatus === 'green'}
                                ✓ Fully Covered
                            {:else if selectedDayData.coverageStatus === 'yellow'}
                                ⚠ Partial Coverage
                            {:else}
                                ❌ Critical Gaps
                            {/if}
                        </div>
                        <button class="edit-toggle-btn" 
                                class:active={isEditingAssignments}
                                onclick={toggleEditingMode}>
                            {isEditingAssignments ? '👁 View' : '✏️ Edit'}
                        </button>
                    </div>
                </div>
                <button class="close-btn" onclick={handleClosePanel} aria-label="Close panel">
                    ×
                </button>
            </header>

            <div class="panel-content">
                <!-- Coverage Analysis Section -->
                {#if coverageGaps.length > 0}
                    <section class="coverage-gaps-section">
                        <h3>Coverage Gaps</h3>
                        {#each coverageGaps as gap}
                            <div class="gap-item severity-{gap.severity}">
                                <div class="gap-header">
                                    <span class="gap-name">{gap.requirement}</span>
                                    <span class="gap-severity">{gap.severity}</span>
                                </div>
                                <div class="gap-description">{gap.description}</div>
                                <div class="gap-capabilities">
                                    Required: {gap.capabilities.join(', ')}
                                </div>
                                
                                <!-- Suggested staff for this gap -->
                                <div class="gap-suggestions">
                                    {#each availableStaff.filter(staff => canStaffFillGap(staff, gap)) as staffName}
                                        <button class="suggestion-btn" 
                                                onclick={() => openAddStaffModal(staffName)}>
                                            + {staffName}
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    </section>
                {/if}

                <!-- Validation Errors and Conflicts -->
                {#if validationErrors.length > 0 || conflictWarnings.length > 0}
                    <section class="validation-section">
                        {#if validationErrors.length > 0}
                            <div class="validation-errors">
                                <h4>Validation Errors</h4>
                                {#each validationErrors as error}
                                    <div class="error-item">
                                        <span class="error-icon">❌</span>
                                        <span class="error-message">{error.message}</span>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                        
                        {#if conflictWarnings.length > 0}
                            <div class="conflict-warnings">
                                <h4>Scheduling Conflicts</h4>
                                {#each conflictWarnings as conflict}
                                    <div class="conflict-item">
                                        <span class="conflict-icon">⚠️</span>
                                        <span class="conflict-message">{conflict.message}</span>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </section>
                {/if}

                <!-- Current Staff Assignments Section -->
                <section class="staff-assignments-section">
                    <div class="section-header">
                        <h3>Staff Assignments</h3>
                        <button class="add-staff-btn" onclick={() => openAddStaffModal()}>
                            + Add Staff
                        </button>
                    </div>

                    <div class="assignments-grid"
                         class:editing={isEditingAssignments}
                         role="application"
                         aria-label="Staff assignment drop zone"
                         ondragover={handleDragOver}
                         ondrop={(e) => handleDrop(e)}>
                        {#each selectedDayData.finalAssignments || [] as assignment, index}
                            <div class="assignment-card enhanced"
                                 class:dragging={draggedStaff === assignment.staff}
                                 class:drop-target={hoveredDropZone === `assignment-${index}`}
                                 style="border-left: 4px solid {staffColors[assignment.staff]}"
                                 role="button"
                                 tabindex="0"
                                 aria-label="Staff assignment for {assignment.staff}, drag to reorder"
                                 ondragover={handleDragOver}
                                 ondragenter={(e) => handleDragEnter(e, `assignment-${index}`)}
                                 ondragleave={handleDragLeave}
                                 ondrop={(e) => handleDrop(e, index)}>

                                <div class="assignment-header">
                                    <div class="staff-info">
                                        <span class="staff-name">{assignment.staff}</span>
                                        <span class="staff-tier">
                                            {staffCapabilities[assignment.staff]?.tier || 'unknown'}
                                        </span>
                                    </div>
                                    <div class="assignment-actions">
                                        <span class="assignment-time">{assignment.time}</span>
                                        {#if isEditingAssignments}
                                            <button class="remove-btn"
                                                    onclick={() => handleRemoveAssignment(index)}
                                                    aria-label="Remove {assignment.staff}">
                                                ×
                                            </button>
                                        {/if}
                                    </div>
                                </div>

                                <div class="assignment-details">
                                    <div class="assignment-role">{assignment.role}</div>
                                    <div class="assignment-hours">{assignment.hours} hours</div>

                                    <!-- Utilization indicator -->
                                    {#if staffUtilization[assignment.staff]}
                                        <div class="utilization-bar">
                                            <div class="utilization-fill"
                                                 style="width: {Math.min(100, staffUtilization[assignment.staff].utilization)}%"
                                                 class:over-utilized={staffUtilization[assignment.staff].utilization > 100}>
                                            </div>
                                            <span class="utilization-text">
                                                {Math.round(staffUtilization[assignment.staff].utilization)}%
                                            </span>
                                        </div>
                                    {/if}
                                </div>

                                <div class="assignment-capabilities">
                                    {#each assignment.capabilities || [] as capability}
                                        <span class="capability-tag">{capability}</span>
                                    {/each}
                                </div>

                                <!-- Qualification match indicator -->
                                <div class="qualification-match">
                                    <div class="match-bar">
                                        <div class="match-fill"
                                             style="width: {getQualificationMatch(assignment.staff, assignment)}%">
                                        </div>
                                    </div>
                                    <span class="match-text">
                                        {Math.round(getQualificationMatch(assignment.staff, assignment))}% match
                                    </span>
                                </div>
                            </div>
                        {/each}

                        {#if (selectedDayData.finalAssignments || []).length === 0}
                            <div class="no-assignments-placeholder"
                                 role="button"
                                 tabindex="0"
                                 aria-label="Drop zone for staff assignments"
                                 ondragover={handleDragOver}
                                 ondrop={(e) => handleDrop(e)}>
                                <span>No staff assigned</span>
                                <span class="drop-hint">Drop staff here or click + Add Staff</span>
                            </div>
                        {/if}
                    </div>
                </section>

                <!-- Available Staff Section -->
                <section class="available-staff-section">
                    <h3>Available Staff</h3>
                    <div class="staff-grid">
                        {#each availableStaff as staffName}
                            <div class="staff-card available"
                                 style="border-left: 4px solid {staffColors[staffName]}"
                                 role="button"
                                 tabindex="0"
                                 aria-label="Drag {staffName} to assign to schedule"
                                 draggable="true"
                                 ondragstart={(e) => handleDragStart(e, staffName)}>

                                <div class="staff-header">
                                    <span class="staff-name">{staffName}</span>
                                    <span class="staff-tier">
                                        {staffCapabilities[staffName]?.tier || 'unknown'}
                                    </span>
                                </div>

                                <div class="staff-availability">
                                    {#if getStaffAvailabilityForDay(staffName)}
                                        Available: {getStaffAvailabilityForDay(staffName).hours}
                                    {:else}
                                        No specific availability listed
                                    {/if}
                                </div>

                                <div class="staff-capabilities">
                                    {#each (staffCapabilities[staffName]?.capabilities || []).slice(0, 3) as capability}
                                        <span class="capability-tag small">{capability}</span>
                                    {/each}
                                    {#if (staffCapabilities[staffName]?.capabilities || []).length > 3}
                                        <span class="capability-more">
                                            +{(staffCapabilities[staffName]?.capabilities || []).length - 3}
                                        </span>
                                    {/if}
                                </div>

                                <div class="staff-rate">
                                    ${staffCapabilities[staffName]?.hourlyRate || 0}/hour
                                </div>

                                <button class="quick-assign-btn"
                                        onclick={() => openAddStaffModal(staffName)}>
                                    + Assign
                                </button>
                            </div>
                        {/each}
                    </div>
                </section>

                <!-- Unavailable Staff Section -->
                {#if selectedDayData.unavailableStaff && selectedDayData.unavailableStaff.length > 0}
                    <section class="unavailable-staff-section">
                        <h3>Unavailable Staff</h3>
                        <div class="unavailable-grid">
                            {#each selectedDayData.unavailableStaff as unavailable}
                                <div class="staff-card unavailable">
                                    <div class="staff-name">{unavailable.staff}</div>
                                    <div class="unavailable-reason">{unavailable.reason}</div>
                                </div>
                            {/each}
                        </div>
                    </section>
                {/if}

                <!-- Events Section -->
                {#if selectedDayData.events && selectedDayData.events.length > 0}
                    <section class="events-section">
                        <div class="section-header">
                            <h3>Events & Classes</h3>
                            <button class="add-event-btn" onclick={() => showAddEventModal = true}>
                                + Add Event
                            </button>
                        </div>

                        <div class="events-grid">
                            {#each selectedDayData.events as event, index}
                                <div class="event-card">
                                    <div class="event-header">
                                        <span class="event-name">{event.name}</span>
                                        <span class="event-type">{event.type}</span>
                                    </div>

                                    <div class="event-details">
                                        {#if selectedDayData.eventTimes && selectedDayData.eventTimes[index]}
                                            <div class="event-time">
                                                🕐 {selectedDayData.eventTimes[index]}
                                            </div>
                                        {/if}

                                        {#if selectedDayData.eventLocations && selectedDayData.eventLocations[index]}
                                            <div class="event-location">
                                                📍 {selectedDayData.eventLocations[index]}
                                            </div>
                                        {/if}

                                        {#if selectedDayData.eventInstructors && selectedDayData.eventInstructors[index]}
                                            <div class="event-instructor">
                                                👨‍🏫 {selectedDayData.eventInstructors[index]}
                                            </div>
                                        {/if}

                                        {#if selectedDayData.eventbriteLinks && selectedDayData.eventbriteLinks[index]}
                                            <a href={selectedDayData.eventbriteLinks[index]}
                                               target="_blank"
                                               class="eventbrite-link">
                                                🎫 Eventbrite
                                            </a>
                                        {/if}
                                    </div>

                                    {#if event.description}
                                        <div class="event-description">{event.description}</div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </section>
                {/if}
            </div>
        </div>
    </div>
{/if}
