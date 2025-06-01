<script>
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    let { 
        title = '',
        subtitle = '',
        isExpanded = $bindable(false),
        level = 'primary', // 'primary', 'secondary', 'tertiary'
        showCount = false,
        count = 0,
        icon = '',
        collapsible = true,
        defaultExpanded = false,
        animationDuration = 300,
        className = ''
    } = $props();
    
    let contentElement;
    let isAnimating = $state(false);
    
    // Initialize expanded state
    $effect(() => {
        if (defaultExpanded && !isExpanded) {
            isExpanded = true;
        }
    });
    
    function toggle() {
        if (!collapsible) return;
        
        isAnimating = true;
        isExpanded = !isExpanded;
        
        dispatch('toggle', { expanded: isExpanded });
        
        setTimeout(() => {
            isAnimating = false;
        }, animationDuration);
    }
    
    function handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
        }
    }
    
    function expand() {
        if (!isExpanded) {
            toggle();
        }
    }
    
    function collapse() {
        if (isExpanded) {
            toggle();
        }
    }
    
    // Expose methods for parent components
    $effect(() => {
        dispatch('methods', { expand, collapse, toggle });
    });
</script>

<div class="progressive-disclosure {level} {className}" class:expanded={isExpanded} class:animating={isAnimating}>
    <div 
        class="disclosure-header touch-target"
        class:clickable={collapsible}
        onclick={toggle}
        onkeydown={handleKeydown}
        tabindex={collapsible ? 0 : -1}
        role={collapsible ? 'button' : 'heading'}
        aria-expanded={collapsible ? isExpanded : undefined}
        aria-controls="disclosure-content"
        aria-describedby="disclosure-description"
    >
        <div class="header-content">
            {#if icon}
                <span class="disclosure-icon" aria-hidden="true">{icon}</span>
            {/if}
            
            <div class="header-text">
                <h3 class="disclosure-title text-high-contrast">
                    {title}
                    {#if showCount && count > 0}
                        <span class="count-badge" aria-label="{count} items">
                            {count}
                        </span>
                    {/if}
                </h3>
                
                {#if subtitle}
                    <p class="disclosure-subtitle text-medium-contrast">
                        {subtitle}
                    </p>
                {/if}
            </div>
        </div>
        
        {#if collapsible}
            <div class="disclosure-toggle" aria-hidden="true">
                <svg 
                    class="toggle-icon" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16"
                    fill="currentColor"
                >
                    <path d="M8 12l-4-4h8l-4 4z"/>
                </svg>
            </div>
        {/if}
    </div>
    
    <div id="disclosure-description" class="sr-only">
        {#if collapsible}
            {isExpanded ? 'Collapse' : 'Expand'} {title} section. 
            {subtitle ? subtitle : ''}
        {:else}
            {title} section. {subtitle ? subtitle : ''}
        {/if}
    </div>
    
    <div 
        id="disclosure-content"
        class="disclosure-content"
        bind:this={contentElement}
        aria-hidden={!isExpanded}
    >
        <div class="content-wrapper">
            <slot />
        </div>
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
    
    .progressive-disclosure {
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
        overflow: hidden;
        transition: all 0.3s ease;
    }
    
    .progressive-disclosure.primary {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.25);
    }
    
    .progressive-disclosure.secondary {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.2);
    }
    
    .progressive-disclosure.tertiary {
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.15);
    }
    
    .disclosure-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        transition: all 0.2s ease;
        border-bottom: 1px solid transparent;
    }
    
    .disclosure-header.clickable {
        cursor: pointer;
    }
    
    .disclosure-header.clickable:hover {
        background: rgba(255, 255, 255, 0.05);
    }
    
    .disclosure-header.clickable:focus {
        outline: 2px solid rgba(255, 255, 255, 0.5);
        outline-offset: -2px;
    }
    
    .expanded .disclosure-header {
        border-bottom-color: rgba(255, 255, 255, 0.1);
    }
    
    .header-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
    }
    
    .disclosure-icon {
        font-size: 1.2rem;
        flex-shrink: 0;
    }
    
    .header-text {
        flex: 1;
    }
    
    .disclosure-title {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .count-badge {
        background: rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.8rem;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: 12px;
        min-width: 20px;
        text-align: center;
    }
    
    .disclosure-subtitle {
        margin: 4px 0 0 0;
        font-size: 0.9rem;
        line-height: 1.3;
    }
    
    .disclosure-toggle {
        flex-shrink: 0;
        margin-left: 12px;
    }
    
    .toggle-icon {
        transition: transform 0.3s ease;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .expanded .toggle-icon {
        transform: rotate(180deg);
    }
    
    .disclosure-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
    }
    
    .expanded .disclosure-content {
        max-height: 1000px; /* Adjust based on content needs */
    }
    
    .content-wrapper {
        padding: 0 20px 20px 20px;
    }
    
    /* Level-specific styling */
    .primary .disclosure-title {
        font-size: 1.2rem;
    }
    
    .secondary .disclosure-title {
        font-size: 1.1rem;
    }
    
    .tertiary .disclosure-title {
        font-size: 1rem;
    }
    
    .primary .disclosure-header {
        padding: 18px 24px;
    }
    
    .primary .content-wrapper {
        padding: 0 24px 24px 24px;
    }
    
    .tertiary .disclosure-header {
        padding: 12px 16px;
    }
    
    .tertiary .content-wrapper {
        padding: 0 16px 16px 16px;
    }
    
    /* Animation states */
    .animating {
        pointer-events: none;
    }
    
    /* Hover effects for different levels */
    .primary.progressive-disclosure:hover {
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
    }
    
    .secondary.progressive-disclosure:hover {
        border-color: rgba(255, 255, 255, 0.25);
        background: rgba(255, 255, 255, 0.07);
    }
    
    .tertiary.progressive-disclosure:hover {
        border-color: rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
    }
    
    /* Focus states */
    .progressive-disclosure:focus-within {
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .disclosure-header {
            padding: 14px 16px;
        }
        
        .content-wrapper {
            padding: 0 16px 16px 16px;
        }
        
        .disclosure-title {
            font-size: 1rem;
        }
        
        .disclosure-subtitle {
            font-size: 0.85rem;
        }
        
        .primary .disclosure-header {
            padding: 16px 20px;
        }
        
        .primary .content-wrapper {
            padding: 0 20px 20px 20px;
        }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        .disclosure-content,
        .toggle-icon,
        .progressive-disclosure {
            transition: none;
        }
        
        .expanded .disclosure-content {
            max-height: none;
        }
    }
</style>
