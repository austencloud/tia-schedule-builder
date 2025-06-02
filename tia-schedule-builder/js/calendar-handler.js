// TIA Schedule Builder - Calendar Handler Module
// Manages the enhanced visual calendar with glass morphism badges

export class CalendarHandler {
  constructor(modalHandler) {
    this.modalHandler = modalHandler;
    this.container = document.getElementById("calendar-container");
    this.calendarData = [];
    this.initializeCalendarData();
  }

  async initializeCalendarData() {
    this.calendarData = await this.generateCalendarData();
  }

  async render() {
    if (!this.container) {
      console.error("Calendar container not found");
      return;
    }

    // Ensure calendar data is loaded
    if (this.calendarData.length === 0) {
      this.calendarData = await this.generateCalendarData();
    }

    this.container.innerHTML = this.generateCalendarHTML();
    this.setupEventListeners();
  }

  async generateCalendarData() {
    // Load and transform the real June 2025 schedule data
    try {
      const response = await fetch("./june_2025.json");
      const jsonData = await response.json();
      return this.transformJsonToCalendarData(jsonData);
    } catch (error) {
      console.error("Error loading schedule data:", error);
      return this.getFallbackData();
    }
  }

  transformJsonToCalendarData(jsonData) {
    const calendarData = [];

    // Group data by date to handle multiple events per day
    const groupedByDate = {};
    jsonData.forEach((entry) => {
      const date = entry.date;
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(entry);
    });

    // Transform each day's data
    Object.keys(groupedByDate).forEach((date) => {
      const dayEntries = groupedByDate[date];
      const primaryEntry = dayEntries[0]; // Use first entry as primary
      const dayNumber = parseInt(date.split("-")[2]);

      const transformedDay = {
        day: dayNumber,
        date: date,
        dayName: primaryEntry.day,
        staff: this.parseStaffData(primaryEntry),
        totalHours: 0, // Will be calculated
        events: this.parseEvents(dayEntries),
        notes: this.parseNotes(primaryEntry),
        availability: primaryEntry.availability || [],
        unavailable: primaryEntry.unavailable || [],
        eventDetails: this.parseEventDetails(dayEntries),
      };

      // Calculate total hours
      transformedDay.totalHours = this.calculateTotalHours(
        transformedDay.staff
      );

      calendarData.push(transformedDay);
    });

    return calendarData.sort((a, b) => a.day - b.day);
  }

  parseStaffData(entry) {
    const staff = [];

    if (entry.staffed && entry.staffed.length > 0) {
      entry.staffed.forEach((staffEntry) => {
        if (typeof staffEntry === "string" && staffEntry.trim()) {
          const parsed = this.parseStaffEntry(staffEntry);
          if (parsed) {
            // Handle both single staff member and array of staff members
            if (Array.isArray(parsed)) {
              staff.push(...parsed);
            } else {
              staff.push(parsed);
            }
          }
        }
      });
    }

    return staff;
  }

