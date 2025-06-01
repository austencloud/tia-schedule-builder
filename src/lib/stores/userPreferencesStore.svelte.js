// User Preferences Store - Persistent user settings and customization
const browser = typeof window !== "undefined";

// Default preferences
const defaultPreferences = {
  // Display preferences
  theme: "auto", // 'light', 'dark', 'auto'
  colorScheme: "default", // 'default', 'high-contrast', 'colorblind-friendly'
  fontSize: "medium", // 'small', 'medium', 'large', 'extra-large'
  reducedMotion: false,

  // Layout preferences
  compactView: false,
  showPatterns: true,
  showHours: true,
  showCoverageIndicators: true,
  sidebarCollapsed: false,
  gridDensity: "comfortable", // 'compact', 'comfortable', 'spacious'

  // Functional preferences
  defaultView: "weekly", // 'weekly', 'monthly', 'daily', 'staff'
  autoSave: true,
  confirmDestructiveActions: true,
  showTooltips: true,
  keyboardShortcuts: true,

  // Accessibility preferences
  screenReaderOptimized: false,
  highContrast: false,
  largeClickTargets: false,
  keyboardNavigation: true,
  announceChanges: true,

  // Performance preferences
  virtualScrolling: true,
  animationsEnabled: true,
  preloadData: true,
  cacheSize: "medium", // 'small', 'medium', 'large'

  // Notification preferences
  showNotifications: true,
  notificationPosition: "top-right", // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  soundEnabled: false,

  // Advanced preferences
  developerMode: false,
  debugMode: false,
  experimentalFeatures: false,

  // Custom settings
  customColors: {},
  customShortcuts: {},
  savedFilters: [],
  recentSearches: [],
  favoriteViews: [],

  // Privacy preferences
  analyticsEnabled: true,
  crashReporting: true,
  usageStatistics: true,

  // Last used settings
  lastViewMode: "weekly",
  lastFilters: {},
  lastPosition: null,

  // Version and migration
  version: "1.0.0",
  migrationLevel: 0,
};

// Storage key
const STORAGE_KEY = "tia-schedule-builder-preferences";

// Load preferences from localStorage
function loadPreferences() {
  if (!browser) return { ...defaultPreferences };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new preferences
      return { ...defaultPreferences, ...parsed };
    }
  } catch (error) {
    console.warn("Failed to load user preferences:", error);
  }

  return { ...defaultPreferences };
}

// Save preferences to localStorage
function savePreferences(preferences) {
  if (!browser) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn("Failed to save user preferences:", error);
  }
}

// Initialize preferences
let preferences = $state(loadPreferences());

// Watch for preference changes and auto-save
let isInitialized = false;
const watchPreferences = () => {
  if (!isInitialized) {
    isInitialized = true;
    return;
  }
  if (browser) {
    savePreferences(preferences);
  }
};

// Custom reactive setter that triggers save
const updatePreferencesReactive = (updates) => {
  Object.assign(preferences, updates);
  watchPreferences();
};

// Detect system preferences
function detectSystemPreferences() {
  if (!browser) return {};

  const detected = {};

  // Detect color scheme preference
  if (window.matchMedia) {
    detected.prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    detected.prefersHighContrast = window.matchMedia(
      "(prefers-contrast: high)"
    ).matches;
    detected.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }

  // Detect accessibility features
  detected.screenReaderDetected = !!(
    window.navigator.userAgent.match(/NVDA|JAWS|VoiceOver|TalkBack/i) ||
    window.speechSynthesis
  );

  return detected;
}

// Apply theme to document
function applyTheme(theme, colorScheme) {
  if (!browser) return;

  const root = document.documentElement;

  // Apply theme
  if (theme === "auto") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    root.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    root.setAttribute("data-theme", theme);
  }

  // Apply color scheme
  root.setAttribute("data-color-scheme", colorScheme);
}

// Apply accessibility settings
function applyAccessibilitySettings() {
  if (!browser) return;

  const root = document.documentElement;

  // Font size
  root.setAttribute("data-font-size", preferences.fontSize);

  // Reduced motion
  if (preferences.reducedMotion) {
    root.style.setProperty("--animation-duration", "0.01ms");
    root.style.setProperty("--transition-duration", "0.01ms");
  } else {
    root.style.removeProperty("--animation-duration");
    root.style.removeProperty("--transition-duration");
  }

  // High contrast
  if (preferences.highContrast) {
    root.classList.add("high-contrast");
  } else {
    root.classList.remove("high-contrast");
  }

  // Large click targets
  if (preferences.largeClickTargets) {
    root.classList.add("large-targets");
  } else {
    root.classList.remove("large-targets");
  }
}

// Watch for system preference changes
if (browser && window.matchMedia) {
  // Watch for color scheme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (preferences.theme === "auto") {
        applyTheme(preferences.theme, preferences.colorScheme);
      }
    });

  // Watch for reduced motion changes
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", (e) => {
      if (!preferences.reducedMotion) {
        preferences.reducedMotion = e.matches;
      }
    });

  // Watch for high contrast changes
  window
    .matchMedia("(prefers-contrast: high)")
    .addEventListener("change", (e) => {
      if (!preferences.highContrast) {
        preferences.highContrast = e.matches;
      }
    });
}

