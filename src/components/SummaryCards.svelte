<script>
  let { data } = $props();
</script>

<div class="summary-cards">
  <div class="card cost">
    <div class="card-value">{data.estimatedPayroll}</div>
    <div class="card-label">Estimated Monthly Payroll</div>
  </div>
  <div class="card hours">
    <div class="card-value">{data.totalHours}</div>
    <div class="card-label">Total Monthly Hours</div>
  </div>
  <div class="card staff">
    <div class="card-value">{data.staffScheduled}</div>
    <div class="card-label">Staff Actually Scheduled</div>
  </div>
  <div class="card days">
    <div class="card-value">{data.daysWithCoverage}</div>
    <div class="card-label">Days with Coverage (June)</div>
  </div>
</div>

<style>
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 30px;
    background: #f8f9fa;
  }

  .card {
    background: white;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    text-align: center;
    border-left: 4px solid #3498db;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .card.cost {
    border-left-color: #27ae60;
  }
  .card.hours {
    border-left-color: #f39c12;
  }
  .card.staff {
    border-left-color: #e74c3c;
  }
  .card.days {
    border-left-color: #9b59b6;
  }

  .card-value {
    font-size: 2.5em;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 5px;
    line-height: 1.1;
  }

  .card-label {
    color: #7f8c8d;
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 1px;
    line-height: 1.3;
  }

  @media (max-width: 480px) {
    .summary-cards {
      grid-template-columns: 1fr;
      padding: 20px;
    }
    .card {
      padding: 20px;
    }
    .card-value {
      font-size: 2em;
    }
    .card-label {
      font-size: 0.8em;
    }
  }

  @media (max-width: 768px) and (min-width: 481px) {
    .summary-cards {
      grid-template-columns: 1fr;
    }
    .card-value {
      font-size: 2.2em;
    }
  }

  @media (max-width: 1024px) and (min-width: 769px) {
    .summary-cards {
      grid-template-columns: repeat(2, 1fr);
    }
    .card-value {
      font-size: 2.3em;
    }
  }
</style>