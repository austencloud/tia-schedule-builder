<script>
    import { scheduleData } from '../data/scheduleData.js';

    // Calculate total directly - this is the most reliable approach
    const totalWeeklyHours = scheduleData.reduce((total, day) => total + day.totalHours, 0);
</script>

<header class="glass header">
    <div class="header-content">
        <h1 class="text-high-contrast">Museum Staffing Schedule</h1>
        <p class="subtitle text-medium-contrast">June 2025 - Optimized Weekly Template</p>
        <div class="stats" role="group" aria-label="Schedule statistics">
            <div class="stat-item">
                <span class="stat-value text-high-contrast" aria-label="Total weekly hours: {totalWeeklyHours}">{totalWeeklyHours}</span>
                <span class="stat-label text-medium-contrast">Total Weekly Hours</span>
            </div>
            <div class="stat-item">
                <span class="stat-value text-high-contrast" aria-label="Monthly hours: 496">496</span>
                <span class="stat-label text-medium-contrast">Monthly Hours</span>
            </div>
            <div class="stat-item">
                <span class="stat-value text-high-contrast" aria-label="Monthly cost: $11,708">$11,708</span>
                <span class="stat-label text-medium-contrast">Monthly Cost</span>
            </div>
        </div>
    </div>
</header>

<style>
    .header {
        padding: 30px;
        margin-bottom: 30px;
        text-align: center;
    }
    
    .header-content h1 {
        font-size: 2.5rem;
        font-weight: 300;
        margin-bottom: 10px;
    }

    .subtitle {
        font-size: 1.1rem;
        margin-bottom: 25px;
    }
    
    .stats {
        display: flex;
        justify-content: center;
        gap: 40px;
        flex-wrap: wrap;
    }
    
    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
    }
    
    .stat-value {
        font-size: 1.8rem;
        font-weight: 600;
    }

    .stat-label {
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    @media (max-width: 768px) {
        .header {
            padding: 20px;
        }
        
        .header-content h1 {
            font-size: 2rem;
        }
        
        .stats {
            gap: 20px;
        }
        
        .stat-value {
            font-size: 1.4rem;
        }
    }
</style>
