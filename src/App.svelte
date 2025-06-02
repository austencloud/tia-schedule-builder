<script>
  import Header from './components/Header.svelte';
  import SummaryCards from './components/SummaryCards.svelte';
  import Calendar from './components/Calendar.svelte';
  import EventsSchedule from './components/EventsSchedule.svelte';
  import Footer from './components/Footer.svelte';
  import ExportControls from './components/ExportControls.svelte';
  import { scheduleData as initialData } from './data/scheduleData.js';

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
</script>

<ExportControls {exportHTML} {downloadHTML} />

<div class="container" bind:this={reportContainer}>
  <Header />
  <SummaryCards data={scheduleData.summary} />
  
  <div class="content">
    <Calendar days={scheduleData.days} staffList={scheduleData.staff} {updateDayData} />
    <EventsSchedule categories={scheduleData.eventCategories} />
  </div>
  
  <Footer />
</div>

<style>
  .content {
    padding: 30px;
  }
</style>