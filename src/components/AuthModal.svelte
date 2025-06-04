<script>
  import { authService } from '../lib/supabase.js';
  
  let { isOpen, onClose, onAuthenticated } = $props();
  
  let email = $state('');
  let isLoading = $state(false);
  let message = $state('');
  let messageType = $state('info'); // 'info', 'success', 'error'
  
  async function handleSignIn() {
    if (!email || !email.includes('@')) {
      message = 'Please enter a valid email address';
      messageType = 'error';
      return;
    }
    
    try {
      isLoading = true;
      message = '';
      
      await authService.signInWithEmail(email);
      
      message = 'Check your email for a sign-in link!';
      messageType = 'success';
      
      // Clear form
      email = '';
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Sign in error:', error);
      message = error.message || 'Failed to send sign-in email. Please try again.';
      messageType = 'error';
    } finally {
      isLoading = false;
    }
  }
  
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleSignIn();
    }
  }
  
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <div class="auth-backdrop" onclick={handleBackdropClick}>
    <div class="auth-modal">
      <div class="auth-header">
        <h2>🏛️ TIA Museum Access</h2>
        <p>Sign in to sync your schedules across all devices</p>
      </div>
      
      <div class="auth-content">
        <div class="auth-form">
          <label for="email">Email Address</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            onkeypress={handleKeyPress}
            placeholder="your.email@museum.org"
            disabled={isLoading}
            autocomplete="email"
          />
          
          <button 
            class="sign-in-btn" 
            onclick={handleSignIn}
            disabled={isLoading || !email}
          >
            {#if isLoading}
              <span class="loading-spinner"></span>
              Sending...
            {:else}
              📧 Send Sign-In Link
            {/if}
          </button>
        </div>
        
        {#if message}
          <div class="message {messageType}">
            {message}
          </div>
        {/if}
        
        <div class="auth-info">
          <h3>✨ Benefits of signing in:</h3>
          <ul>
            <li>🔄 <strong>Sync across devices</strong> - Access your schedules on phone, tablet, and computer</li>
            <li>💾 <strong>Automatic backup</strong> - Never lose your schedule data</li>
            <li>👥 <strong>Real-time updates</strong> - See changes instantly on all devices</li>
            <li>📊 <strong>Share reports</strong> - Generate and share professional schedule reports</li>
          </ul>
          
          <div class="privacy-note">
            <small>
              🔒 <strong>Privacy:</strong> We only use your email for sign-in. 
              No passwords required, no spam, no data sharing.
            </small>
          </div>
        </div>
        
        <div class="auth-actions">
          <button class="skip-btn" onclick={onClose}>
            Skip for now (local only)
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .auth-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
  }
  
  .auth-modal {
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .auth-header {
    text-align: center;
    padding: 30px 30px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 16px 16px 0 0;
  }
  
  .auth-header h2 {
    margin: 0 0 10px;
    font-size: 1.5em;
    font-weight: 600;
  }
  
  .auth-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.95em;
  }
  
  .auth-content {
    padding: 30px;
  }
  
  .auth-form {
    margin-bottom: 25px;
  }
  
  .auth-form label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .auth-form input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #ecf0f1;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
    margin-bottom: 16px;
    box-sizing: border-box;
  }
  
  .auth-form input:focus {
    outline: none;
    border-color: #667eea;
  }
  
  .auth-form input:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
  
  .sign-in-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
  }
  
  .sign-in-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .sign-in-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .message {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-weight: 500;
  }
  
  .message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  .message.info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  }
  
  .auth-info {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .auth-info h3 {
    margin: 0 0 15px;
    color: #2c3e50;
    font-size: 1.1em;
  }
  
  .auth-info ul {
    margin: 0 0 15px;
    padding-left: 0;
    list-style: none;
  }
  
  .auth-info li {
    margin-bottom: 8px;
    padding-left: 0;
    color: #34495e;
    line-height: 1.4;
  }
  
  .privacy-note {
    background: white;
    padding: 12px;
    border-radius: 6px;
    border-left: 4px solid #27ae60;
  }
  
  .privacy-note small {
    color: #27ae60;
    line-height: 1.4;
  }
  
  .auth-actions {
    text-align: center;
  }
  
  .skip-btn {
    background: none;
    border: 2px solid #bdc3c7;
    color: #7f8c8d;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.2s ease;
  }
  
  .skip-btn:hover {
    border-color: #95a5a6;
    color: #2c3e50;
  }
  
  /* Mobile responsiveness */
  @media (max-width: 480px) {
    .auth-backdrop {
      padding: 10px;
    }
    
    .auth-modal {
      border-radius: 12px;
    }
    
    .auth-header {
      padding: 20px 20px 15px;
    }
    
    .auth-content {
      padding: 20px;
    }
    
    .auth-header h2 {
      font-size: 1.3em;
    }
  }
</style>
