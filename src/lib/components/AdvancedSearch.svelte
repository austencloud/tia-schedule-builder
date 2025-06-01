<script>
    import { createEventDispatcher } from 'svelte';
    import ContextualTooltip from './ContextualTooltip.svelte';
    
    const dispatch = createEventDispatcher();
    
    let { 
        placeholder = 'Search schedules, staff, or departments...',
        searchableFields = ['staff', 'role', 'area', 'department'],
        data = [],
        maxResults = 50,
        showAdvanced = $bindable(false),
        className = ''
    } = $props();
    
    let searchQuery = $state('');
    let searchInput;
    let searchResults = $state([]);
    let selectedIndex = $state(-1);
    let isSearching = $state(false);
    let searchHistory = $state([]);
    let showResults = $state(false);
    let searchTimeout;
    
    // Advanced search filters
    let dateRange = $state({ start: '', end: '' });
    let timeRange = $state({ start: '', end: '' });
    let selectedDepartments = $state(new Set());
    let selectedStaffTypes = $state(new Set());
    let sortBy = $state('relevance');
    let sortOrder = $state('desc');
    
    // Search configuration
    const searchConfig = {
        fuzzyThreshold: 0.6,
        highlightMatches: true,
        caseSensitive: false,
        wholeWord: false
    };
    
    // Perform intelligent search with fuzzy matching
    function performSearch(query) {
        if (!query.trim()) {
            searchResults = [];
            showResults = false;
            return;
        }
        
        isSearching = true;
        const normalizedQuery = query.toLowerCase().trim();
        const queryWords = normalizedQuery.split(/\s+/);
        
        const results = [];
        
        // Search through all data items
        data.forEach((item, index) => {
            const matches = [];
            let totalScore = 0;
            
            // Search in specified fields
            searchableFields.forEach(field => {
                if (item[field]) {
                    const fieldValue = item[field].toString().toLowerCase();
                    const fieldScore = calculateFieldScore(fieldValue, queryWords);
                    
                    if (fieldScore > 0) {
                        matches.push({
                            field,
                            value: item[field],
                            score: fieldScore,
                            highlights: highlightMatches(item[field], queryWords)
                        });
                        totalScore += fieldScore;
                    }
                }
            });
            
            // Apply advanced filters
            if (matches.length > 0 && passesAdvancedFilters(item)) {
                results.push({
                    item,
                    index,
                    matches,
                    score: totalScore,
                    relevance: calculateRelevance(matches, queryWords)
                });
            }
        });
        
        // Sort results by relevance and selected criteria
        results.sort((a, b) => {
            if (sortBy === 'relevance') {
                return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
            } else if (sortBy === 'date') {
                const dateA = new Date(a.item.date || 0);
                const dateB = new Date(b.item.date || 0);
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            }
            return 0;
        });
        
        searchResults = results.slice(0, maxResults);
        showResults = true;
        isSearching = false;
        selectedIndex = -1;
        
        // Dispatch search event
        dispatch('search', {
            query,
            results: searchResults,
            totalFound: results.length
        });
    }
    
    // Calculate field matching score
    function calculateFieldScore(fieldValue, queryWords) {
        let score = 0;
        
        queryWords.forEach(word => {
            if (fieldValue.includes(word)) {
                // Exact match gets higher score
                if (fieldValue === word) {
                    score += 10;
                } else if (fieldValue.startsWith(word)) {
                    score += 8;
                } else if (fieldValue.includes(` ${word} `)) {
                    score += 6;
                } else {
                    score += 3;
                }
            } else {
                // Fuzzy matching for typos
                const fuzzyScore = calculateFuzzyScore(fieldValue, word);
                if (fuzzyScore > searchConfig.fuzzyThreshold) {
                    score += fuzzyScore * 2;
                }
            }
        });
        
        return score;
    }
    
    // Simple fuzzy matching algorithm
    function calculateFuzzyScore(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    
    // Levenshtein distance for fuzzy matching
    function levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    // Highlight matching text
    function highlightMatches(text, queryWords) {
        let highlighted = text;
        
        queryWords.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });
        
        return highlighted;
    }
    
    // Check if item passes advanced filters
    function passesAdvancedFilters(item) {
        // Department filter
        if (selectedDepartments.size > 0 && !selectedDepartments.has(item.department)) {
            return false;
        }
        
        // Staff type filter
        if (selectedStaffTypes.size > 0 && !selectedStaffTypes.has(item.type)) {
            return false;
        }
        
        // Date range filter
        if (dateRange.start || dateRange.end) {
            const itemDate = new Date(item.date);
            if (dateRange.start && itemDate < new Date(dateRange.start)) return false;
            if (dateRange.end && itemDate > new Date(dateRange.end)) return false;
        }
        
        return true;
    }
    
    // Calculate relevance score
    function calculateRelevance(matches, queryWords) {
        let relevance = 0;
        
        matches.forEach(match => {
            // Higher relevance for exact matches in important fields
            if (match.field === 'staff' || match.field === 'role') {
                relevance += match.score * 1.5;
            } else {
                relevance += match.score;
            }
        });
        
        return relevance;
    }
    
    // Handle search input with debouncing
    function handleSearchInput(event) {
        const query = event.target.value;
        searchQuery = query;
        
        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Debounce search
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    }
    
    // Handle keyboard navigation
    function handleKeydown(event) {
        if (!showResults || searchResults.length === 0) return;
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, searchResults.length - 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                break;
            case 'Enter':
                event.preventDefault();
                if (selectedIndex >= 0) {
                    selectResult(searchResults[selectedIndex]);
                }
                break;
            case 'Escape':
                event.preventDefault();
                clearSearch();
                break;
        }
    }
    
    // Select a search result
    function selectResult(result) {
        // Add to search history
        if (!searchHistory.includes(searchQuery)) {
            searchHistory = [searchQuery, ...searchHistory.slice(0, 9)];
        }
        
        dispatch('select', result);
        showResults = false;
        selectedIndex = -1;
    }
    
    // Clear search
    function clearSearch() {
        searchQuery = '';
        searchResults = [];
        showResults = false;
        selectedIndex = -1;
        searchInput?.focus();
    }
    
    // Toggle advanced search
    function toggleAdvanced() {
        showAdvanced = !showAdvanced;
    }
