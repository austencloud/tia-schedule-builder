<script>
  let { isOpen, onClose, title, children } = $props();
  
  let modalElement;
  let isDragging = $state(false);
  let dragOffset = $state(0);
  let startY = 0;
  
  function handleTouchStart(e) {
    if (e.target.closest('.drag-handle')) {
      isDragging = true;
      startY = e.touches[0].clientY;
      dragOffset = 0;
    }
  }
  
  function handleTouchMove(e) {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only allow dragging down
    if (deltaY > 0) {
      dragOffset = deltaY;
    }
  }
  
  function handleTouchEnd() {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Close modal if dragged down more than 100px
    if (dragOffset > 100) {
      onClose();
    }
    
    dragOffset = 0;
  }
  
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
  
  // Prevent body scroll when modal is open
  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  });
</script>

<div 
  class="mobile-modal-backdrop" 
  class:open={isOpen}
  onclick={handleBackdropClick}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
>
  <div 
    class="mobile-modal-sheet" 
    bind:this={modalElement}
    style="transform: translateY({dragOffset}px)"
    role="dialog"
    aria-modal="true"
    aria-labelledby="mobile-modal-title"
  >
    <div class="drag-handle"></div>
    
    <div class="mobile-modal-header">
      <h3 id="mobile-modal-title">{title}</h3>
      <button class="close-button" onclick={onClose} aria-label="Close modal">
        ✕
      </button>
    </div>
    
    <div class="mobile-modal-content">
      {@render children()}
    </div>
  </div>
</div>

<style>
  .mobile-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }
  
  .mobile-modal-backdrop.open {
    opacity: 1;
    visibility: visible;
  }
  
  .mobile-modal-sheet {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-radius: 20px 20px 0 0;
    max-height: 90vh;
    min-height: 50vh;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.2);
  }
  
  .mobile-modal-backdrop.open .mobile-modal-sheet {
    transform: translateY(0);
  }
  
  .drag-handle {
    width: 40px;
    height: 4px;
    background: #ccc;
    border-radius: 2px;
    margin: 12px auto 8px;
    cursor: grab;
    touch-action: none;
  }
  
  .drag-handle:active {
    cursor: grabbing;
  }
  
  .mobile-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
  }
  
  .mobile-modal-header h3 {
    margin: 0;
    font-size: 1.2em;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5em;
    color: #666;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }
  
  .close-button:hover {
    background: #f0f0f0;
    color: #333;
  }
  
  .close-button:active {
    transform: scale(0.95);
  }
  
  .mobile-modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Ensure proper touch scrolling on iOS */
  .mobile-modal-content::-webkit-scrollbar {
    display: none;
  }
  
  /* Focus management */
  .mobile-modal-sheet:focus {
    outline: none;
  }
  
  /* Animation for drag gesture */
  .mobile-modal-sheet.dragging {
    transition: none;
  }
</style>
