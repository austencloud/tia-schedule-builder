import { scheduleService, authService } from './supabase.js';
import { initialData } from '../data/scheduleData.js';

// Cloud-enabled data store with offline support
export class CloudDataStore {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.pendingChanges = [];
    this.lastSyncTime = null;
    this.realtimeSubscription = null;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Initialize the store
  async initialize() {
    try {
      // Check if user is authenticated
      const user = await authService.getCurrentUser();
      
      if (user) {
        // Load data from cloud
        await this.loadFromCloud();
        // Set up real-time sync
        this.setupRealtimeSync();
      } else {
        // Use local data for now
        this.loadFromLocal();
      }
    } catch (error) {
      console.error('Error initializing cloud store:', error);
      // Fallback to local data
      this.loadFromLocal();
    }
  }

  // Load data from cloud
  async loadFromCloud() {
    try {
      const cloudData = await scheduleService.getCurrentSchedule();
      
      if (cloudData && cloudData.data) {
        // Use cloud data
        this.data = cloudData.data;
        this.lastSyncTime = new Date(cloudData.updated_at);
        
        // Cache locally for offline use
        this.saveToLocal(this.data);
      } else {
        // No cloud data exists, use initial data and save to cloud
        this.data = structuredClone(initialData);
        await this.saveToCloud();
      }
    } catch (error) {
      console.error('Error loading from cloud:', error);
      // Fallback to local data
      this.loadFromLocal();
    }
  }

  // Load data from local storage
  loadFromLocal() {
    try {
      const localData = localStorage.getItem('tia-schedule-data');
      if (localData) {
        this.data = JSON.parse(localData);
      } else {
        this.data = structuredClone(initialData);
        this.saveToLocal(this.data);
      }
    } catch (error) {
      console.error('Error loading from local storage:', error);
      this.data = structuredClone(initialData);
    }
  }

  // Save data to local storage
  saveToLocal(data) {
    try {
      localStorage.setItem('tia-schedule-data', JSON.stringify(data));
      localStorage.setItem('tia-schedule-last-sync', new Date().toISOString());
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  }

  // Save data to cloud
  async saveToCloud() {
    if (!this.isOnline) {
      // Queue for later sync
      this.pendingChanges.push({
        type: 'full_save',
        data: structuredClone(this.data),
        timestamp: new Date().toISOString()
      });
      return;
    }

    try {
      this.syncInProgress = true;
      await scheduleService.saveSchedule(this.data);
      this.lastSyncTime = new Date();
      
      // Clear pending changes after successful sync
      this.pendingChanges = [];
      
      // Update local cache
      this.saveToLocal(this.data);
    } catch (error) {
      console.error('Error saving to cloud:', error);
      // Queue for retry
      this.pendingChanges.push({
        type: 'full_save',
        data: structuredClone(this.data),
        timestamp: new Date().toISOString()
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  // Update a specific day
  async updateDay(dayNumber, dayData) {
    // Update local data immediately for responsiveness
    const dayIndex = this.data.days.findIndex(d => d.day === dayNumber);
    if (dayIndex !== -1) {
      this.data.days[dayIndex] = { ...dayData };
      
      // Update summary stats
      this.updateSummaryStats();
      
      // Save locally immediately
      this.saveToLocal(this.data);
    }

    if (!this.isOnline) {
      // Queue for later sync
      this.pendingChanges.push({
        type: 'day_update',
        dayNumber,
        data: structuredClone(dayData),
        timestamp: new Date().toISOString()
      });
      return;
    }

    try {
      // Save to cloud
      await scheduleService.updateDay(dayNumber, dayData);
      this.lastSyncTime = new Date();
    } catch (error) {
      console.error('Error updating day in cloud:', error);
      // Queue for retry
      this.pendingChanges.push({
        type: 'day_update',
        dayNumber,
        data: structuredClone(dayData),
        timestamp: new Date().toISOString()
      });
    }
  }

  // Update summary statistics
  updateSummaryStats() {
    const totalStaffHours = this.data.days.reduce((sum, day) => sum + parseFloat(day.totalHours || 0), 0);
    const totalStaffCount = new Set(
      this.data.days.flatMap(day => day.staff.map(s => s.name))
    ).size;
    const daysWithCoverage = this.data.days.filter(day => day.staff.length > 0).length;
    
    this.data.summary = {
      ...this.data.summary,
      totalStaffHours,
      totalStaffCount,
      daysWithCoverage,
      estimatedPayroll: totalStaffHours * 15 // $15/hour estimate
    };
  }

  // Sync pending changes when back online
  async syncPendingChanges() {
    if (!this.isOnline || this.syncInProgress || this.pendingChanges.length === 0) {
      return;
    }

    try {
      this.syncInProgress = true;
      
      // Sort changes by timestamp
      this.pendingChanges.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      for (const change of this.pendingChanges) {
        if (change.type === 'full_save') {
          await scheduleService.saveSchedule(change.data);
        } else if (change.type === 'day_update') {
          await scheduleService.updateDay(change.dayNumber, change.data);
        }
      }
      
      // Clear pending changes after successful sync
      this.pendingChanges = [];
      this.lastSyncTime = new Date();
      
      console.log('Successfully synced pending changes');
    } catch (error) {
      console.error('Error syncing pending changes:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Set up real-time synchronization
  setupRealtimeSync() {
    this.realtimeSubscription = scheduleService.subscribeToChanges((payload) => {
      // Handle real-time updates from other devices
      this.handleRealtimeUpdate(payload);
    });
  }

  // Handle real-time updates
  async handleRealtimeUpdate(payload) {
    try {
      // Reload data from cloud to get latest changes
      const cloudData = await scheduleService.getCurrentSchedule();
      
      if (cloudData && cloudData.data) {
        // Check if this update is newer than our last sync
        const updateTime = new Date(cloudData.updated_at);
        if (!this.lastSyncTime || updateTime > this.lastSyncTime) {
          // Update local data
          this.data = cloudData.data;
          this.lastSyncTime = updateTime;
          
          // Update local cache
          this.saveToLocal(this.data);
          
          // Notify UI about the update
          this.notifyDataChanged();
        }
      }
    } catch (error) {
      console.error('Error handling real-time update:', error);
    }
  }

  // Notify UI components about data changes
  notifyDataChanged() {
    // Dispatch custom event for UI components to listen to
    window.dispatchEvent(new CustomEvent('schedule-data-changed', {
      detail: { data: this.data }
    }));
  }

  // Get current data
  getData() {
    return this.data;
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingChanges: this.pendingChanges.length,
      lastSyncTime: this.lastSyncTime
    };
  }

  // Force sync
  async forceSync() {
    if (this.isOnline) {
      await this.saveToCloud();
      await this.syncPendingChanges();
    }
  }

  // Cleanup
  destroy() {
    if (this.realtimeSubscription) {
      scheduleService.unsubscribe(this.realtimeSubscription);
    }
  }
}

// Create singleton instance
export const cloudDataStore = new CloudDataStore();
