<script>
  import { cloudDataStore } from '../lib/cloudStore.js';
  import { authService } from '../lib/supabase.js';
  
  let { onAuthClick } = $props();
  
  let syncStatus = $state({
    isOnline: navigator.onLine,
    syncInProgress: false,
    pendingChanges: 0,
    lastSyncTime: null
  });
  
  let user = $state(null);
  let showDetails = $state(false);
  
  // Update sync status periodically
  $effect(() => {
    const updateStatus = () => {
      syncStatus = cloudDataStore.getSyncStatus();
    };
    
    // Initial update
    updateStatus();
    
    // Update every 5 seconds
    const interval = setInterval(updateStatus, 5000);
    
    // Listen for online/offline events
    const handleOnline = () => {
      syncStatus.isOnline = true;
      updateStatus();
    };
    
    const handleOffline = () => {
      syncStatus.isOnline = false;
      updateStatus();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
  
  // Check authentication status
  $effect(() => {
    const checkAuth = async () => {
      user = await authService.getCurrentUser();
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      user = session?.user || null;
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  });
  
  function getStatusIcon() {
    if (!user) return '🔓';
    if (!syncStatus.isOnline) return '📴';
    if (syncStatus.syncInProgress) return '🔄';
    if (syncStatus.pendingChanges > 0) return '⏳';
    return '✅';
  }
  
  function getStatusText() {
    if (!user) return 'Not signed in';
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.syncInProgress) return 'Syncing...';
    if (syncStatus.pendingChanges > 0) return `${syncStatus.pendingChanges} pending`;
    return 'Synced';
  }
  
  function getStatusColor() {
    if (!user) return '#f39c12';
    if (!syncStatus.isOnline) return '#e74c3c';
    if (syncStatus.syncInProgress) return '#3498db';
    if (syncStatus.pendingChanges > 0) return '#f39c12';
    return '#27ae60';
  }
  
  function formatLastSync() {
    if (!syncStatus.lastSyncTime) return 'Never';
    
    const now = new Date();
    const lastSync = new Date(syncStatus.lastSyncTime);
    const diffMs = now - lastSync;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
  
  async function handleForceSync() {
    if (user && syncStatus.isOnline) {
      await cloudDataStore.forceSync();
    }
  }
  
  async function handleSignOut() {
    await authService.signOut();
    user = null;
  }
</script>

<div class="sync-status">
  <button 
    class="status-indicator"
    onclick={() => showDetails = !showDetails}
    style="color: {getStatusColor()}"
    title="Click for sync details"
  >
    <span class="status-icon">{getStatusIcon()}</span>
    <span class="status-text">{getStatusText()}</span>
  </button>
  
  {#if showDetails}
    <div class="status-details">
      <div class="detail-header">
        <h4>📊 Sync Status</h4>
        <button class="close-btn" onclick={() => showDetails = false}>×</button>
      </div>
      
      <div class="detail-content">
        {#if user}
          <div class="detail-item">
            <span class="detail-label">👤 Signed in as:</span>
            <span class="detail-value">{user.email}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">🌐 Connection:</span>
            <span class="detail-value" style="color: {syncStatus.isOnline ? '#27ae60' : '#e74c3c'}">
              {syncStatus.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">🔄 Last sync:</span>
            <span class="detail-value">{formatLastSync()}</span>
          </div>
          
          {#if syncStatus.pendingChanges > 0}
            <div class="detail-item">
              <span class="detail-label">⏳ Pending:</span>
              <span class="detail-value">{syncStatus.pendingChanges} changes</span>
            </div>
          {/if}
          
          <div class="detail-actions">
            {#if syncStatus.isOnline}
              <button class="sync-btn" onclick={handleForceSync} disabled={syncStatus.syncInProgress}>
                {syncStatus.syncInProgress ? '🔄 Syncing...' : '🔄 Force Sync'}
              </button>
            {/if}
            
            <button class="signout-btn" onclick={handleSignOut}>
              🚪 Sign Out
            </button>
          </div>
        {:else}
          <div class="not-signed-in">
            <p>🔓 <strong>Not signed in</strong></p>
            <p>Sign in to sync your schedules across devices and enable automatic backup.</p>
            
            <button class="signin-btn" onclick={onAuthClick}>
              📧 Sign In
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .sync-status {
    position: relative;
    display: inline-block;
  }
  
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #ddd;
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 0.85em;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
  }
  
  .status-indicator:hover {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .status-icon {
    font-size: 1.1em;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .status-text {
    font-weight: 500;
    white-space: nowrap;
  }
  
  .status-details {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    min-width: 280px;
    z-index: 1000;
    animation: slideDown 0.2s ease;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px 12px;
    border-bottom: 1px solid #eee;
  }
  
  .detail-header h4 {
    margin: 0;
    color: #2c3e50;
    font-size: 1em;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.2em;
    color: #7f8c8d;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .close-btn:hover {
    background: #f8f9fa;
    color: #2c3e50;
  }
  
  .detail-content {
    padding: 16px 20px 20px;
  }
  
  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 0.9em;
  }
  
  .detail-label {
    color: #7f8c8d;
    font-weight: 500;
  }
  
  .detail-value {
    color: #2c3e50;
    font-weight: 600;
    text-align: right;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .detail-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #eee;
  }
  
  .sync-btn, .signout-btn, .signin-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 0.85em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .sync-btn {
    background: #3498db;
    color: white;
  }
  
  .sync-btn:hover:not(:disabled) {
    background: #2980b9;
  }
  
  .sync-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .signout-btn {
    background: #e74c3c;
    color: white;
  }
  
  .signout-btn:hover {
    background: #c0392b;
  }
  
  .signin-btn {
    background: #27ae60;
    color: white;
    padding: 12px 16px;
    font-size: 0.9em;
  }
  
  .signin-btn:hover {
    background: #229954;
  }
  
  .not-signed-in {
    text-align: center;
  }
  
  .not-signed-in p {
    margin: 0 0 12px;
    color: #7f8c8d;
    font-size: 0.9em;
    line-height: 1.4;
  }
  
  .not-signed-in p:first-child {
    color: #2c3e50;
    font-size: 1em;
  }
  
  /* Mobile responsiveness */
  @media (max-width: 480px) {
    .status-details {
      right: -10px;
      left: -10px;
      min-width: auto;
    }
    
    .detail-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
    
    .detail-value {
      max-width: none;
      text-align: left;
    }
  }
</style>
