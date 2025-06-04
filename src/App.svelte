<script>
  import Header from './components/Header.svelte';
  import SummaryCards from './components/SummaryCards.svelte';
  import Calendar from './components/Calendar.svelte';
  import EventsSchedule from './components/EventsSchedule.svelte';
  import Footer from './components/Footer.svelte';
  import ExportControls from './components/ExportControls.svelte';
  import AuthModal from './components/AuthModal.svelte';
  import SyncStatus from './components/SyncStatus.svelte';
  import { scheduleData as initialData } from './data/scheduleData.js';
  import StaffSkillsAdmin from './components/StaffSkillsAdmin.svelte';
  import { cloudDataStore } from './lib/cloudStore.js';
  import { authService } from './lib/supabase.js';

  // Convert to reactive state using Svelte 5 runes with cloud sync
  let scheduleData = $state(structuredClone(initialData));
  let isLoading = $state(true);
  let showAuthModal = $state(false);
  let user = $state(null);

  // Initialize cloud data store
  $effect(() => {
    const initializeApp = async () => {
      try {
        // Check authentication status
        user = await authService.getCurrentUser();

        // Initialize cloud data store
        await cloudDataStore.initialize();

        // Get data from cloud store
        scheduleData = cloudDataStore.getData();

        // Listen for data changes from other devices
        window.addEventListener('schedule-data-changed', (event) => {
          scheduleData = event.detail.data;
        });

        // Listen for auth changes
        authService.onAuthStateChange((event, session) => {
          user = session?.user || null;
          if (user && !showAuthModal) {
            // User signed in, reinitialize cloud store
            cloudDataStore.initialize();
          }
        });

      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        isLoading = false;
      }
    };

    initializeApp();

    // Cleanup
    return () => {
      cloudDataStore.destroy();
    };
  });

  // Data management functions with cloud sync
  async function updateDayData(dayNumber, updatedDay) {
    // Update via cloud store (handles local update + cloud sync)
    await cloudDataStore.updateDay(dayNumber, updatedDay);

    // Get updated data from cloud store
    scheduleData = cloudDataStore.getData();
  }
  
  function updateSummaryStats() {
    // Recalculate summary statistics
    const totalStaff = new Set();
    let totalHours = 0;
    let daysWithStaff = 0;
    
    scheduleData.days.forEach(day => {
      if (day.staff.length > 0) {
        daysWithStaff++;
        day.staff.forEach(staff => totalStaff.add(staff.name));
        
        // Parse hours (simple approximation)
        const hours = day.totalHours.replace(/[^\d.]/g, '');
        totalHours += parseFloat(hours) || 0;
      }
    });
    
    scheduleData.summary = {
      ...scheduleData.summary,
      staffScheduled: `${totalStaff.size}/${Object.keys(scheduleData.staff).length}`,
      totalHours: `${Math.round(totalHours)}+`,
      daysWithCoverage: `${daysWithStaff}/30`,
      estimatedPayroll: `$${Math.round(totalHours * 17.2).toLocaleString()}`
    };
  }

  let reportContainer;
  let showAdminPanel = $state(false);

  function exportHTML() {
    const element = reportContainer;
    const exportWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>TIA Schedule Builder - Export</title>
          <style>
            ${getComputedStyles()}
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `;
    exportWindow.document.write(html);
    exportWindow.document.close();
  }

  function getComputedStyles() {
    const styleSheets = Array.from(document.styleSheets);
    let styles = '';
    
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules);
        rules.forEach(rule => {
          styles += rule.cssText + '\n';
        });
      } catch (e) {
        // Handle cross-origin stylesheets
      }
    });
    
    return styles;
  }

  function downloadHTML() {
    const element = reportContainer;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TIA Schedule Builder - Report</title>
  <style>
    ${getComputedStyles()}
  </style>
</head>
<body>
  ${element.innerHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tia-schedule-report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function toggleAdminPanel() {
    showAdminPanel = !showAdminPanel;
  }

  function handleAuthClick() {
    showAuthModal = true;
  }

  function handleAuthClose() {
    showAuthModal = false;
  }

  function handleAuthenticated() {
    showAuthModal = false;
    // Reinitialize cloud store after authentication
    cloudDataStore.initialize();
  }
</script>

{#if isLoading}
  <div class="loading-screen">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <h2>🏛️ Loading TIA Schedule Builder</h2>
      <p>Syncing your schedule data...</p>
    </div>
  </div>
{:else}
  <div class="app-header">
    <ExportControls {exportHTML} {downloadHTML} />
    <SyncStatus onAuthClick={handleAuthClick} />
  </div>

  <div class="container" bind:this={reportContainer}>
  <Header />

  <!-- Admin Panel Toggle -->
  <div class="admin-toggle">
    <button onclick={toggleAdminPanel} class="admin-btn">
      {showAdminPanel ? '📅 Back to Calendar' : '⚙️ Edit Staff Skills'}
    </button>
  </div>

  {#if showAdminPanel}
    <StaffSkillsAdmin />
  {:else}
    <main>
      <SummaryCards data={scheduleData.summary} />
      
      <div class="content">
        <Calendar days={scheduleData.days} staffList={scheduleData.staff} {updateDayData} />
        <EventsSchedule categories={scheduleData.eventCategories} />
      </div>
      
      <Footer />
    </main>
  {/if}
  </div>
{/if}

<!-- Authentication Modal -->
<AuthModal
  isOpen={showAuthModal}
  onClose={handleAuthClose}
  onAuthenticated={handleAuthenticated}
/>

<style>
  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .loading-content {
    text-align: center;
    color: white;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-content h2 {
    margin: 0 0 10px;
    font-size: 1.5em;
  }

  .loading-content p {
    margin: 0;
    opacity: 0.9;
  }

  .app-header {
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #eee;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
  }

  @media (max-width: 768px) {
    .app-header {
      flex-direction: column;
      gap: 10px;
      padding: 15px;
    }
  }
  .content {
    padding: 30px;
  }

  .admin-toggle {
    text-align: center;
    margin: 20px 0;
  }

  .admin-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .admin-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
</style>