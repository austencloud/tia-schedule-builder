// TIA Schedule Builder - Calendar Handler Module
// Manages the enhanced visual calendar with glass morphism badges

export class CalendarHandler {
  constructor(modalHandler) {
    this.modalHandler = modalHandler;
    this.container = document.getElementById("calendar-container");
    this.calendarData = this.generateCalendarData();
  }

  async render() {
    if (!this.container) {
      console.error("Calendar container not found");
      return;
    }

    this.container.innerHTML = this.generateCalendarHTML();
    this.setupEventListeners();
  }

  generateCalendarData() {
    // Complete June 2025 calendar data based on the original TIA schedule
    return [
      {
        day: 1,
        date: "2025-06-01",
        dayName: "Sunday",
        staff: [
          { name: "Grace", time: "11am-7pm", role: "Animal Care", hours: 8 },
          { name: "Gemma", time: "11am-7pm", role: "Front Desk", hours: 8 },
        ],
        totalHours: 16,
        events: ["Regular operations", "Volunteer orientation at 2pm"],
        notes: "Busy Sunday with good coverage",
      },
      {
        day: 4,
        date: "2025-06-04",
        dayName: "Wednesday",
        staff: [
          { name: "Gemma", time: "1pm-5pm", role: "Front Desk", hours: 4 },
          { name: "Grace", time: "3pm-8pm", role: "Animal Care", hours: 5 },
          { name: "Athena", time: "9:30am-5:30pm", role: "Lab", hours: 8 },
        ],
        totalHours: 17,
        events: ["Lab maintenance scheduled", "New volunteer training"],
        notes: "Mid-week operations with lab focus",
      },
      {
        day: 5,
        date: "2025-06-05",
        dayName: "Thursday",
        staff: [
          { name: "Taylor", time: "11am-7pm", role: "Animal Care", hours: 8 },
          { name: "Grace", time: "3pm-8pm", role: "Animal Care", hours: 5 },
          { name: "Bayla", time: "11am-7pm", role: "Lab", hours: 8 },
        ],
        totalHours: 21,
        events: ["Regular operations"],
        notes: "Good coverage with lab support",
      },
      {
        day: 6,
        date: "2025-06-06",
        dayName: "Friday",
        staff: [
          { name: "Miranda", time: "11am-7pm", role: "Front Desk", hours: 8 },
          { name: "Taylor", time: "11am-7pm", role: "Animal Care", hours: 8 },
          { name: "Domingo", time: "3pm-8pm", role: "Animal Care", hours: 5 },
        ],
        totalHours: 21,
        events: ["End of week operations"],
        notes: "Strong Friday coverage",
      },
      {
        day: 7,
        date: "2025-06-07",
        dayName: "Saturday",
        staff: [
          { name: "Rob", time: "9:30am-5:30pm", role: "Lab", hours: 8 },
          { name: "Gemma", time: "11am-7pm", role: "Front Desk", hours: 8 },
          { name: "Morph", time: "5pm-8pm", role: "Animal Care", hours: 3 },
          { name: "Athena", time: "11am-7pm", role: "Lab", hours: 8 },
        ],
        totalHours: 27,
        events: ["Weekend operations", "Lab research projects"],
        notes: "Busy Saturday with strong lab presence",
      },
      {
        day: 8,
        date: "2025-06-08",
        dayName: "Sunday",
        staff: [
          { name: "Courtney", time: "12pm-8pm", role: "Volunteer", hours: 8 },
          { name: "Grace", time: "4pm-8pm", role: "Animal Care", hours: 4 },
          { name: "Gemma", time: "11am-7pm", role: "Front Desk", hours: 8 },
          {
            name: "Domingo",
            time: "10:30am-6:30pm",
            role: "Animal Care",
            hours: 8,
          },
        ],
        totalHours: 28,
        events: ["Sunday operations", "Volunteer activities"],
        notes: "Excellent Sunday coverage with volunteer support",
      },
      {
        day: 11,
        date: "2025-06-11",
        dayName: "Wednesday",
        staff: [
          { name: "Athena", time: "9:30am-5:30pm", role: "Lab", hours: 8 },
          { name: "Grace", time: "3pm-8pm", role: "Animal Care", hours: 5 },
          { name: "Domingo", time: "3pm-5pm", role: "Animal Care", hours: 2 },
        ],
        totalHours: 15,
        events: ["Mid-week lab focus"],
        notes: "Moderate coverage with lab emphasis",
      },
      {
        day: 12,
        date: "2025-06-12",
        dayName: "Thursday",
        staff: [
          { name: "Rob", time: "11am-7pm", role: "Lab", hours: 8 },
          { name: "Athena", time: "11am-7pm", role: "Lab", hours: 8 },
          { name: "Cam", time: "12pm-8pm", role: "Lab", hours: 8 },
          { name: "Bayla", time: "4pm-8pm", role: "Lab", hours: 4 },
          { name: "Morph", time: "11am-7pm", role: "Animal Care", hours: 8 },
          {
            name: "Miranda",
            time: "4:30pm-8pm",
            role: "Front Desk",
            hours: 3.5,
          },
          { name: "Grace", time: "3pm-8pm", role: "Animal Care", hours: 5 },
        ],
        totalHours: 44.5,
        events: [
          "Heavy lab day",
          "Multiple research projects",
          "Staff meeting at 6pm",
        ],
        notes: "Busiest day of the month with 44.5 total hours",
      },
      {
        day: 13,
        date: "2025-06-13",
        dayName: "Friday",
        staff: [
          { name: "Rob", time: "11am-7pm", role: "Lab", hours: 8 },
          { name: "Miranda", time: "11am-7pm", role: "Front Desk", hours: 8 },
          { name: "Emilie", time: "5pm-8pm", role: "Lab", hours: 3 },
          { name: "Grace", time: "3pm-8pm", role: "Animal Care", hours: 5 },
          { name: "Domingo", time: "3pm-8pm", role: "Animal Care", hours: 5 },
        ],
        totalHours: 29,
        events: ["End of week operations", "Lab maintenance"],
        notes: "Strong Friday with lab focus",
      },
      {
        day: 14,
        date: "2025-06-14",
        dayName: "Saturday",
        staff: [
          { name: "Athena", time: "9:30am-5:30pm", role: "Lab", hours: 8 },
          { name: "Cam", time: "5:30pm-8pm", role: "Lab", hours: 2.5 },
          { name: "Rob", time: "4pm-8pm", role: "Lab", hours: 4 },
          { name: "Bayla", time: "11am-7pm", role: "Lab", hours: 8 },
        ],
        totalHours: 22.5,
        events: ["Weekend lab operations"],
        notes: "Saturday lab focus",
      },
      {
        day: 15,
        date: "2025-06-15",
        dayName: "Sunday",
        staff: [
          { name: "Courtney", time: "12pm-8pm", role: "Volunteer", hours: 8 },
          { name: "Morph", time: "4pm-8pm", role: "Animal Care", hours: 4 },
          { name: "Rob", time: "11am-7pm", role: "Lab", hours: 8 },
          { name: "Emilie", time: "6pm-8pm", role: "Lab", hours: 2 },
        ],
        totalHours: 22,
        events: ["Sunday operations", "Volunteer activities"],
        notes: "Good Sunday coverage",
      },
      {
        day: 18,
        date: "2025-06-18",
        dayName: "Wednesday",
        staff: [
          { name: "Rob", time: "11am-7pm", role: "Lab", hours: 8 },
          { name: "Athena", time: "9:30am-5:30pm", role: "Lab", hours: 8 },
          { name: "Domingo", time: "3pm-8pm", role: "Animal Care", hours: 5 },
        ],
        totalHours: 21,
        events: ["Mid-week operations"],
        notes: "Solid Wednesday coverage",
      },
      {
        day: 19,
        date: "2025-06-19",
        dayName: "Thursday",
        staff: [
          { name: "Grace", time: "11am-7pm", role: "Animal Care", hours: 8 },
          { name: "Taylor", time: "11am-7pm", role: "Animal Care", hours: 8 },
          { name: "Domingo", time: "3pm-8pm", role: "Animal Care", hours: 5 },
          { name: "Cam", time: "4pm-8pm", role: "Lab", hours: 4 },
        ],
        totalHours: 25,
        events: ["Regular operations"],
        notes: "Strong animal care focus",
      },
      {
        day: 20,
        date: "2025-06-20",
        dayName: "Friday",
        staff: [
          { name: "Taylor", time: "11am-7pm", role: "Animal Care", hours: 8 },
          { name: "Grace", time: "11am-7pm", role: "Animal Care", hours: 8 },
          { name: "Miranda", time: "5pm-8pm", role: "Front Desk", hours: 3 },
          { name: "Domingo", time: "3pm-8pm", role: "Animal Care", hours: 5 },
          { name: "Gemma", time: "1pm-7pm", role: "Front Desk", hours: 6 },
          { name: "Bayla", time: "3:30pm-8pm", role: "Lab", hours: 4.5 },
        ],
        totalHours: 34.5,
        events: ["Busy Friday operations"],
        notes: "Excellent coverage across all areas",
      },
      {
        day: 21,
        date: "2025-06-21",
        dayName: "Saturday",
        staff: [
          { name: "Morph", time: "11am-7pm", role: "Animal Care", hours: 8 },
          { name: "Athena", time: "9:30am-5:30pm", role: "Lab", hours: 8 },
          { name: "Grace", time: "3pm-8pm", role: "Animal Care", hours: 5 },
          { name: "Rob", time: "2pm-8pm", role: "Lab", hours: 6 },
        ],
        totalHours: 27,
        events: ["Weekend operations"],
        notes: "Good Saturday coverage",
      },
      {
        day: 22,
        date: "2025-06-22",
        dayName: "Sunday",
        staff: [
          { name: "Grace", time: "11am-7pm", role: "Animal Care", hours: 8 },
          { name: "Rob", time: "3pm-8pm", role: "Lab", hours: 5 },
          { name: "Taylor", time: "2pm-8pm", role: "Animal Care", hours: 6 },
          { name: "Donnie", time: "2pm-8pm", role: "Live-in", hours: 6 },
        ],
        totalHours: 25,
        events: ["Sunday operations"],
        notes: "Solid Sunday coverage",
      },
      {
        day: 25,
        date: "2025-06-25",
        dayName: "Wednesday",
        staff: [
          { name: "Domingo", time: "3pm-8pm", role: "Animal Care", hours: 5 },
          { name: "Grace", time: "3pm-8pm", role: "Animal Care", hours: 5 },
          { name: "Athena", time: "9:30am-5:30pm", role: "Lab", hours: 8 },
        ],
        totalHours: 18,
        events: ["Mid-week operations"],
        notes: "Moderate Wednesday coverage",
      },
      {
        day: 26,
        date: "2025-06-26",
        dayName: "Thursday",
        staff: [
          { name: "Taylor", time: "11am-7pm", role: "Animal Care", hours: 8 },
          { name: "Grace", time: "4pm-8pm", role: "Animal Care", hours: 4 },
          { name: "Bayla", time: "6pm-8pm", role: "Lab", hours: 2 },
        ],
        totalHours: 14,
        events: ["Light operations"],
        notes: "Minimal Thursday coverage",
      },
      {
        day: 27,
        date: "2025-06-27",
        dayName: "Friday",
        staff: [
          { name: "Miranda", time: "11am-7pm", role: "Front Desk", hours: 8 },
          { name: "Emilie", time: "12pm-8pm", role: "Lab", hours: 8 },
          { name: "Morph", time: "4pm-8pm", role: "Animal Care", hours: 4 },
          { name: "Bayla", time: "4:30pm-8pm", role: "Lab", hours: 3.5 },
        ],
        totalHours: 23.5,
        events: ["End of week operations"],
        notes: "Good Friday coverage",
      },
      {
        day: 28,
        date: "2025-06-28",
        dayName: "Saturday",
        staff: [
          {
            name: "Domingo",
            time: "10:30am-6:30pm",
            role: "Animal Care",
            hours: 8,
          },
          { name: "Miranda", time: "4pm-8pm", role: "Front Desk", hours: 4 },
          { name: "Rob", time: "3pm-8pm", role: "Lab", hours: 5 },
          { name: "Emilie", time: "5pm-8pm", role: "Lab", hours: 3 },
          { name: "Cam", time: "12pm-8pm", role: "Lab", hours: 8 },
        ],
        totalHours: 28,
        events: ["Weekend operations", "Lab projects"],
        notes: "Strong Saturday with lab focus",
      },
      {
        day: 29,
        date: "2025-06-29",
        dayName: "Sunday",
        staff: [
          {
            name: "Domingo",
            time: "10:30am-6:30pm",
            role: "Animal Care",
            hours: 8,
          },
          { name: "Miranda", time: "11am-7pm", role: "Front Desk", hours: 8 },
          { name: "Gemma", time: "11am-7pm", role: "Front Desk", hours: 8 },
          { name: "Rob", time: "4pm-8pm", role: "Lab", hours: 4 },
        ],
        totalHours: 28,
        events: ["End of month operations"],
        notes: "Excellent final Sunday",
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
