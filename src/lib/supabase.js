import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// For development, you'll need to replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database service for schedule management
export class ScheduleService {
  constructor() {
    this.tableName = 'schedules';
    this.daysTableName = 'schedule_days';
  }

  // Get current schedule (June 2025 for now)
  async getCurrentSchedule() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          schedule_days (*)
        `)
        .eq('month', 'June')
        .eq('year', 2025)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return null;
    }
  }

  // Create or update schedule
  async saveSchedule(scheduleData) {
    try {
      // First, upsert the main schedule record
      const { data: schedule, error: scheduleError } = await supabase
        .from(this.tableName)
        .upsert({
          month: 'June',
          year: 2025,
          data: scheduleData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'month,year'
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Then save individual days for better querying
      if (scheduleData.days && scheduleData.days.length > 0) {
        const dayRecords = scheduleData.days.map(day => ({
          schedule_id: schedule.id,
          day_number: day.day,
          day_name: day.dayName,
          total_hours: parseFloat(day.totalHours) || 0,
          staff: day.staff || [],
          events: day.events || []
        }));

        // Delete existing days for this schedule
        await supabase
          .from(this.daysTableName)
          .delete()
          .eq('schedule_id', schedule.id);

        // Insert new days
        const { error: daysError } = await supabase
          .from(this.daysTableName)
          .insert(dayRecords);

        if (daysError) throw daysError;
      }

      return schedule;
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  }

  // Update a specific day
  async updateDay(dayNumber, dayData) {
    try {
      // Get current schedule
      const schedule = await this.getCurrentSchedule();
      if (!schedule) {
        throw new Error('No schedule found to update');
      }

      // Update the day in the schedule_days table
      const { data, error } = await supabase
        .from(this.daysTableName)
        .upsert({
          schedule_id: schedule.id,
          day_number: dayNumber,
          day_name: dayData.dayName,
          total_hours: parseFloat(dayData.totalHours) || 0,
          staff: dayData.staff || [],
          events: dayData.events || [],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'schedule_id,day_number'
        })
        .select()
        .single();

      if (error) throw error;

      // Also update the main schedule data
      const updatedScheduleData = { ...schedule.data };
      const dayIndex = updatedScheduleData.days.findIndex(d => d.day === dayNumber);
      if (dayIndex !== -1) {
        updatedScheduleData.days[dayIndex] = { ...dayData };
        
        await supabase
          .from(this.tableName)
          .update({
            data: updatedScheduleData,
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.id);
      }

      return data;
    } catch (error) {
      console.error('Error updating day:', error);
      throw error;
    }
  }

  // Subscribe to real-time changes
  subscribeToChanges(callback) {
    const subscription = supabase
      .channel('schedule_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: this.tableName 
        }, 
        (payload) => {
          console.log('Schedule changed:', payload);
          callback(payload);
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: this.daysTableName 
        }, 
        (payload) => {
          console.log('Day changed:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  }

  // Unsubscribe from changes
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
}

// Authentication helpers
export class AuthService {
  // Sign in with magic link (email-based, no password)
  async signInWithEmail(email) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Listen for auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// Report generation service
export class ReportService {
  constructor() {
    this.reportsTable = 'reports';
  }

  // Generate and save report
  async generateReport(scheduleData, reportType = 'monthly') {
    try {
      // Generate HTML report
      const htmlContent = this.generateHTMLReport(scheduleData, reportType);
      
      // Convert to PDF (you'll need to implement this)
      // For now, we'll save the HTML content
      const fileName = `schedule-report-${Date.now()}.html`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(fileName, new Blob([htmlContent], { type: 'text/html' }));

      if (uploadError) throw uploadError;

      // Create report record
      const shareToken = this.generateShareToken();
      const { data: reportData, error: reportError } = await supabase
        .from(this.reportsTable)
        .insert({
          schedule_id: scheduleData.id,
          report_type: reportType,
          file_url: uploadData.path,
          share_token: shareToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        })
        .select()
        .single();

      if (reportError) throw reportError;

      return {
        ...reportData,
        shareUrl: `${window.location.origin}/report/${shareToken}`
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  // Generate HTML report content
  generateHTMLReport(scheduleData, reportType) {
    // This will be implemented with a proper template
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>TIA Museum Schedule - ${scheduleData.month} ${scheduleData.year}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .day { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
            .staff { margin: 10px 0; }
            .events { margin: 10px 0; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TIA Museum Staff Schedule</h1>
            <h2>${scheduleData.month} ${scheduleData.year}</h2>
          </div>
          <!-- Schedule content will be generated here -->
        </body>
      </html>
    `;
  }

  // Generate unique share token
  generateShareToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

// Export service instances
export const scheduleService = new ScheduleService();
export const authService = new AuthService();
export const reportService = new ReportService();
