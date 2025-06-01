<script>
    import { createEventDispatcher } from 'svelte';
    import { userPreferencesStore } from '../stores/userPreferencesStore.svelte.js';
    
    const dispatch = createEventDispatcher();
    
    let { 
        enabled = true,
        showHelp = $bindable(false),
        customShortcuts = {}
    } = $props();
    
    // Default keyboard shortcuts
    const defaultShortcuts = {
        // Navigation
        'h': { action: 'openHelp', description: 'Open help panel', category: 'Navigation' },
        'Escape': { action: 'closeModal', description: 'Close modal/panel', category: 'Navigation' },
        '/': { action: 'focusSearch', description: 'Focus search input', category: 'Navigation' },
        
        // View switching
        '1': { action: 'weeklyView', description: 'Switch to weekly view', category: 'Views' },
        '2': { action: 'monthlyView', description: 'Switch to monthly view', category: 'Views' },
        '3': { action: 'dailyView', description: 'Switch to daily view', category: 'Views' },
        '4': { action: 'staffView', description: 'Switch to staff view', category: 'Views' },
        
        // System switching
        's': { action: 'toggleSystem', description: 'Toggle between weekly/monthly systems', category: 'System' },
        
        // Filters
        'f': { action: 'toggleFilters', description: 'Toggle filter panel', category: 'Filters' },
        'c': { action: 'clearFilters', description: 'Clear all filters', category: 'Filters' },
        
        // Display options
        'p': { action: 'togglePatterns', description: 'Toggle visual patterns', category: 'Display' },
        'o': { action: 'toggleHours', description: 'Toggle hour display', category: 'Display' },
        'm': { action: 'toggleCompact', description: 'Toggle compact view', category: 'Display' },
        
        // Accessibility
        'Alt+h': { action: 'toggleHighContrast', description: 'Toggle high contrast mode', category: 'Accessibility' },
        'Alt+m': { action: 'toggleReducedMotion', description: 'Toggle reduced motion', category: 'Accessibility' },
        'Alt+t': { action: 'toggleTooltips', description: 'Toggle tooltips', category: 'Accessibility' },
        
        // Advanced
        'Ctrl+r': { action: 'resetColors', description: 'Reset all colors', category: 'Advanced' },
        'Ctrl+s': { action: 'savePreferences', description: 'Save preferences', category: 'Advanced' },
        'Ctrl+Shift+d': { action: 'toggleDebugMode', description: 'Toggle debug mode', category: 'Advanced' },
        
        // Quick actions
        'r': { action: 'refresh', description: 'Refresh data', category: 'Actions' },
        'n': { action: 'newItem', description: 'Create new item', category: 'Actions' },
        'e': { action: 'editSelected', description: 'Edit selected item', category: 'Actions' },
        'Delete': { action: 'deleteSelected', description: 'Delete selected item', category: 'Actions' },
        
        // Navigation within grids
        'ArrowUp': { action: 'navigateUp', description: 'Navigate up', category: 'Grid Navigation' },
        'ArrowDown': { action: 'navigateDown', description: 'Navigate down', category: 'Grid Navigation' },
        'ArrowLeft': { action: 'navigateLeft', description: 'Navigate left', category: 'Grid Navigation' },
        'ArrowRight': { action: 'navigateRight', description: 'Navigate right', category: 'Grid Navigation' },
        'Home': { action: 'navigateHome', description: 'Go to first item', category: 'Grid Navigation' },
        'End': { action: 'navigateEnd', description: 'Go to last item', category: 'Grid Navigation' },
        'PageUp': { action: 'pageUp', description: 'Page up', category: 'Grid Navigation' },
        'PageDown': { action: 'pageDown', description: 'Page down', category: 'Grid Navigation' },
        
        // Selection
        'Space': { action: 'toggleSelect', description: 'Toggle selection', category: 'Selection' },
        'Ctrl+a': { action: 'selectAll', description: 'Select all', category: 'Selection' },
        'Ctrl+d': { action: 'deselectAll', description: 'Deselect all', category: 'Selection' },
        
        // Zoom and focus
        'Ctrl+=': { action: 'zoomIn', description: 'Zoom in', category: 'Zoom' },
        'Ctrl+-': { action: 'zoomOut', description: 'Zoom out', category: 'Zoom' },
        'Ctrl+0': { action: 'resetZoom', description: 'Reset zoom', category: 'Zoom' }
    };
    
    // Merge default and custom shortcuts
    const shortcuts = $derived(() => ({ ...defaultShortcuts, ...customShortcuts }));
    
    // Group shortcuts by category
    const shortcutsByCategory = $derived(() => {
        const grouped = {};
        Object.entries(shortcuts).forEach(([key, shortcut]) => {
            if (!grouped[shortcut.category]) {
                grouped[shortcut.category] = [];
            }
            grouped[shortcut.category].push({ key, ...shortcut });
        });
        return grouped;
    });
    
    // Track pressed keys for combination detection
    let pressedKeys = $state(new Set());
    let keySequence = $state([]);
    let sequenceTimeout;
    
    // Handle keydown events
    function handleKeyDown(event) {
        if (!enabled || !userPreferencesStore.keyboardShortcuts) return;
        
        // Skip if user is typing in an input
        if (isTypingInInput(event.target)) return;
        
        const key = normalizeKey(event);
        pressedKeys.add(key);
        
        // Build key combination string
        const combination = buildKeyCombination(event);
        
        // Check for exact match
        if (shortcuts[combination]) {
            event.preventDefault();
            executeShortcut(shortcuts[combination].action, event);
            return;
        }
        
        // Handle sequence shortcuts (like vim-style)
        handleKeySequence(key, event);
    }
    
    // Handle keyup events
    function handleKeyUp(event) {
        const key = normalizeKey(event);
        pressedKeys.delete(key);
    }
    
    // Normalize key representation
    function normalizeKey(event) {
        let key = event.key;
        
        // Normalize special keys
        if (key === ' ') key = 'Space';
        if (key === 'Esc') key = 'Escape';
        
        return key;
    }
    
    // Build key combination string
    function buildKeyCombination(event) {
        const parts = [];
        
        if (event.ctrlKey) parts.push('Ctrl');
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey) parts.push('Shift');
        if (event.metaKey) parts.push('Meta');
        
        const key = normalizeKey(event);
        if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
            parts.push(key);
        }
        
        return parts.join('+');
    }
    
    // Handle key sequences (for vim-style shortcuts)
    function handleKeySequence(key, event) {
        keySequence.push(key);
        
        // Clear sequence timeout
        if (sequenceTimeout) {
            clearTimeout(sequenceTimeout);
        }
        
        // Set new timeout to clear sequence
        sequenceTimeout = setTimeout(() => {
            keySequence = [];
        }, 1000);
        
        // Check for sequence matches
        const sequence = keySequence.join(' ');
        
        // Example: 'g g' for go to top
        if (sequence === 'g g') {
            event.preventDefault();
            executeShortcut('navigateHome', event);
            keySequence = [];
        }
        
        // Example: 'g e' for go to end
        if (sequence === 'g e') {
            event.preventDefault();
            executeShortcut('navigateEnd', event);
            keySequence = [];
        }
    }
    
    // Check if user is typing in an input element
    function isTypingInInput(element) {
        const tagName = element.tagName.toLowerCase();
        const inputTypes = ['input', 'textarea', 'select'];
        const editableElements = element.contentEditable === 'true';
        
        return inputTypes.includes(tagName) || editableElements;
    }
    
    // Execute shortcut action
    function executeShortcut(action, event) {
        dispatch('shortcut', { action, event });
        
        // Provide visual feedback
        showShortcutFeedback(action);
    }
    
    // Show visual feedback for executed shortcuts
    function showShortcutFeedback(action) {
        if (!userPreferencesStore.showNotifications) return;
        
        const shortcut = Object.values(shortcuts).find(s => s.action === action);
        if (shortcut) {
            // Create temporary feedback element
            const feedback = document.createElement('div');
            feedback.className = 'shortcut-feedback';
            feedback.textContent = shortcut.description;
            feedback.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.9rem;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            `;
            
            document.body.appendChild(feedback);
            
            // Animate in
            requestAnimationFrame(() => {
                feedback.style.opacity = '1';
            });
            
            // Remove after delay
            setTimeout(() => {
                feedback.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(feedback);
                }, 200);
            }, 1500);
        }
    }
    
    // Get shortcut key for action
    function getShortcutKey(action) {
        const entry = Object.entries(shortcuts).find(([key, shortcut]) => shortcut.action === action);
        return entry ? entry[0] : null;
    }
    
    // Format key combination for display
    function formatKeyCombo(key) {
        return key.split('+').map(part => {
            // Use symbols for modifier keys
            switch (part) {
                case 'Ctrl': return '⌃';
                case 'Alt': return '⌥';
                case 'Shift': return '⇧';
                case 'Meta': return '⌘';
                case 'Space': return '␣';
                case 'Escape': return '⎋';
                case 'ArrowUp': return '↑';
                case 'ArrowDown': return '↓';
                case 'ArrowLeft': return '←';
                case 'ArrowRight': return '→';
                default: return part;
            }
        }).join('');
    }
    
    // Toggle shortcuts help
    function toggleHelp() {
        showHelp = !showHelp;
    }
</script>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<!-- Keyboard shortcuts help panel -->
{#if showHelp}
    <div class="shortcuts-overlay" onclick={() => showHelp = false} role="dialog" aria-modal="true">
        <div class="shortcuts-panel glass" onclick={(e) => e.stopPropagation()}>
            <header class="shortcuts-header">
                <h2 class="text-high-contrast">Keyboard Shortcuts</h2>
                <button 
                    class="close-btn touch-target"
                    onclick={() => showHelp = false}
                    aria-label="Close shortcuts panel"
                >
                    ✕
                </button>
            </header>
            
            <div class="shortcuts-content">
                {#each Object.entries(shortcutsByCategory) as [category, categoryShortcuts]}
                    <div class="shortcut-category">
                        <h3 class="category-title text-medium-contrast">{category}</h3>
                        <div class="shortcut-list">
                            {#each categoryShortcuts as shortcut}
                                <div class="shortcut-item">
                                    <div class="shortcut-key">
                                        <kbd class="key-combo">{formatKeyCombo(shortcut.key)}</kbd>
                                    </div>
                                    <div class="shortcut-description text-medium-contrast">
                                        {shortcut.description}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
            
            <footer class="shortcuts-footer">
                <p class="text-low-contrast">
                    Press <kbd>h</kbd> to toggle this panel, or <kbd>Escape</kbd> to close.
                </p>
            </footer>
        </div>
    </div>
{/if}

<style>
    .shortcuts-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    }
    
    .shortcuts-panel {
        width: 90%;
        max-width: 800px;
        max-height: 80vh;
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .shortcuts-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .shortcuts-header h2 {
        margin: 0;
        font-size: 1.5rem;
    }
    
    .close-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        border-radius: 8px;
        font-size: 1.2rem;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    
    .shortcuts-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px 24px;
    }
    
    .shortcut-category {
        margin-bottom: 32px;
    }
    
    .category-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .shortcut-list {
        display: grid;
        gap: 8px;
    }
    
    .shortcut-item {
        display: grid;
        grid-template-columns: 120px 1fr;
        align-items: center;
        gap: 16px;
        padding: 8px 0;
    }
    
    .shortcut-key {
        display: flex;
        justify-content: flex-start;
    }
    
    .key-combo {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        padding: 4px 8px;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.9);
        min-width: 24px;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    
    .shortcut-description {
        font-size: 0.95rem;
        line-height: 1.4;
    }
    
    .shortcuts-footer {
        padding: 16px 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
    }
    
    .shortcuts-footer kbd {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 0.8rem;
        font-family: inherit;
    }
    
    /* Global shortcut feedback styles */
    :global(.shortcut-feedback) {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    @media (max-width: 768px) {
        .shortcuts-panel {
            width: 95%;
            max-height: 90vh;
        }
        
        .shortcuts-header {
            padding: 16px 20px;
        }
        
        .shortcuts-content {
            padding: 16px 20px;
        }
        
        .shortcut-item {
            grid-template-columns: 100px 1fr;
            gap: 12px;
        }
        
        .key-combo {
            font-size: 0.8rem;
            padding: 3px 6px;
        }
        
        .shortcut-description {
            font-size: 0.9rem;
        }
    }
</style>
