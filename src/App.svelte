<script>
  import Header from './components/Header.svelte';
  import SummaryCards from './components/SummaryCards.svelte';
  import Calendar from './components/Calendar.svelte';
  import EventsSchedule from './components/EventsSchedule.svelte';
  import Footer from './components/Footer.svelte';
  import ExportControls from './components/ExportControls.svelte';
  import { scheduleData as initialData } from './data/scheduleData.js';
  import StaffSkillsAdmin from './components/StaffSkillsAdmin.svelte';

  // Convert to reactive state using Svelte 5 runes
  let scheduleData = $state(structuredClone(initialData));
  
  // Data management functions
  function updateDayData(dayNumber, updatedDay) {
    const dayIndex = scheduleData.days.findIndex(d => d.day === dayNumber);
    if (dayIndex !== -1) {
      scheduleData.days[dayIndex] = { ...updatedDay };
      updateSummaryStats();
    }
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
</script>

<ExportControls {exportHTML} {downloadHTML} />

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

<style>
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