// Apply initial settings on module load
if (browser) {
  applyTheme(preferences.theme, preferences.colorScheme);
  applyAccessibilitySettings();
}

// Export the store
export const userPreferencesStore = {
  // Getters
  get preferences() {
    return preferences;
  },
  get theme() {
    return preferences.theme;
  },
  get colorScheme() {
    return preferences.colorScheme;
  },
  get fontSize() {
    return preferences.fontSize;
  },
  get compactView() {
    return preferences.compactView;
  },
  get showPatterns() {
    return preferences.showPatterns;
  },
  get showHours() {
    return preferences.showHours;
  },
  get defaultView() {
    return preferences.defaultView;
  },
  get autoSave() {
    return preferences.autoSave;
  },
  get confirmDestructiveActions() {
    return preferences.confirmDestructiveActions;
  },
  get showTooltips() {
    return preferences.showTooltips;
  },
  get keyboardShortcuts() {
    return preferences.keyboardShortcuts;
  },
  get screenReaderOptimized() {
    return preferences.screenReaderOptimized;
  },
  get highContrast() {
    return preferences.highContrast;
  },
  get reducedMotion() {
    return preferences.reducedMotion;
  },
  get virtualScrolling() {
    return preferences.virtualScrolling;
  },
  get animationsEnabled() {
    return preferences.animationsEnabled;
  },
  get showNotifications() {
    return preferences.showNotifications;
  },
  get customColors() {
    return preferences.customColors;
  },
  get savedFilters() {
    return preferences.savedFilters;
  },
  get recentSearches() {
    return preferences.recentSearches;
  },

  // Setters
  setTheme: (theme) => {
    preferences.theme = theme;
    applyTheme(theme, preferences.colorScheme);
    watchPreferences();
  },

  setColorScheme: (scheme) => {
    preferences.colorScheme = scheme;
    applyTheme(preferences.theme, scheme);
    watchPreferences();
  },

  setFontSize: (size) => {
    preferences.fontSize = size;
    applyAccessibilitySettings();
    watchPreferences();
  },

  setCompactView: (compact) => {
    preferences.compactView = compact;
    watchPreferences();
  },

  setShowPatterns: (show) => {
    preferences.showPatterns = show;
    watchPreferences();
  },

  setShowHours: (show) => {
    preferences.showHours = show;
    watchPreferences();
  },

  setDefaultView: (view) => {
    preferences.defaultView = view;
    watchPreferences();
  },

  setAutoSave: (enabled) => {
    preferences.autoSave = enabled;
    watchPreferences();
  },

  setConfirmDestructiveActions: (confirm) => {
    preferences.confirmDestructiveActions = confirm;
    watchPreferences();
  },

  setShowTooltips: (show) => {
    preferences.showTooltips = show;
    watchPreferences();
  },

  setKeyboardShortcuts: (enabled) => {
    preferences.keyboardShortcuts = enabled;
    watchPreferences();
  },

  setScreenReaderOptimized: (optimized) => {
    preferences.screenReaderOptimized = optimized;
    applyAccessibilitySettings();
    watchPreferences();
  },

  setHighContrast: (enabled) => {
    preferences.highContrast = enabled;
    applyAccessibilitySettings();
    watchPreferences();
  },

  setReducedMotion: (enabled) => {
    preferences.reducedMotion = enabled;
    applyAccessibilitySettings();
    watchPreferences();
  },

  setVirtualScrolling: (enabled) => {
    preferences.virtualScrolling = enabled;
    watchPreferences();
  },

  setAnimationsEnabled: (enabled) => {
    preferences.animationsEnabled = enabled;
    watchPreferences();
  },

  setShowNotifications: (show) => {
    preferences.showNotifications = show;
    watchPreferences();
  },

  // Bulk operations
  updatePreferences: (updates) => {
    Object.assign(preferences, updates);
    applyTheme(preferences.theme, preferences.colorScheme);
    applyAccessibilitySettings();
    watchPreferences();
  },

  resetToDefaults: () => {
    preferences = { ...defaultPreferences };
    applyTheme(preferences.theme, preferences.colorScheme);
    applyAccessibilitySettings();
    watchPreferences();
  },

  // Custom settings
  setCustomColor: (key, color) => {
    preferences.customColors[key] = color;
    preferences.customColors = { ...preferences.customColors };
    watchPreferences();
  },

  addSavedFilter: (filter) => {
    preferences.savedFilters = [...preferences.savedFilters, filter];
    watchPreferences();
  },

  removeSavedFilter: (index) => {
    preferences.savedFilters = preferences.savedFilters.filter(
      (_, i) => i !== index
    );
    watchPreferences();
  },

  addRecentSearch: (search) => {
    preferences.recentSearches = [
      search,
      ...preferences.recentSearches.filter((s) => s !== search).slice(0, 9),
    ];
    watchPreferences();
  },

  clearRecentSearches: () => {
    preferences.recentSearches = [];
    watchPreferences();
  },

  // System integration
  detectSystemPreferences,

  // Import/Export
  exportPreferences: () => {
    return JSON.stringify(preferences, null, 2);
  },

  importPreferences: (jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      preferences = { ...defaultPreferences, ...imported };
      applyTheme(preferences.theme, preferences.colorScheme);
      applyAccessibilitySettings();
      return true;
    } catch (error) {
      console.error("Failed to import preferences:", error);
      return false;
    }
  },
};
