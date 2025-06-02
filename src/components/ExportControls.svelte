<script>
  let { exportHTML, downloadHTML } = $props();
</script>

<div class="export-controls">
  <button class="export-btn" onclick={exportHTML}>
    🔗 View HTML
  </button>
  <button class="export-btn" onclick={downloadHTML}>
    💾 Download HTML
  </button>
</div>