  parseStaffEntry(staffText) {
    const text = staffText.toLowerCase().trim();

    // Skip entries that are just notes or instructions
    if (
      text.includes("if you") ||
      text.includes("sorry for") ||
      text.includes("please") ||
      (text.includes("have") && text.includes("train")) ||
      text.includes("dont try")
    ) {
      return null;
    }

    // Handle multiple staff members separated by &
    if (text.includes(" & ")) {
      const staffMembers = text.split(" & ");
      const results = [];
      staffMembers.forEach((member) => {
        const parsed = this.parseStaffEntry(member.trim());
        if (parsed) {
          if (Array.isArray(parsed)) {
            results.push(...parsed);
          } else {
            results.push(parsed);
          }
        }
      });
      return results.length > 0 ? results : null;
    }

    // Handle "and" separator as well
    if (text.includes(" and ") && !text.includes("animal care")) {
      const staffMembers = text.split(" and ");
      const results = [];
      staffMembers.forEach((member) => {
        const parsed = this.parseStaffEntry(member.trim());
        if (parsed) {
          if (Array.isArray(parsed)) {
            results.push(...parsed);
          } else {
            results.push(parsed);
          }
        }
      });
      return results.length > 0 ? results : null;
    }

    // Extract role prefix (lab, tbd, etc.)
    let role = "General";
    let cleanText = text;

    if (text.startsWith("lab")) {
      role = "Lab";
      cleanText = text.replace(/^lab\s*:?\s*/, "");
    } else if (text.startsWith("tbd")) {
      role = "TBD";
      cleanText = text.replace(/^tbd\s*:?\s*/, "");
    } else if (text.includes("animal care")) {
      role = "Animal Care";
    } else if (text.includes("training")) {
      role = "Training";
    } else if (text.includes("desk") || text.includes("front")) {
      role = "Front Desk";
    } else if (text.includes("volunteer")) {
      role = "Volunteer";
    }

    // Handle time patterns like "11-5" or "9:30-3" or "10:30-6:30"
    const timeMatch = cleanText.match(
      /(\d{1,2}(?::\d{2})?)\s*[-–]\s*(\d{1,2}(?::\d{2})?)/
    );

    // Extract name - look for common names
    const nameMatch = cleanText.match(
      /\b(grace|gemma|morph|domingo|rob|emilie|miranda|taylor|athena|bayla|cam|courtney|donnie|doming)\b/
    );

    if (nameMatch) {
      const name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
      let time = "TBD";
      let hours = 0;

      if (timeMatch) {
        const startTime = timeMatch[1];
        const endTime = timeMatch[2];
        time = `${this.formatTime(startTime)}-${this.formatTime(endTime)}`;
        hours = this.calculateHours(startTime, endTime);
      }

      return { name, time, role, hours };
    }

    // Handle special cases like "am taylor and grace animal care"
    if (text.includes("am ") && text.includes("animal care")) {
      const names = text.match(
        /\b(grace|gemma|morph|domingo|rob|emilie|miranda|taylor|athena|bayla|cam|courtney|donnie)\b/g
      );
      if (names) {
        return names.map((name) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          time: "AM shift",
          role: "Animal Care",
          hours: 4,
        }));
      }
    }

    return null;
  }

  parseEvents(dayEntries) {
    const events = [];

    dayEntries.forEach((entry) => {
      if (entry.event && entry.event.trim()) {
        events.push(entry.event);
      }
    });

    return events.length > 0 ? events : ["No scheduled events"];
  }

  parseNotes(entry) {
    // Combine staffed entries as notes if they contain additional information
    if (entry.staffed && entry.staffed.length > 0) {
      const notes = entry.staffed
        .filter(
          (s) => s.includes("note") || s.includes("TBD") || s.includes("if")
        )
        .join(" ");
      return notes || "Regular operations";
    }
    return "Regular operations";
  }

  parseEventDetails(dayEntries) {
    return dayEntries
      .map((entry) => ({
        event: entry.event,
        eventTime: entry.event_time,
        location: entry.location,
        eventbrite: entry.eventbrite,
      }))
      .filter((detail) => detail.event);
  }

  formatTime(timeStr) {
    // Convert "11" to "11am", "13" to "1pm", etc.
    const time = parseInt(timeStr.split(":")[0]);
    const minutes = timeStr.includes(":") ? timeStr.split(":")[1] : "00";

    if (time === 12) {
      return timeStr.includes(":") ? `${timeStr}pm` : `12pm`;
    } else if (time < 12) {
      return timeStr.includes(":") ? `${timeStr}am` : `${time}am`;
    } else {
      const hour12 = time - 12;
      return timeStr.includes(":") ? `${hour12}:${minutes}pm` : `${hour12}pm`;
    }
  }

  calculateHours(startTime, endTime) {
    // Enhanced hour calculation with minutes support
    const [startHour, startMin = 0] = startTime.split(":").map(Number);
    const [endHour, endMin = 0] = endTime.split(":").map(Number);

    const startTotalMinutes = startHour * 60 + startMin;
    let endTotalMinutes = endHour * 60 + endMin;

    // Handle overnight shifts (end time is next day)
    if (endTotalMinutes <= startTotalMinutes) {
      endTotalMinutes += 24 * 60;
    }

    const totalMinutes = endTotalMinutes - startTotalMinutes;
    return Math.round((totalMinutes / 60) * 2) / 2; // Round to nearest 0.5 hour
  }

  calculateTotalHours(staff) {
    return staff.reduce((total, member) => total + (member.hours || 0), 0);
  }

  getFallbackData() {
    // Return minimal fallback data if JSON loading fails
    return [
      {
        day: 1,
        date: "2025-06-01",
        dayName: "Sunday",
        staff: [],
        totalHours: 0,
        events: ["Data loading failed"],
        notes: "Unable to load schedule data",
      },
    ];
  }

  generateCalendarHTML() {
    return `
            <div class="calendar-legend">
                <div class="legend-item">
                    <div class="legend-color has-coverage"></div>
                    <span>Good Coverage (8+ hours)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color minimal-coverage"></div>
                    <span>Minimal Coverage (1-7 hours)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color no-coverage"></div>
                    <span>No Coverage</span>
                </div>
            </div>
            
            <div class="calendar-grid">
                ${this.generateCalendarHeaders()}
                ${this.generateCalendarDays()}
            </div>
        `;
  }

  generateCalendarHeaders() {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days
      .map((day) => `<div class="calendar-header">${day}</div>`)
      .join("");
  }

  generateCalendarDays() {
    const daysInMonth = 30;
    const daysHTML = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = this.calendarData.find((d) => d.day === day);
      daysHTML.push(this.generateDayHTML(day, dayData));
    }

    return daysHTML.join("");
  }

  generateDayHTML(dayNumber, dayData) {
    const coverageClass = this.getCoverageClass(dayData?.totalHours || 0);
    const dayName = this.getDayName(dayNumber);

    return `
            <div class="calendar-day ${coverageClass}" 
                 data-day="${dayNumber}" 
                 data-date="2025-06-${dayNumber.toString().padStart(2, "0")}"
                 data-day-name="${dayName}">
                <div class="day-number">${dayNumber}</div>
                ${dayData ? this.generateStaffBadges(dayData.staff) : ""}
                ${
                  dayData && dayData.totalHours > 0
                    ? `<div class="day-total">${dayData.totalHours}h</div>`
                    : ""
                }
            </div>
        `;
  }

  generateStaffBadges(staff) {
    if (!staff || staff.length === 0) return "";

    return `
            <div class="staff-badges-container">
                ${staff
                  .map(
                    (member) => `
                    <div class="staff-badge staff-${member.name.toLowerCase()}">
                        <span class="staff-name">${member.name}</span>
                        <span class="staff-time">${member.time}</span>
                        ${
                          member.role
                            ? `<span class="staff-role">${member.role}</span>`
                            : ""
                        }
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  getCoverageClass(totalHours) {
    if (totalHours >= 8) return "has-coverage";
    if (totalHours >= 1) return "minimal-coverage";
    return "no-coverage";
  }

  getDayName(dayNumber) {
    // June 1, 2025 is a Sunday (day 0)
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return dayNames[(dayNumber - 1) % 7];
  }

  setupEventListeners() {
    const calendarDays = this.container.querySelectorAll(".calendar-day");

    calendarDays.forEach((day) => {
      day.addEventListener("click", () => {
        const dayNumber = parseInt(day.dataset.day);
        const date = day.dataset.date;
        const dayName = day.dataset.dayName;

        this.handleDayClick(dayNumber, date, dayName);
      });

      // Add hover effects for days with coverage
      if (!day.classList.contains("no-coverage")) {
        day.addEventListener("mouseenter", () => {
          this.showDayPreview(day);
        });

        day.addEventListener("mouseleave", () => {
          this.hideDayPreview();
        });
      }
    });
  }

  handleDayClick(dayNumber, date, dayName) {
    const dayData = this.calendarData.find((d) => d.day === dayNumber);

    if (dayData) {
      this.modalHandler.showDayDetails(dayNumber, date, dayName, dayData);
    } else {
      // Show empty day modal
      this.modalHandler.showDayDetails(dayNumber, date, dayName, {
        staff: [],
        totalHours: 0,
        events: ["No scheduled activities"],
        notes: "No staff coverage for this day",
      });
    }
  }

  showDayPreview(dayElement) {
    // Add a subtle preview effect
    const badges = dayElement.querySelectorAll(".staff-badge");
    badges.forEach((badge, index) => {
      setTimeout(() => {
        badge.style.transform = "scale(1.05)";
        badge.style.zIndex = "10";
      }, index * 50);
    });
  }

  hideDayPreview() {
    // Reset preview effects
    const badges = this.container.querySelectorAll(".staff-badge");
    badges.forEach((badge) => {
      badge.style.transform = "";
      badge.style.zIndex = "";
    });
  }

  handleResize() {
    // Handle responsive behavior
    const calendarGrid = this.container.querySelector(".calendar-grid");
    if (!calendarGrid) return;

    const containerWidth = this.container.offsetWidth;

    if (containerWidth < 768) {
      // Mobile layout adjustments
      calendarGrid.classList.add("mobile-layout");
    } else {
      calendarGrid.classList.remove("mobile-layout");
    }
  }

  // Method to update calendar data (for future use with real data)
  updateCalendarData(newData) {
    this.calendarData = newData;
    this.render();
  }

  // Method to highlight specific days (for future features)
  highlightDays(dayNumbers, className = "highlighted") {
    const calendarDays = this.container.querySelectorAll(".calendar-day");

    calendarDays.forEach((day) => {
      const dayNumber = parseInt(day.dataset.day);
      if (dayNumbers.includes(dayNumber)) {
        day.classList.add(className);
      } else {
        day.classList.remove(className);
      }
    });
  }

  // Method to filter calendar by staff member
  filterByStaff(staffName) {
    const calendarDays = this.container.querySelectorAll(".calendar-day");

    calendarDays.forEach((day) => {
      const dayNumber = parseInt(day.dataset.day);
      const dayData = this.calendarData.find((d) => d.day === dayNumber);

      if (staffName === "all") {
        day.style.opacity = "1";
        return;
      }

      if (
        dayData &&
        dayData.staff.some(
          (s) => s.name.toLowerCase() === staffName.toLowerCase()
        )
      ) {
        day.style.opacity = "1";

        // Highlight specific staff badges
        const badges = day.querySelectorAll(".staff-badge");
        badges.forEach((badge) => {
          if (badge.classList.contains(`staff-${staffName.toLowerCase()}`)) {
            badge.style.boxShadow = "0 0 10px rgba(52, 152, 219, 0.5)";
          } else {
            badge.style.opacity = "0.5";
          }
        });
      } else {
        day.style.opacity = "0.3";
      }
    });
  }

  // Reset any filters or highlights
  resetFilters() {
    const calendarDays = this.container.querySelectorAll(".calendar-day");
    const badges = this.container.querySelectorAll(".staff-badge");

    calendarDays.forEach((day) => {
      day.style.opacity = "";
      day.classList.remove("highlighted");
    });

    badges.forEach((badge) => {
      badge.style.opacity = "";
      badge.style.boxShadow = "";
    });
  }
}
