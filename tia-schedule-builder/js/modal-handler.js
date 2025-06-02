// TIA Schedule Builder - Modal Handler Module
// Manages the day detail modal functionality

export class ModalHandler {
  constructor() {
    this.modal = document.getElementById("dayDetailModal");
    this.modalTitle = document.getElementById("modalTitle");
    this.modalDate = document.getElementById("modalDate");
    this.modalStaffList = document.getElementById("modalStaffList");
    this.modalEventsList = document.getElementById("modalEventsList");
    this.modalClose = this.modal?.querySelector(".modal-close");

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.modal) return;

    // Close button
    if (this.modalClose) {
      this.modalClose.addEventListener("click", () => {
        this.closeModal();
      });
    }

    // Click outside to close
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Escape key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isModalOpen()) {
        this.closeModal();
      }
    });
  }

  showDayDetails(dayNumber, date, dayName, dayData) {
    if (!this.modal) return;

    // Update modal content
    this.updateModalTitle(dayNumber, dayName);
    this.updateModalDate(date);
    this.updateStaffList(dayData.staff || []);
    this.updateEventsList(
      dayData.events || [],
      dayData.notes,
      dayData.eventDetails || []
    );

    // Show modal with animation
    this.modal.style.display = "block";
    this.modal.classList.add("show");

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Focus management for accessibility
    this.modalClose?.focus();

    // Track analytics (if needed)
    this.trackModalView(dayNumber, dayData);
  }

  updateModalTitle(dayNumber, dayName) {
    if (this.modalTitle) {
      this.modalTitle.textContent = `${dayName}, June ${dayNumber}, 2025`;
    }
  }

  updateModalDate(date) {
    if (this.modalDate) {
      const dateObj = new Date(date);
      this.modalDate.textContent = dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  updateStaffList(staff) {
    if (!this.modalStaffList) return;

    if (staff.length === 0) {
      this.modalStaffList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-message">No staff scheduled</div>
                    <div class="empty-state-description">This day has no staff coverage</div>
                </div>
            `;
      return;
    }

    const staffHTML = staff
      .map(
        (member) => `
            <div class="staff-detail-item">
                <div class="staff-badge staff-${member.name.toLowerCase()}">
                    <span class="staff-name">${member.name}</span>
                </div>
                <div class="staff-detail-info">
                    <div class="staff-detail-time">${member.time}</div>
                    <div class="staff-detail-role">${
                      member.role || "General duties"
                    }</div>
                </div>
                <div class="staff-detail-hours">${member.hours}h</div>
            </div>
        `
      )
      .join("");

    this.modalStaffList.innerHTML = staffHTML;

    // Add statistics
    this.addStaffStatistics(staff);
  }

  addStaffStatistics(staff) {
    const totalHours = staff.reduce((sum, s) => sum + s.hours, 0);
    const uniqueRoles = [...new Set(staff.map((s) => s.role).filter(Boolean))];

    const statsHTML = `
            <div class="modal-stats">
                <div class="modal-stat">
                    <div class="modal-stat-value">${staff.length}</div>
                    <div class="modal-stat-label">Staff Members</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-value">${totalHours}</div>
                    <div class="modal-stat-label">Total Hours</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-value">${uniqueRoles.length}</div>
                    <div class="modal-stat-label">Different Roles</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-value">${(
                      totalHours / staff.length
                    ).toFixed(1)}</div>
                    <div class="modal-stat-label">Avg Hours/Person</div>
                </div>
            </div>
        `;

    this.modalStaffList.insertAdjacentHTML("beforeend", statsHTML);
  }

  updateEventsList(events, notes, eventDetails) {
    if (!this.modalEventsList) return;

    let eventsHTML = "";

    if (
      events.length === 0 &&
      !notes &&
      (!eventDetails || eventDetails.length === 0)
    ) {
      eventsHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-message">No events scheduled</div>
                    <div class="empty-state-description">No special events or notes for this day</div>
                </div>
            `;
    } else {
      // Add detailed events first
      if (eventDetails && eventDetails.length > 0) {
        eventsHTML += eventDetails
          .map((detail) => {
            if (!detail.event) return "";

            return `
            <div class="event-item detailed-event ${this.getEventClass(
              detail.event
            )}">
              <div class="event-header">
                <h4 class="event-title">${this.formatEventText(
                  detail.event
                )}</h4>
              </div>
              <div class="event-details">
                ${
                  detail.eventTime
                    ? `
                  <div class="event-detail">
                    <span class="event-detail-label">🕐 Time:</span>
                    <span class="event-detail-value">${detail.eventTime}</span>
                  </div>
                `
                    : ""
                }
                ${
                  detail.location
                    ? `
                  <div class="event-detail">
                    <span class="event-detail-label">📍 Location:</span>
                    <span class="event-detail-value">${detail.location}</span>
                  </div>
                `
                    : ""
                }
                ${
                  detail.eventbrite
                    ? `
                  <div class="event-detail">
                    <span class="event-detail-label">🎫 Registration:</span>
                    <a href="${detail.eventbrite}" target="_blank" class="eventbrite-link">
                      View on Eventbrite →
                    </a>
                  </div>
                `
                    : ""
                }
              </div>
            </div>
          `;
          })
          .filter(Boolean)
          .join("");
      }

      // Add simple events (those without detailed info)
      if (events.length > 0) {
        const simpleEvents = events.filter(
          (event) =>
            !eventDetails ||
            !eventDetails.some((detail) => detail.event === event)
        );

        eventsHTML += simpleEvents
          .map(
            (event) => `
                    <div class="event-item ${this.getEventClass(event)}">
                        ${this.formatEventText(event)}
                    </div>
                `
          )
          .join("");
      }

      // Add notes
      if (notes && notes !== "Regular operations") {
        eventsHTML += `
                    <div class="event-item note">
                        <strong>📝 Notes:</strong> ${notes}
                    </div>
                `;
      }
    }

    this.modalEventsList.innerHTML = eventsHTML;
  }

  getEventClass(event) {
    const eventLower = event.toLowerCase();

    if (
      eventLower.includes("important") ||
      eventLower.includes("critical") ||
      eventLower.includes("urgent")
    ) {
      return "important";
    }

    if (eventLower.includes("note") || eventLower.includes("reminder")) {
      return "note";
    }

    return "";
  }

  formatEventText(event) {
    // Add icons based on event type
    const eventLower = event.toLowerCase();

    if (eventLower.includes("meeting")) {
      return `🤝 ${event}`;
    } else if (eventLower.includes("training")) {
      return `📚 ${event}`;
    } else if (eventLower.includes("maintenance")) {
      return `🔧 ${event}`;
    } else if (eventLower.includes("volunteer")) {
      return `🙋‍♀️ ${event}`;
    } else if (eventLower.includes("lab")) {
      return `🧪 ${event}`;
    } else {
      return `📌 ${event}`;
    }
  }

  closeModal() {
    if (!this.modal) return;

    // Hide modal with animation
    this.modal.classList.remove("show");

    setTimeout(() => {
      this.modal.style.display = "none";

      // Restore body scroll
      document.body.style.overflow = "";

      // Return focus to the calendar day that was clicked
      const activeDay = document.querySelector(".calendar-day:focus");
      if (activeDay) {
        activeDay.focus();
      }
    }, 300);
  }

  isModalOpen() {
    return this.modal && this.modal.style.display === "block";
  }

  trackModalView(dayNumber, dayData) {
    // Analytics tracking (implement as needed)
    console.log(`Modal viewed for day ${dayNumber}:`, {
      staffCount: dayData.staff?.length || 0,
      totalHours: dayData.totalHours || 0,
      hasEvents: (dayData.events?.length || 0) > 0,
    });
  }

  // Method to show custom modal content
  showCustomModal(title, content, options = {}) {
    if (!this.modal) return;

    // Update title
    if (this.modalTitle) {
      this.modalTitle.textContent = title;
    }

    // Clear date
    if (this.modalDate) {
      this.modalDate.textContent = "";
    }

    // Set custom content
    if (this.modalStaffList) {
      this.modalStaffList.innerHTML = content;
    }

    // Clear events
    if (this.modalEventsList) {
      this.modalEventsList.innerHTML = "";
    }

    // Show modal
    this.modal.style.display = "block";
    this.modal.classList.add("show");
    document.body.style.overflow = "hidden";

    // Auto-close if specified
    if (options.autoClose) {
      setTimeout(() => {
        this.closeModal();
      }, options.autoClose);
    }
  }

  // Method to show loading state
  showLoading(message = "Loading...") {
    this.showCustomModal(
      "Loading",
      `
            <div class="empty-state">
                <div class="empty-state-icon">⏳</div>
                <div class="empty-state-message">${message}</div>
            </div>
        `
    );
  }

  // Method to show error state
  showError(title, message) {
    this.showCustomModal(
      title,
      `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <div class="empty-state-message">${message}</div>
            </div>
        `,
      { autoClose: 5000 }
    );
  }
}
