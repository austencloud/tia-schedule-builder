// TIA Schedule Builder - Table Handler Module
// Manages the interactive staff payroll table

export class TableHandler {
    constructor(staffData) {
        this.staffData = staffData;
        this.currentSort = { column: null, direction: null };
        this.filteredData = [...staffData];
        this.searchTerm = '';
        this.activeFilters = new Set();
        
        this.container = document.getElementById('staff-table-container');
    }
    
    async render() {
        if (!this.container) {
            console.error('Table container not found');
            return;
        }
        
        this.container.innerHTML = this.generateTableHTML();
        this.setupEventListeners();
        this.updateSummary();
    }
    
    generateTableHTML() {
        return `
            <div class="table-controls">
                <input type="text" class="table-search" placeholder="Search staff..." id="staffSearch">
                <div class="table-filters">
                    <button class="filter-button" data-filter="all">All Staff</button>
                    <button class="filter-button" data-filter="scheduled">Scheduled</button>
                    <button class="filter-button" data-filter="unscheduled">Unscheduled</button>
                    <button class="filter-button" data-filter="optimal">Optimal (75-125%)</button>
                    <button class="filter-button" data-filter="under">Under-utilized</button>
                </div>
            </div>
            
            <table class="staff-table" id="staffTable">
                <thead>
                    <tr>
                        <th class="sortable" data-column="name" data-type="text">Staff Name</th>
                        <th class="sortable" data-column="type" data-type="text">Staff Type</th>
                        <th class="sortable" data-column="rate" data-type="currency">Hourly Rate</th>
                        <th class="sortable" data-column="hours" data-type="number">Total Hours</th>
                        <th class="sortable" data-column="pay" data-type="currency">Monthly Pay</th>
                        <th class="sortable" data-column="weeklyDesired" data-type="number">Weekly Desired</th>
                        <th class="sortable" data-column="utilization" data-type="percentage">Utilization</th>
                    </tr>
                </thead>
                <tbody id="staffTableBody">
                    ${this.generateTableRows()}
                </tbody>
            </table>
            
            <div class="table-summary" id="tableSummary">
                <!-- Summary will be populated by updateSummary() -->
            </div>
        `;
    }
    
