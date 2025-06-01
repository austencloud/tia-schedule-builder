<script>
    import { scheduleStore } from '../stores/scheduleStore.svelte.js';
    import { departments } from '../data/scheduleData.js';
    
    const { shift } = $props();
    
    const { 
        showPatterns, 
        showHours, 
        compactView,
        getShiftStyle,
        selectStaff 
    } = scheduleStore;
    
    const shiftStyle = $derived(getShiftStyle(shift));
    const departmentInfo = $derived(departments[shift.department]);
    const patternClass = $derived(showPatterns ? departmentInfo?.pattern || '' : '');
    
    function handleShiftClick() {
        selectStaff(shift.staff);
    }
</script>

<div
    class="shift-card touch-target"
    class:compact={compactView}
    style="background-color: {shiftStyle.backgroundColor}; border-left-color: {shiftStyle.borderLeftColor};"
    onclick={handleShiftClick}
    onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleShiftClick();
        }
    }}
    tabindex="0"
    role="button"
    aria-label="Shift details for {shift.staff}: {shift.role} from {shift.time} in {shift.area}"
    aria-describedby="shift-details-{shift.staff}-{shift.time.replace(':', '-')}"
>
    {#if showPatterns && patternClass}
        <div 
            class="role-pattern {patternClass}" 
            style="color: {shiftStyle.borderLeftColor};"
        ></div>
    {/if}
    
    <div class="shift-content">
        <div class="shift-time text-high-contrast">{shift.time}</div>
        <div class="shift-staff text-high-contrast">{shift.staff}</div>
        <div class="shift-role text-medium-contrast">{shift.role}</div>
        <div class="shift-area text-medium-contrast">{shift.area}</div>

        {#if showHours}
            <div class="shift-hours text-medium-contrast">
                {shift.hours}h
            </div>
        {/if}

        <div class="shift-badges">
            <span class="department-badge {departmentInfo?.pattern || 'pattern-solid'}" data-department="{shift.department}">
                {departmentInfo?.name}
            </span>

            {#if shift.type === 'volunteer'}
                <span class="type-badge volunteer">Volunteer</span>
            {:else if shift.type === 'trainee'}
                <span class="type-badge trainee">Trainee</span>
            {/if}
        </div>
    </div>

    <!-- Hidden description for screen readers -->
    <div id="shift-details-{shift.staff}-{shift.time.replace(':', '-')}" class="sr-only">
        {shift.staff} is scheduled for {shift.role} in {shift.area} from {shift.time}
        {#if showHours}for {shift.hours} hours{/if}.
        Department: {departmentInfo?.name || shift.department}.
        {#if shift.type !== 'paid'}Staff type: {shift.type}.{/if}
        Click to view more details.
    </div>
</div>

<style>
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    .shift-card {
        padding: 16px;
        border-radius: 12px;
        border-left: 4px solid;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        backdrop-filter: blur(5px);
        min-height: 44px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    .shift-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        opacity: 0.1;
        z-index: -1;
    }
    
    .shift-card:hover,
    .shift-card:focus {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(8px);
        outline: 2px solid rgba(255, 255, 255, 0.5);
        outline-offset: 2px;
    }

    .shift-card:active {
        transform: translateY(0);
    }
    
    .shift-card.compact {
        padding: 12px;
    }
    
    .shift-content {
        position: relative;
        z-index: 1;
    }
    
    .shift-time {
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 8px;
    }
    
    .shift-staff {
        font-size: 1rem;
        font-weight: 500;
        margin-bottom: 6px;
    }

    .shift-role {
        font-size: 0.85rem;
        margin-bottom: 4px;
    }

    .shift-area {
        font-size: 0.8rem;
        font-style: italic;
        margin-bottom: 8px;
    }

    .shift-hours {
        font-size: 0.8rem;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 6px;
        border-radius: 8px;
        display: inline-block;
        margin-bottom: 8px;
    }
    
    .shift-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
    }
    
    .department-badge {
        font-size: 0.7rem;
        padding: 3px 8px;
        border-radius: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.2);
        position: relative;
    }

    /* Department pattern indicators */
    .department-badge.pattern-dots::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
        background-size: 4px 4px;
        border-radius: 10px;
        pointer-events: none;
    }

    .department-badge.pattern-stripes::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.2) 0px, rgba(255, 255, 255, 0.2) 1px, transparent 1px, transparent 3px);
        border-radius: 10px;
        pointer-events: none;
    }

    .department-badge.pattern-waves::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0px, rgba(255, 255, 255, 0.2) 1px, transparent 1px, transparent 3px);
        border-radius: 10px;
        pointer-events: none;
    }

    .department-badge.pattern-grid::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
        background-size: 4px 4px;
        border-radius: 10px;
        pointer-events: none;
    }

    .department-badge.pattern-solid {
        font-weight: 600;
        border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    .type-badge {
        font-size: 0.7rem;
        padding: 3px 8px;
        border-radius: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .type-badge.volunteer {
        background: rgba(130, 224, 170, 0.3);
        color: #82E0AA;
    }
    
    .type-badge.trainee {
        background: rgba(187, 143, 206, 0.3);
        color: #BB8FCE;
    }
    
    .role-pattern {
        position: absolute;
        top: 0;
        right: 0;
        width: 20px;
        height: 100%;
        opacity: 0.3;
        z-index: 0;
    }
    
    @media (max-width: 768px) {
        .shift-card {
            padding: 12px;
        }
        
        .shift-time {
            font-size: 0.85rem;
        }
        
        .shift-staff {
            font-size: 0.95rem;
        }
        
        .shift-badges {
            margin-top: 6px;
        }
    }
</style>
