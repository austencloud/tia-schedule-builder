<script>
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    let { 
        content = '',
        title = '',
        position = 'top',
        trigger = 'hover',
        delay = 500,
        maxWidth = '250px',
        showArrow = true,
        persistent = false,
        className = ''
    } = $props();
    
    let tooltipElement;
    let triggerElement;
    let isVisible = $state(false);
    let timeoutId;
    
    function showTooltip() {
        if (timeoutId) clearTimeout(timeoutId);
        
        if (trigger === 'hover') {
            timeoutId = setTimeout(() => {
                isVisible = true;
                positionTooltip();
            }, delay);
        } else {
            isVisible = true;
            positionTooltip();
        }
    }
    
    function hideTooltip() {
        if (timeoutId) clearTimeout(timeoutId);
        
        if (!persistent) {
            isVisible = false;
        }
    }
    
    function toggleTooltip() {
        if (isVisible) {
            hideTooltip();
        } else {
            showTooltip();
        }
    }
    
    function positionTooltip() {
        if (!tooltipElement || !triggerElement) return;
        
        const triggerRect = triggerElement.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = triggerRect.top - tooltipRect.height - 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = triggerRect.bottom + 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                left = triggerRect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                left = triggerRect.right + 8;
                break;
            default:
                top = triggerRect.top - tooltipRect.height - 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        }
        
        // Adjust for viewport boundaries
        if (left < 8) left = 8;
        if (left + tooltipRect.width > viewport.width - 8) {
            left = viewport.width - tooltipRect.width - 8;
        }
        if (top < 8) top = 8;
        if (top + tooltipRect.height > viewport.height - 8) {
            top = viewport.height - tooltipRect.height - 8;
        }
        
        tooltipElement.style.top = `${top}px`;
        tooltipElement.style.left = `${left}px`;
    }
    
    function handleKeydown(event) {
        if (event.key === 'Escape' && isVisible) {
            hideTooltip();
        }
    }
    
    function handleTriggerEvents(element) {
        triggerElement = element;
        
        if (trigger === 'hover') {
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
            element.addEventListener('focus', showTooltip);
            element.addEventListener('blur', hideTooltip);
        } else if (trigger === 'click') {
            element.addEventListener('click', toggleTooltip);
        }
        
        return {
            destroy() {
                element.removeEventListener('mouseenter', showTooltip);
                element.removeEventListener('mouseleave', hideTooltip);
                element.removeEventListener('focus', showTooltip);
                element.removeEventListener('blur', hideTooltip);
                element.removeEventListener('click', toggleTooltip);
            }
        };
    }
</script>

<svelte:window on:keydown={handleKeydown} on:resize={positionTooltip} />

<div class="tooltip-wrapper {className}">
    <div use:handleTriggerEvents>
        <slot />
    </div>
    
    {#if isVisible}
        <div 
            bind:this={tooltipElement}
            class="tooltip glass {position}"
            class:show-arrow={showArrow}
            style="max-width: {maxWidth}; position: fixed; z-index: 10000;"
            role="tooltip"
            aria-live="polite"
        >
            {#if title}
                <div class="tooltip-title text-high-contrast">{title}</div>
            {/if}
            <div class="tooltip-content text-medium-contrast">
                {#if typeof content === 'string'}
                    {@html content}
                {:else}
                    {content}
                {/if}
            </div>
            
            {#if persistent}
                <button 
                    class="tooltip-close" 
                    onclick={hideTooltip}
                    aria-label="Close tooltip"
                >
                    ✕
                </button>
            {/if}
        </div>
    {/if}
</div>

<style>
    .tooltip-wrapper {
        display: inline-block;
        position: relative;
    }
    
    .tooltip {
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
        background: rgba(0, 0, 0, 0.8);
        opacity: 0;
        transform: scale(0.95);
        transition: all 0.2s ease;
        animation: tooltipFadeIn 0.2s ease forwards;
    }
    
    @keyframes tooltipFadeIn {
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .tooltip-title {
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 6px;
    }
    
    .tooltip-content {
        font-size: 0.85rem;
        line-height: 1.4;
    }
    
    .tooltip-close {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        border-radius: 4px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        cursor: pointer;
        transition: background 0.2s ease;
    }
    
    .tooltip-close:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    /* Arrow styles */
    .tooltip.show-arrow::before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border: 6px solid transparent;
    }
    
    .tooltip.top.show-arrow::before {
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        border-top-color: rgba(0, 0, 0, 0.8);
    }
    
    .tooltip.bottom.show-arrow::before {
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        border-bottom-color: rgba(0, 0, 0, 0.8);
    }
    
    .tooltip.left.show-arrow::before {
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
        border-left-color: rgba(0, 0, 0, 0.8);
    }
    
    .tooltip.right.show-arrow::before {
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
        border-right-color: rgba(0, 0, 0, 0.8);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .tooltip {
            max-width: 90vw !important;
            padding: 10px 12px;
        }
        
        .tooltip-title {
            font-size: 0.85rem;
        }
        
        .tooltip-content {
            font-size: 0.8rem;
        }
    }
</style>
