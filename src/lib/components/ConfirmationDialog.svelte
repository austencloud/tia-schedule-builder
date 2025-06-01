<script>
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    let { 
        isOpen = $bindable(false),
        title = 'Confirm Action',
        message = 'Are you sure you want to proceed?',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        type = 'warning', // 'warning', 'danger', 'info'
        showIcon = true,
        preventClose = false,
        confirmDisabled = false,
        details = '',
        consequences = []
    } = $props();
    
    let dialogElement;
    let confirmButton;
    
    const icons = {
        warning: '⚠️',
        danger: '🚨',
        info: 'ℹ️',
        success: '✅'
    };
    
    function handleConfirm() {
        dispatch('confirm');
        if (!preventClose) {
            isOpen = false;
        }
    }
    
    function handleCancel() {
        dispatch('cancel');
        if (!preventClose) {
            isOpen = false;
        }
    }
    
    function handleKeydown(event) {
        if (!isOpen) return;
        
        if (event.key === 'Escape' && !preventClose) {
            handleCancel();
        } else if (event.key === 'Enter' && !confirmDisabled) {
            handleConfirm();
        }
    }
    
    function handleOverlayClick(event) {
        if (event.target === event.currentTarget && !preventClose) {
            handleCancel();
        }
    }
    
    // Focus management
    $effect(() => {
        if (isOpen && confirmButton) {
            // Focus the confirm button when dialog opens
            setTimeout(() => {
                confirmButton.focus();
            }, 100);
        }
    });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <div 
        class="confirmation-overlay" 
        onclick={handleOverlayClick}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
    >
        <div class="confirmation-dialog glass {type}" bind:this={dialogElement}>
            <header class="dialog-header">
                {#if showIcon}
                    <div class="dialog-icon" aria-hidden="true">
                        {icons[type] || icons.warning}
                    </div>
                {/if}
                <h2 id="dialog-title" class="dialog-title text-high-contrast">
                    {title}
                </h2>
            </header>
            
            <div class="dialog-body">
                <p id="dialog-message" class="dialog-message text-medium-contrast">
                    {message}
                </p>
                
                {#if details}
                    <div class="dialog-details">
                        <details>
                            <summary class="details-toggle text-medium-contrast">
                                Show details
                            </summary>
                            <div class="details-content text-low-contrast">
                                {details}
                            </div>
                        </details>
                    </div>
                {/if}
                
                {#if consequences.length > 0}
                    <div class="dialog-consequences">
                        <h3 class="consequences-title text-medium-contrast">
                            This action will:
                        </h3>
                        <ul class="consequences-list">
                            {#each consequences as consequence}
                                <li class="consequence-item text-low-contrast">
                                    {consequence}
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </div>
            
            <footer class="dialog-footer">
                <button 
                    class="dialog-btn cancel-btn touch-target"
                    onclick={handleCancel}
                    aria-describedby="cancel-description"
                >
                    {cancelText}
                </button>
                <div id="cancel-description" class="sr-only">
                    Cancel this action and return to the previous state
                </div>
                
                <button 
                    bind:this={confirmButton}
                    class="dialog-btn confirm-btn touch-target {type}"
                    class:disabled={confirmDisabled}
                    onclick={handleConfirm}
                    disabled={confirmDisabled}
                    aria-describedby="confirm-description"
                >
                    {confirmText}
                </button>
                <div id="confirm-description" class="sr-only">
                    Proceed with the action. This cannot be undone.
                </div>
            </footer>
        </div>
    </div>
{/if}

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
    
    .confirmation-overlay {
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
        animation: overlayFadeIn 0.2s ease;
    }
    
    @keyframes overlayFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .confirmation-dialog {
        width: 100%;
        max-width: 500px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(15px);
        background: rgba(0, 0, 0, 0.8);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        animation: dialogSlideIn 0.3s ease;
    }
    
    @keyframes dialogSlideIn {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    .dialog-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px 24px 16px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .dialog-icon {
        font-size: 2rem;
        flex-shrink: 0;
    }
    
    .dialog-title {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 600;
    }
    
    .dialog-body {
        padding: 20px 24px;
    }
    
    .dialog-message {
        margin: 0 0 16px 0;
        line-height: 1.5;
        font-size: 1rem;
    }
    
    .dialog-details {
        margin: 16px 0;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        overflow: hidden;
    }
    
    .details-toggle {
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        cursor: pointer;
        font-size: 0.9rem;
        border: none;
        width: 100%;
        text-align: left;
        transition: background 0.2s ease;
    }
    
    .details-toggle:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .details-content {
        padding: 16px;
        font-size: 0.9rem;
        line-height: 1.4;
        background: rgba(0, 0, 0, 0.2);
    }
    
    .dialog-consequences {
        margin: 16px 0;
        padding: 16px;
        background: rgba(255, 193, 7, 0.1);
        border: 1px solid rgba(255, 193, 7, 0.3);
        border-radius: 8px;
    }
    
    .consequences-title {
        margin: 0 0 12px 0;
        font-size: 0.95rem;
        font-weight: 600;
    }
    
    .consequences-list {
        margin: 0;
        padding-left: 20px;
    }
    
    .consequence-item {
        margin-bottom: 6px;
        font-size: 0.9rem;
        line-height: 1.4;
    }
    
    .dialog-footer {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 16px 24px 24px 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .dialog-btn {
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 100px;
    }
    
    .cancel-btn {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .cancel-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
    }
    
    .confirm-btn {
        color: white;
        border: 1px solid transparent;
    }
    
    .confirm-btn.warning {
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    }
    
    .confirm-btn.danger {
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    }
    
    .confirm-btn.info {
        background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    }
    
    .confirm-btn.success {
        background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    }
    
    .confirm-btn:hover:not(.disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .confirm-btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
    }
    
    /* Type-specific dialog styling */
    .confirmation-dialog.danger {
        border-color: rgba(244, 67, 54, 0.5);
    }
    
    .confirmation-dialog.warning {
        border-color: rgba(255, 152, 0, 0.5);
    }
    
    .confirmation-dialog.info {
        border-color: rgba(33, 150, 243, 0.5);
    }
    
    .confirmation-dialog.success {
        border-color: rgba(76, 175, 80, 0.5);
    }
    
    @media (max-width: 768px) {
        .confirmation-overlay {
            padding: 16px;
        }
        
        .confirmation-dialog {
            max-width: 100%;
        }
        
        .dialog-header {
            padding: 20px 20px 16px 20px;
        }
        
        .dialog-body {
            padding: 16px 20px;
        }
        
        .dialog-footer {
            padding: 16px 20px 20px 20px;
            flex-direction: column-reverse;
        }
        
        .dialog-btn {
            width: 100%;
        }
        
        .dialog-title {
            font-size: 1.2rem;
        }
        
        .dialog-message {
            font-size: 0.95rem;
        }
    }
</style>
