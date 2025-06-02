<script>
  let { categories } = $props();
</script>

<div class="section">
  <h2>🎉 Events & Special Programming Schedule</h2>
  
  <div class="events-categories">
    {#each categories as category}
      <div class="event-category">
        <h3 style="color: {category.color}">{category.title}</h3>
        <div class="events-list">
          {#each category.events as event}
            <div class="event-item" style="border-left-color: {category.color}">
              {event}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .section {
    margin-bottom: 40px;
  }

  .section h2 {
    color: #2c3e50;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #ecf0f1;
    font-size: 1.8em;
  }

  .events-categories {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 25px;
  }

  .event-category {
    background: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-top: 4px solid #3498db;
  }

  .event-category h3 {
    margin-bottom: 20px;
    font-size: 1.3em;
    font-weight: 600;
  }

  .events-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .event-item {
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #3498db;
    font-size: 0.95em;
    line-height: 1.5;
    transition: all 0.2s ease;
  }

  .event-item:hover {
    background: #e9ecef;
    transform: translateX(5px);
  }

  @media (max-width: 768px) {
    .events-categories {
      grid-template-columns: 1fr;
    }
  }
</style>