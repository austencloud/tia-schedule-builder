<script>
    let {
        isOpen = $bindable(false),
        autoCollect = true,
        onMethodsReady = () => {}
    } = $props();
    
    // Performance metrics state
    let metrics = $state({
        // Core Web Vitals
        lcp: null, // Largest Contentful Paint
        fid: null, // First Input Delay
        cls: null, // Cumulative Layout Shift
        fcp: null, // First Contentful Paint
        ttfb: null, // Time to First Byte
        
        // Custom metrics
        componentRenderTime: [],
        filterPerformance: [],
        searchPerformance: [],
        memoryUsage: [],
        
        // User interaction metrics
        clickLatency: [],
        scrollPerformance: [],
        keyboardLatency: [],
        
        // Application metrics
        bundleSize: null,
        loadTime: null,
        domNodes: 0,
        eventListeners: 0,
        
        // Error tracking
        errors: [],
        warnings: [],
        
        // Usage analytics
        featureUsage: {},
        userFlow: [],
        sessionDuration: 0,
        
        // Accessibility metrics
        a11yViolations: [],
        keyboardNavigation: 0,
        screenReaderUsage: false
    });
    
    let sessionStartTime = Date.now();
    let isCollecting = $state(false);
    
    // Start performance monitoring
    function startMonitoring() {
        if (!autoCollect || isCollecting) return;
        
        isCollecting = true;
        
        // Core Web Vitals monitoring
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            observeMetric('largest-contentful-paint', (entries) => {
                const lastEntry = entries[entries.length - 1];
                metrics.lcp = Math.round(lastEntry.startTime);
            });
            
            // First Input Delay
            observeMetric('first-input', (entries) => {
                const firstEntry = entries[0];
                metrics.fid = Math.round(firstEntry.processingStart - firstEntry.startTime);
            });
            
            // Cumulative Layout Shift
            observeMetric('layout-shift', (entries) => {
                let clsValue = 0;
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                metrics.cls = Math.round(clsValue * 1000) / 1000;
            });
            
            // Navigation timing
            observeMetric('navigation', (entries) => {
                const entry = entries[0];
                metrics.ttfb = Math.round(entry.responseStart - entry.requestStart);
                metrics.loadTime = Math.round(entry.loadEventEnd - entry.navigationStart);
            });
            
            // Paint timing
            observeMetric('paint', (entries) => {
                entries.forEach(entry => {
                    if (entry.name === 'first-contentful-paint') {
                        metrics.fcp = Math.round(entry.startTime);
                    }
                });
            });
        }
        
        // Memory monitoring
        if ('memory' in performance) {
            monitorMemoryUsage();
        }
        
        // DOM monitoring
        monitorDOMMetrics();
        
        // User interaction monitoring
        monitorUserInteractions();
        
        // Error monitoring
        monitorErrors();
        
        // Accessibility monitoring
        monitorAccessibility();
    }
    
    // Observe specific performance metrics
    function observeMetric(type, callback) {
        try {
            const observer = new PerformanceObserver((list) => {
                callback(list.getEntries());
            });
            observer.observe({ type, buffered: true });
        } catch (error) {
            console.warn(`Failed to observe ${type}:`, error);
        }
    }
    
    // Monitor memory usage
    function monitorMemoryUsage() {
        const updateMemory = () => {
            if ('memory' in performance) {
                const memory = performance.memory;
                metrics.memoryUsage.push({
                    timestamp: Date.now(),
                    used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
                });
                
                // Keep only last 100 entries
                if (metrics.memoryUsage.length > 100) {
                    metrics.memoryUsage = metrics.memoryUsage.slice(-100);
                }
            }
        };
        
        updateMemory();
        setInterval(updateMemory, 5000); // Update every 5 seconds
    }
    
    // Monitor DOM metrics
    function monitorDOMMetrics() {
        const updateDOMMetrics = () => {
            try {
                // Count DOM nodes
                metrics.domNodes = document.querySelectorAll('*').length;

                // Event listener counting - browser-compatible approach
                // Note: getEventListeners is only available in Chrome DevTools console, not runtime
                // We'll use an approximation based on common event-bearing elements
                let listenerCount = 0;

                // Check if we're in a development environment with DevTools access
                const isDevEnvironment = typeof window !== 'undefined' &&
                                        window.chrome &&
                                        window.chrome.runtime &&
                                        typeof getEventListeners === 'function';

                if (isDevEnvironment) {
                    // Use DevTools API if available (development only)
                    try {
                        document.querySelectorAll('*').forEach(el => {
                            const events = getEventListeners(el);
                            listenerCount += Object.keys(events).length;
                        });
                    } catch (error) {
                        console.warn('DevTools getEventListeners failed:', error);
                        listenerCount = estimateEventListeners();
                    }
                } else {
                    // Production-safe approximation
                    listenerCount = estimateEventListeners();
                }

                metrics.eventListeners = listenerCount;
            } catch (error) {
                console.warn('DOM metrics collection failed:', error);
                // Graceful fallback
                metrics.domNodes = 0;
                metrics.eventListeners = 0;
            }
        };

        // Helper function to estimate event listeners without DevTools API
        function estimateEventListeners() {
            let estimate = 0;

            // Count elements that commonly have event listeners
            const interactiveSelectors = [
                'button', 'a', 'input', 'select', 'textarea', 'form',
                '[onclick]', '[onchange]', '[onsubmit]', '[onkeydown]',
                '[onkeyup]', '[onmousedown]', '[onmouseup]', '[onmouseover]',
                '.clickable', '.interactive', '[role="button"]', '[tabindex]'
            ];

            interactiveSelectors.forEach(selector => {
                try {
                    estimate += document.querySelectorAll(selector).length;
                } catch (e) {
                    // Ignore selector errors
                }
            });

            // Add estimates for common framework patterns
            estimate += document.querySelectorAll('[data-svelte-h]').length; // Svelte components
            estimate += document.querySelectorAll('[class*="svelte-"]').length; // Svelte styled elements

            return estimate;
        }

        updateDOMMetrics();
        setInterval(updateDOMMetrics, 10000); // Update every 10 seconds
    }
    
    // Monitor user interactions
    function monitorUserInteractions() {
        // Click latency
        document.addEventListener('click', (event) => {
            const startTime = performance.now();
            requestAnimationFrame(() => {
                const latency = performance.now() - startTime;
                metrics.clickLatency.push({
                    timestamp: Date.now(),
                    latency: Math.round(latency),
                    target: event.target.tagName
                });
                
                if (metrics.clickLatency.length > 50) {
                    metrics.clickLatency = metrics.clickLatency.slice(-50);
                }
            });
        });
        
        // Scroll performance
        let scrollStartTime;
        document.addEventListener('scroll', () => {
            if (!scrollStartTime) {
                scrollStartTime = performance.now();
            }
        });
        
        document.addEventListener('scrollend', () => {
            if (scrollStartTime) {
                const duration = performance.now() - scrollStartTime;
                metrics.scrollPerformance.push({
                    timestamp: Date.now(),
                    duration: Math.round(duration)
                });
                scrollStartTime = null;
                
                if (metrics.scrollPerformance.length > 50) {
                    metrics.scrollPerformance = metrics.scrollPerformance.slice(-50);
                }
            }
        });
        
        // Keyboard latency
        document.addEventListener('keydown', (event) => {
            const startTime = performance.now();
            requestAnimationFrame(() => {
                const latency = performance.now() - startTime;
                metrics.keyboardLatency.push({
                    timestamp: Date.now(),
                    latency: Math.round(latency),
                    key: event.key
                });
                
                if (metrics.keyboardLatency.length > 50) {
                    metrics.keyboardLatency = metrics.keyboardLatency.slice(-50);
                }
            });
        });
    }
    
    // Monitor errors and warnings
    function monitorErrors() {
        window.addEventListener('error', (event) => {
            metrics.errors.push({
                timestamp: Date.now(),
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
            
            if (metrics.errors.length > 20) {
                metrics.errors = metrics.errors.slice(-20);
            }
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            metrics.errors.push({
                timestamp: Date.now(),
                message: 'Unhandled Promise Rejection',
                reason: event.reason?.toString(),
                stack: event.reason?.stack
            });
        });
        
        // Console warning monitoring
        const originalWarn = console.warn;
        console.warn = (...args) => {
            metrics.warnings.push({
                timestamp: Date.now(),
                message: args.join(' ')
            });
            
            if (metrics.warnings.length > 20) {
                metrics.warnings = metrics.warnings.slice(-20);
            }
            
            originalWarn.apply(console, args);
        };
    }
    
    // Monitor accessibility
    function monitorAccessibility() {
        // Track keyboard navigation
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                metrics.keyboardNavigation++;
            }
        });
        
        // Detect screen reader usage
        if (window.speechSynthesis || navigator.userAgent.includes('NVDA') || 
            navigator.userAgent.includes('JAWS') || navigator.userAgent.includes('VoiceOver')) {
            metrics.screenReaderUsage = true;
        }
    }
    
    // Track feature usage
    function trackFeatureUsage(feature) {
        if (!metrics.featureUsage[feature]) {
            metrics.featureUsage[feature] = 0;
        }
        metrics.featureUsage[feature]++;
    }
    
    // Track user flow
    function trackUserFlow(action, context = {}) {
        metrics.userFlow.push({
            timestamp: Date.now(),
            action,
            context
        });
        
        if (metrics.userFlow.length > 100) {
            metrics.userFlow = metrics.userFlow.slice(-100);
        }
    }
    
    // Calculate performance score
    const performanceScore = $derived(() => {
        let score = 100;
        
        // Core Web Vitals scoring
        if (metrics.lcp > 4000) score -= 20;
        else if (metrics.lcp > 2500) score -= 10;
        
        if (metrics.fid > 300) score -= 20;
        else if (metrics.fid > 100) score -= 10;
        
        if (metrics.cls > 0.25) score -= 20;
        else if (metrics.cls > 0.1) score -= 10;
        
        // Memory usage scoring
        const latestMemory = metrics.memoryUsage[metrics.memoryUsage.length - 1];
        if (latestMemory) {
            const memoryUsagePercent = (latestMemory.used / latestMemory.limit) * 100;
            if (memoryUsagePercent > 80) score -= 15;
            else if (memoryUsagePercent > 60) score -= 8;
        }
        
        // Error penalty
        score -= metrics.errors.length * 5;
        
        return Math.max(0, Math.min(100, score));
    });
    
    // Get performance grade
    const performanceGrade = $derived(() => {
        const score = performanceScore;
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    });
    
    // Export performance data
    function exportData() {
        const data = {
            ...metrics,
            sessionDuration: Date.now() - sessionStartTime,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Clear metrics
    function clearMetrics() {
        metrics = {
            lcp: null,
            fid: null,
            cls: null,
            fcp: null,
            ttfb: null,
            componentRenderTime: [],
            filterPerformance: [],
            searchPerformance: [],
            memoryUsage: [],
            clickLatency: [],
            scrollPerformance: [],
            keyboardLatency: [],
            bundleSize: null,
            loadTime: null,
            domNodes: 0,
            eventListeners: 0,
            errors: [],
            warnings: [],
            featureUsage: {},
            userFlow: [],
            sessionDuration: 0,
            a11yViolations: [],
            keyboardNavigation: 0,
            screenReaderUsage: false
        };
        sessionStartTime = Date.now();
    }
    
    // Start monitoring on component mount
    $effect(() => {
        if (autoCollect) {
            startMonitoring();
        }
    });
    
    // Expose methods to parent
    $effect(() => {
        onMethodsReady({
            trackFeatureUsage,
            trackUserFlow,
            exportData,
            clearMetrics,
            startMonitoring
        });
    });

    // Handle keyboard events for accessibility
    function handleOverlayKeydown(event) {
        if (event.key === 'Escape') {
            isOpen = false;
        }
    }

    function handlePanelKeydown(event) {
        // Prevent event bubbling to overlay
        event.stopPropagation();
    }
</script>

{#if isOpen}
    <div
        class="performance-overlay"
        onclick={() => isOpen = false}
        onkeydown={handleOverlayKeydown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="performance-monitor-title"
        tabindex="-1"
    >
        <div
            class="performance-panel glass"
            onclick={(e) => e.stopPropagation()}
            onkeydown={handlePanelKeydown}
            role="document"
        >
            <header class="performance-header">
                <h2 id="performance-monitor-title" class="text-high-contrast">Performance Monitor</h2>
                <div class="performance-score">
                    <span class="score-value grade-{performanceGrade.toLowerCase()}">{performanceScore}</span>
                    <span class="score-grade">{performanceGrade}</span>
                </div>
                <button 
                    class="close-btn touch-target"
                    onclick={() => isOpen = false}
                    aria-label="Close performance monitor"
                >
                    ✕
                </button>
            </header>
            
            <div class="performance-content">
                <!-- Core Web Vitals -->
                <section class="metrics-section">
                    <h3 class="text-medium-contrast">Core Web Vitals</h3>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-label">LCP</div>
                            <div class="metric-value">{metrics.lcp || 'N/A'}ms</div>
                            <div class="metric-status {metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor'}">
                                {metrics.lcp <= 2500 ? 'Good' : metrics.lcp <= 4000 ? 'Needs Improvement' : 'Poor'}
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div class="metric-label">FID</div>
                            <div class="metric-value">{metrics.fid || 'N/A'}ms</div>
                            <div class="metric-status {metrics.fid <= 100 ? 'good' : metrics.fid <= 300 ? 'needs-improvement' : 'poor'}">
                                {metrics.fid <= 100 ? 'Good' : metrics.fid <= 300 ? 'Needs Improvement' : 'Poor'}
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div class="metric-label">CLS</div>
                            <div class="metric-value">{metrics.cls || 'N/A'}</div>
                            <div class="metric-status {metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor'}">
                                {metrics.cls <= 0.1 ? 'Good' : metrics.cls <= 0.25 ? 'Needs Improvement' : 'Poor'}
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Memory Usage -->
                {#if metrics.memoryUsage.length > 0}
                    <section class="metrics-section">
                        <h3 class="text-medium-contrast">Memory Usage</h3>
                        <div class="memory-info">
                            {#each metrics.memoryUsage.slice(-1) as memory}
                                <div class="memory-stat">
                                    <span>Used: {memory.used}MB</span>
                                    <span>Total: {memory.total}MB</span>
                                    <span>Limit: {memory.limit}MB</span>
                                </div>
                            {/each}
                        </div>
                    </section>
                {/if}
                
                <!-- Errors and Warnings -->
                {#if metrics.errors.length > 0 || metrics.warnings.length > 0}
                    <section class="metrics-section">
                        <h3 class="text-medium-contrast">Issues</h3>
                        <div class="issues-list">
                            {#each metrics.errors.slice(-5) as error}
                                <div class="issue-item error">
                                    <strong>Error:</strong> {error.message}
                                    <small>{new Date(error.timestamp).toLocaleTimeString()}</small>
                                </div>
                            {/each}
                            {#each metrics.warnings.slice(-5) as warning}
                                <div class="issue-item warning">
                                    <strong>Warning:</strong> {warning.message}
                                    <small>{new Date(warning.timestamp).toLocaleTimeString()}</small>
                                </div>
                            {/each}
                        </div>
                    </section>
                {/if}
                
                <!-- Feature Usage -->
                {#if Object.keys(metrics.featureUsage).length > 0}
                    <section class="metrics-section">
                        <h3 class="text-medium-contrast">Feature Usage</h3>
                        <div class="feature-usage">
                            {#each Object.entries(metrics.featureUsage) as [feature, count]}
                                <div class="feature-item">
                                    <span class="feature-name">{feature}</span>
                                    <span class="feature-count">{count}</span>
                                </div>
                            {/each}
                        </div>
                    </section>
                {/if}
            </div>
            
            <footer class="performance-footer">
                <button class="action-btn touch-target" onclick={exportData}>
                    Export Data
                </button>
                <button class="action-btn touch-target" onclick={clearMetrics}>
                    Clear Metrics
                </button>
            </footer>
        </div>
    </div>
{/if}

<style>
    .performance-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    }
    
    .performance-panel {
        width: 90%;
        max-width: 900px;
        max-height: 80vh;
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .performance-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .performance-header h2 {
        margin: 0;
        font-size: 1.5rem;
    }
    
    .performance-score {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .score-value {
        font-size: 2rem;
        font-weight: 700;
        padding: 8px 12px;
        border-radius: 8px;
    }
    
    .score-value.grade-a { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
    .score-value.grade-b { background: rgba(139, 195, 74, 0.2); color: #8bc34a; }
    .score-value.grade-c { background: rgba(255, 193, 7, 0.2); color: #ffc107; }
    .score-value.grade-d { background: rgba(255, 152, 0, 0.2); color: #ff9800; }
    .score-value.grade-f { background: rgba(244, 67, 54, 0.2); color: #f44336; }
    
    .score-grade {
        font-size: 1.2rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.8);
    }
    
    .close-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        border-radius: 8px;
        font-size: 1.2rem;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    
    .performance-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px 24px;
    }
    
    .metrics-section {
        margin-bottom: 32px;
    }
    
    .metrics-section h3 {
        margin: 0 0 16px 0;
        font-size: 1.1rem;
        font-weight: 600;
    }
    
    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
    }
    
    .metric-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 16px;
        text-align: center;
    }
    
    .metric-label {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 8px;
    }
    
    .metric-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: white;
        margin-bottom: 8px;
    }
    
    .metric-status {
        font-size: 0.8rem;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 500;
    }
    
    .metric-status.good { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
    .metric-status.needs-improvement { background: rgba(255, 193, 7, 0.2); color: #ffc107; }
    .metric-status.poor { background: rgba(244, 67, 54, 0.2); color: #f44336; }
    
    .memory-info {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
    }
    
    .memory-stat {
        display: flex;
        gap: 16px;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
    }
    
    .issues-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .issue-item {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.9rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .issue-item.error {
        background: rgba(244, 67, 54, 0.1);
        border: 1px solid rgba(244, 67, 54, 0.3);
        color: #f44336;
    }
    
    .issue-item.warning {
        background: rgba(255, 193, 7, 0.1);
        border: 1px solid rgba(255, 193, 7, 0.3);
        color: #ffc107;
    }
    
    .feature-usage {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 8px;
    }
    
    .feature-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        font-size: 0.9rem;
    }
    
    .feature-name {
        color: rgba(255, 255, 255, 0.8);
    }
    
    .feature-count {
        color: white;
        font-weight: 600;
    }
    
    .performance-footer {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 16px 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .action-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: rgba(255, 255, 255, 0.9);
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .action-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
    }
    
    @media (max-width: 768px) {
        .performance-panel {
            width: 95%;
            max-height: 90vh;
        }
        
        .performance-header {
            padding: 16px 20px;
            flex-direction: column;
            gap: 12px;
        }
        
        .performance-content {
            padding: 16px 20px;
        }
        
        .metrics-grid {
            grid-template-columns: 1fr;
        }
        
        .memory-info {
            flex-direction: column;
        }
        
        .performance-footer {
            flex-direction: column;
            padding: 16px 20px;
        }
    }
</style>
