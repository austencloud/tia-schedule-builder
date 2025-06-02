<div class="footer">
  <div class="footer-content">
    <div class="footer-section">
      <h4>📋 Report Details</h4>
      <p>Generated: {new Date().toLocaleDateString()}</p>
      <p>Period: June 2025</p>
      <p>Status: CORRECTED</p>
    </div>
    
    <div class="footer-section">
      <h4>🏢 TIA Schedule Builder</h4>
      <p>Modern workforce management</p>
      <p>Built with Svelte 5</p>
    </div>
    
    <div class="footer-section">
      <h4>📞 Support</h4>
      <p>Schedule questions: Contact HR</p>
      <p>Technical issues: IT Support</p>
    </div>
  </div>
  
  <div class="footer-bottom">
    <p>&copy; 2025 TIA Schedule Builder. All rights reserved.</p>
  </div>
</div>

<style>
  .footer {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: white;
    margin-top: 40px;
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    padding: 40px 30px;
  }

  .footer-section h4 {
    margin-bottom: 15px;
    font-size: 1.1em;
    color: #ecf0f1;
  }

  .footer-section p {
    margin-bottom: 8px;
    opacity: 0.8;
    font-size: 0.9em;
  }

  .footer-bottom {
    background: rgba(0, 0, 0, 0.2);
    padding: 20px 30px;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer-bottom p {
    margin: 0;
    opacity: 0.7;
    font-size: 0.85em;
  }

  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: 1fr;
      padding: 30px 20px;
    }
  }
</style>