    generateTableRows() {
        const totalRow = this.calculateTotals();
        
        return `
            ${this.filteredData.map(staff => `
                <tr class="${staff.hours === 0 ? 'unscheduled' : ''}">
                    <td><strong>${staff.name}</strong></td>
                    <td>${staff.type}</td>
                    <td class="currency">$${staff.rate.toFixed(2)}</td>
                    <td class="number">${staff.hours}</td>
                    <td class="currency"><strong>$${staff.pay.toFixed(2)}</strong></td>
                    <td class="number">${staff.weeklyDesired}</td>
                    <td><span class="utilization ${this.getUtilizationClass(staff.utilization)}">${staff.utilization}%</span></td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="3"><strong>TOTAL (${this.filteredData.filter(s => s.hours > 0).length} staff scheduled)</strong></td>
                <td class="number"><strong>${totalRow.totalHours} hours</strong></td>
                <td class="currency"><strong>$${totalRow.totalPay.toFixed(2)}</strong></td>
                <td colspan="2"><strong>Avg: $${totalRow.avgRate.toFixed(2)}/hour</strong></td>
            </tr>
        `;
    }
    
    getUtilizationClass(utilization) {
        if (utilization === 0) return 'none';
        if (utilization >= 75 && utilization <= 125) return 'optimal';
        return 'under';
    }
    
    calculateTotals() {
        const scheduledStaff = this.filteredData.filter(s => s.hours > 0);
        const totalHours = scheduledStaff.reduce((sum, s) => sum + s.hours, 0);
        const totalPay = scheduledStaff.reduce((sum, s) => sum + s.pay, 0);
        const avgRate = totalHours > 0 ? totalPay / totalHours : 0;
        
        return { totalHours, totalPay, avgRate };
    }
    
    setupEventListeners() {
        // Sortable headers
        const headers = this.container.querySelectorAll('th.sortable');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.column;
                const type = header.dataset.type;
                this.handleSort(column, type, header);
            });
        });
        
        // Search functionality
        const searchInput = this.container.querySelector('#staffSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        // Filter buttons
        const filterButtons = this.container.querySelectorAll('.filter-button');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleFilter(button.dataset.filter, button);
            });
        });
        
        // Set default filter
        const allButton = this.container.querySelector('[data-filter="all"]');
        if (allButton) {
            allButton.classList.add('active');
        }
    }
    
    handleSort(column, type, headerElement) {
        // Determine sort direction
        let direction = 'asc';
        if (this.currentSort.column === column && this.currentSort.direction === 'asc') {
            direction = 'desc';
        }
        
        // Clear previous sort indicators
        const headers = this.container.querySelectorAll('th.sortable');
        headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
        
        // Add current sort indicator
        headerElement.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');
        
        // Sort the data
        this.sortData(column, type, direction);
        
        // Update current sort
        this.currentSort = { column, direction };
        
        // Re-render table body
        this.updateTableBody();
    }
    
    sortData(column, type, direction) {
        this.filteredData.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            if (type === 'text') {
                aVal = aVal.toString().toLowerCase();
                bVal = bVal.toString().toLowerCase();
            } else if (type === 'number' || type === 'currency' || type === 'percentage') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            }
            
            if (direction === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
    }
    
    handleSearch(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase();
        this.applyFilters();
    }
    
    handleFilter(filterType, buttonElement) {
        // Update active filter button
        const filterButtons = this.container.querySelectorAll('.filter-button');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        buttonElement.classList.add('active');
        
        // Apply filter
        this.activeFilters.clear();
        this.activeFilters.add(filterType);
        this.applyFilters();
    }
    
    applyFilters() {
        this.filteredData = this.staffData.filter(staff => {
            // Search filter
            if (this.searchTerm && !staff.name.toLowerCase().includes(this.searchTerm)) {
                return false;
            }
            
            // Category filters
            for (const filter of this.activeFilters) {
                switch (filter) {
                    case 'all':
                        return true;
                    case 'scheduled':
                        if (staff.hours === 0) return false;
                        break;
                    case 'unscheduled':
                        if (staff.hours > 0) return false;
                        break;
                    case 'optimal':
                        if (staff.utilization < 75 || staff.utilization > 125) return false;
                        break;
                    case 'under':
                        if (staff.utilization >= 75 || staff.utilization === 0) return false;
                        break;
                }
            }
            
            return true;
        });
        
        // Re-apply current sort if any
        if (this.currentSort.column) {
            this.sortData(this.currentSort.column, 
                         this.getColumnType(this.currentSort.column), 
                         this.currentSort.direction);
        }
        
        this.updateTableBody();
        this.updateSummary();
    }
    
    getColumnType(column) {
        const typeMap = {
            name: 'text',
            type: 'text',
            rate: 'currency',
            hours: 'number',
            pay: 'currency',
            weeklyDesired: 'number',
            utilization: 'percentage'
        };
        return typeMap[column] || 'text';
    }
    
    updateTableBody() {
        const tbody = this.container.querySelector('#staffTableBody');
        if (tbody) {
            tbody.innerHTML = this.generateTableRows();
        }
    }
    
    updateSummary() {
        const summaryContainer = this.container.querySelector('#tableSummary');
        if (!summaryContainer) return;
        
        const totals = this.calculateTotals();
        const scheduledCount = this.filteredData.filter(s => s.hours > 0).length;
        const optimalCount = this.filteredData.filter(s => s.utilization >= 75 && s.utilization <= 125).length;
        const underUtilizedCount = this.filteredData.filter(s => s.utilization < 75 && s.utilization > 0).length;
        
        summaryContainer.innerHTML = `
            <div class="summary-item">
                <div class="summary-value">${scheduledCount}</div>
                <div class="summary-label">Scheduled Staff</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${totals.totalHours}</div>
                <div class="summary-label">Total Hours</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">$${totals.totalPay.toFixed(0)}</div>
                <div class="summary-label">Total Pay</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${optimalCount}</div>
                <div class="summary-label">Optimal Utilization</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${underUtilizedCount}</div>
                <div class="summary-label">Under-Utilized</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">$${totals.avgRate.toFixed(2)}</div>
                <div class="summary-label">Avg Rate/Hour</div>
            </div>
        `;
    }
}
