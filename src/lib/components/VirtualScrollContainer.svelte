<script>
    import { createEventDispatcher, tick } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    let { 
        items = [],
        itemHeight = 100,
        containerHeight = 400,
        overscan = 5,
        horizontal = false,
        className = '',
        estimateSize = null,
        getItemKey = (item, index) => index,
        onScroll = null
    } = $props();
    
    let scrollElement;
    let scrollOffset = $state(0);
    let isScrolling = $state(false);
    let scrollTimeout;
    
    // Calculate visible range based on scroll position
    const visibleRange = $derived(() => {
        if (!items.length) return { start: 0, end: 0 };
        
        const totalItems = items.length;
        const scrollDirection = horizontal ? 'horizontal' : 'vertical';
        const size = estimateSize ? estimateSize : itemHeight;
        
        const start = Math.max(0, Math.floor(scrollOffset / size) - overscan);
        const visibleCount = Math.ceil(containerHeight / size);
        const end = Math.min(totalItems, start + visibleCount + overscan * 2);
        
        return { start, end };
    });
    
    // Get visible items with their positions
    const visibleItems = $derived(() => {
        const { start, end } = visibleRange;
        const items_slice = items.slice(start, end);
        
        return items_slice.map((item, index) => ({
            item,
            index: start + index,
            key: getItemKey(item, start + index),
            offset: (start + index) * itemHeight
        }));
    });
    
    // Calculate total size for scrollbar
    const totalSize = $derived(() => {
        return items.length * itemHeight;
    });
    
    // Handle scroll events with throttling
    function handleScroll(event) {
        const element = event.target;
        const newOffset = horizontal ? element.scrollLeft : element.scrollTop;
        
        scrollOffset = newOffset;
        isScrolling = true;
        
        // Clear existing timeout
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        // Set scrolling to false after scroll ends
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 150);
        
        // Call custom scroll handler
        if (onScroll) {
            onScroll({
                scrollOffset: newOffset,
                scrollDirection: horizontal ? 'horizontal' : 'vertical',
                isScrolling
            });
        }
        
        dispatch('scroll', {
            scrollOffset: newOffset,
            visibleRange: visibleRange,
            isScrolling
        });
    }
    
    // Scroll to specific item
    function scrollToItem(index, align = 'auto') {
        if (!scrollElement || index < 0 || index >= items.length) return;
        
        const itemOffset = index * itemHeight;
        const containerSize = horizontal ? scrollElement.clientWidth : scrollElement.clientHeight;
        
        let targetOffset = itemOffset;
        
        switch (align) {
            case 'start':
                targetOffset = itemOffset;
                break;
            case 'center':
                targetOffset = itemOffset - (containerSize / 2) + (itemHeight / 2);
                break;
            case 'end':
                targetOffset = itemOffset - containerSize + itemHeight;
                break;
            case 'auto':
                const currentOffset = horizontal ? scrollElement.scrollLeft : scrollElement.scrollTop;
                const itemEnd = itemOffset + itemHeight;
                const viewEnd = currentOffset + containerSize;
                
                if (itemOffset < currentOffset) {
                    targetOffset = itemOffset;
                } else if (itemEnd > viewEnd) {
                    targetOffset = itemEnd - containerSize;
                } else {
                    return; // Item is already visible
                }
                break;
        }
        
        // Clamp to valid range
        const maxOffset = totalSize - containerSize;
        targetOffset = Math.max(0, Math.min(maxOffset, targetOffset));
        
        if (horizontal) {
            scrollElement.scrollLeft = targetOffset;
        } else {
            scrollElement.scrollTop = targetOffset;
        }
    }
    
    // Scroll to top
    function scrollToTop() {
        if (scrollElement) {
            if (horizontal) {
                scrollElement.scrollLeft = 0;
            } else {
                scrollElement.scrollTop = 0;
            }
        }
    }
    
    // Scroll to bottom
    function scrollToBottom() {
        if (scrollElement) {
            const maxOffset = totalSize - containerHeight;
            if (horizontal) {
                scrollElement.scrollLeft = maxOffset;
            } else {
                scrollElement.scrollTop = maxOffset;
            }
        }
    }
    
    // Expose methods to parent
    $effect(() => {
        dispatch('methods', {
            scrollToItem,
            scrollToTop,
            scrollToBottom,
            getVisibleRange: () => visibleRange,
            getScrollOffset: () => scrollOffset
        });
    });
    
    // Performance optimization: use RAF for smooth scrolling
    let rafId;
    function scheduleUpdate() {
        if (rafId) return;
        
        rafId = requestAnimationFrame(() => {
            rafId = null;
            // Force re-render if needed
            tick();
        });
    }
    
    $effect(() => {
        // Watch for items changes and schedule update
        if (items.length) {
            scheduleUpdate();
        }
    });
</script>

<div 
    bind:this={scrollElement}
    class="virtual-scroll-container {className}"
    class:horizontal
    class:scrolling={isScrolling}
    style:height={horizontal ? 'auto' : `${containerHeight}px`}
    style:width={horizontal ? `${containerHeight}px` : 'auto'}
    onscroll={handleScroll}
    role="grid"
    aria-label="Virtual scrolling container"
    aria-rowcount={items.length}
    tabindex="0"
>
    <!-- Spacer for total height/width -->
    <div 
        class="virtual-scroll-spacer"
        style:height={horizontal ? 'auto' : `${totalSize}px`}
        style:width={horizontal ? `${totalSize}px` : 'auto'}
        aria-hidden="true"
    >
        <!-- Visible items container -->
        <div 
            class="virtual-scroll-items"
            style:transform={horizontal 
                ? `translateX(${visibleItems[0]?.offset || 0}px)` 
                : `translateY(${visibleItems[0]?.offset || 0}px)`
            }
        >
            {#each visibleItems as { item, index, key, offset } (key)}
                <div 
                    class="virtual-scroll-item"
                    style:height={horizontal ? 'auto' : `${itemHeight}px`}
                    style:width={horizontal ? `${itemHeight}px` : 'auto'}
                    role="gridcell"
                    aria-rowindex={index + 1}
                    data-index={index}
                >
                    <slot {item} {index} {offset} />
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .virtual-scroll-container {
        overflow: auto;
        position: relative;
        contain: strict;
        will-change: scroll-position;
    }
    
    .virtual-scroll-container.horizontal {
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
    }
    
    .virtual-scroll-container:not(.horizontal) {
        overflow-y: auto;
        overflow-x: hidden;
    }
    
    .virtual-scroll-spacer {
        position: relative;
        pointer-events: none;
    }
    
    .virtual-scroll-items {
        position: absolute;
        top: 0;
        left: 0;
        will-change: transform;
    }
    
    .virtual-scroll-item {
        position: relative;
        contain: layout style paint;
    }
    
    /* Smooth scrolling indicators */
    .virtual-scroll-container.scrolling {
        scroll-behavior: auto;
    }
    
    /* Custom scrollbar styling */
    .virtual-scroll-container::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    
    .virtual-scroll-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }
    
    .virtual-scroll-container::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        transition: background 0.2s ease;
    }
    
    .virtual-scroll-container::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
    }
    
    /* Focus styles for accessibility */
    .virtual-scroll-container:focus {
        outline: 2px solid rgba(255, 255, 255, 0.5);
        outline-offset: -2px;
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        .virtual-scroll-container {
            scroll-behavior: auto;
        }
        
        .virtual-scroll-items {
            transition: none;
        }
    }
</style>