</script>

<div class="advanced-search {className}">
    <!-- Main search input -->
    <div class="search-input-container">
        <div class="search-input-wrapper">
            <input
                bind:this={searchInput}
                type="text"
                bind:value={searchQuery}
                {placeholder}
                class="search-input touch-target"
                oninput={handleSearchInput}
                onkeydown={handleKeydown}
                onfocus={() => showResults = searchResults.length > 0}
                aria-label="Search input"
                aria-expanded={showResults}
                aria-haspopup="listbox"
                aria-autocomplete="list"
                role="combobox"
            />
            
            <div class="search-actions">
                {#if searchQuery}
                    <button 
                        class="clear-search-btn touch-target"
                        onclick={clearSearch}
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                {/if}
                
                <ContextualTooltip content="Advanced search options">
                    <button 
                        class="advanced-toggle-btn touch-target"
                        class:active={showAdvanced}
                        onclick={toggleAdvanced}
                        aria-label="Toggle advanced search"
                        aria-pressed={showAdvanced}
                    >
                        ⚙️
                    </button>
                </ContextualTooltip>
                
                <div class="search-icon" aria-hidden="true">🔍</div>
            </div>
        </div>
        
        {#if isSearching}
            <div class="search-loading" aria-live="polite">
                Searching...
            </div>
        {/if}
    </div>
    
    <!-- Advanced search filters -->
    {#if showAdvanced}
        <div class="advanced-filters glass">
            <h3 class="text-high-contrast">Advanced Search</h3>
            
            <div class="filter-grid">
                <!-- Date range -->
                <div class="filter-group">
                    <label class="filter-label text-medium-contrast">Date Range</label>
                    <div class="date-inputs">
                        <input 
                            type="date" 
                            bind:value={dateRange.start}
                            class="filter-input"
                            aria-label="Start date"
                        />
                        <span class="text-low-contrast">to</span>
                        <input 
                            type="date" 
                            bind:value={dateRange.end}
                            class="filter-input"
                            aria-label="End date"
                        />
                    </div>
                </div>
                
                <!-- Sort options -->
                <div class="filter-group">
                    <label class="filter-label text-medium-contrast">Sort By</label>
                    <select bind:value={sortBy} class="filter-select">
                        <option value="relevance">Relevance</option>
                        <option value="date">Date</option>
                        <option value="staff">Staff Name</option>
                    </select>
                    <select bind:value={sortOrder} class="filter-select">
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>
        </div>
    {/if}
    
    <!-- Search results -->
    {#if showResults && searchResults.length > 0}
        <div class="search-results glass" role="listbox" aria-label="Search results">
            {#each searchResults as result, index}
                <div 
                    class="search-result-item"
                    class:selected={index === selectedIndex}
                    onclick={() => selectResult(result)}
                    onkeydown={(e) => e.key === 'Enter' && selectResult(result)}
                    role="option"
                    aria-selected={index === selectedIndex}
                    tabindex="0"
                >
                    <div class="result-content">
                        <div class="result-primary text-high-contrast">
                            {@html result.matches[0]?.highlights || result.item.staff || 'Unknown'}
                        </div>
                        <div class="result-secondary text-medium-contrast">
                            {result.item.role} • {result.item.area}
                        </div>
                        <div class="result-meta text-low-contrast">
                            {result.item.department} • Score: {result.score.toFixed(1)}
                        </div>
                    </div>
                    <div class="result-actions">
                        <span class="relevance-score" aria-label="Relevance score">
                            {Math.round(result.relevance)}%
                        </span>
                    </div>
                </div>
            {/each}
            
            {#if searchResults.length === maxResults}
                <div class="results-footer text-low-contrast">
                    Showing first {maxResults} results. Refine your search for more specific results.
                </div>
            {/if}
        </div>
    {:else if showResults && searchQuery && !isSearching}
        <div class="no-results glass text-medium-contrast">
            No results found for "{searchQuery}". Try different keywords or check advanced filters.
        </div>
    {/if}
</div>

<style>
    .advanced-search {
        position: relative;
        width: 100%;
        max-width: 600px;
    }
    
    .search-input-container {
        position: relative;
    }
    
    .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }
    
    .search-input {
        width: 100%;
        padding: 12px 120px 12px 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        color: white;
        font-size: 1rem;
        transition: all 0.2s ease;
    }
    
    .search-input:focus {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.5);
        outline: none;
    }
    
    .search-input::placeholder {
        color: rgba(255, 255, 255, 0.6);
    }
    
    .search-actions {
        position: absolute;
        right: 8px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .clear-search-btn,
    .advanced-toggle-btn {
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
    }
    
    .clear-search-btn:hover,
    .advanced-toggle-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
    }
    
    .advanced-toggle-btn.active {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
    }
    
    .search-icon {
        color: rgba(255, 255, 255, 0.6);
        font-size: 1.1rem;
        margin-left: 8px;
    }
    
    .search-loading {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        padding: 8px 16px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 0 0 8px 8px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
        z-index: 1000;
    }
    
    .advanced-filters {
        margin-top: 12px;
        padding: 20px;
        border-radius: 12px;
    }
    
    .advanced-filters h3 {
        margin: 0 0 16px 0;
        font-size: 1.1rem;
    }
    
    .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
    }
    
    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .filter-label {
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .date-inputs {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .filter-input,
    .filter-select {
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: white;
        font-size: 0.9rem;
    }
    
    .filter-input:focus,
    .filter-select:focus {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.4);
        outline: none;
    }
    
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 4px;
        max-height: 400px;
        overflow-y: auto;
        border-radius: 12px;
        z-index: 1000;
        padding: 8px;
    }
    
    .search-result-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;
    }
    
    .search-result-item:hover,
    .search-result-item.selected {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
    }
    
    .result-content {
        flex: 1;
    }
    
    .result-primary {
        font-weight: 600;
        margin-bottom: 4px;
    }
    
    .result-primary :global(mark) {
        background: rgba(255, 255, 0, 0.3);
        color: #ffffff;
        padding: 1px 2px;
        border-radius: 2px;
    }
    
    .result-secondary {
        font-size: 0.9rem;
        margin-bottom: 2px;
    }
    
    .result-meta {
        font-size: 0.8rem;
    }
    
    .result-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .relevance-score {
        background: rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.9);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .no-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 4px;
        padding: 16px;
        border-radius: 12px;
        text-align: center;
        z-index: 1000;
    }
    
    .results-footer {
        padding: 8px 16px;
        text-align: center;
        font-size: 0.8rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 8px;
    }
    
    @media (max-width: 768px) {
        .search-input {
            padding: 10px 100px 10px 14px;
            font-size: 0.95rem;
        }
        
        .filter-grid {
            grid-template-columns: 1fr;
        }
        
        .date-inputs {
            flex-direction: column;
            align-items: stretch;
        }
    }
</style>
