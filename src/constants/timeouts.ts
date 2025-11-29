/**
 * Refresh thresholds in milliseconds.
 * Used to determine when to refresh data on screen focus or events.
 */
export const RefreshThresholds = {
  Activity: {
    /** Time threshold for refreshing on focus (30 seconds) */
    FOCUS: 30 * 1000,
    /** Time threshold for refreshing on events (5 seconds) */
    EVENT: 5 * 1000,
  },
  Residence: {
    /** Time threshold for refreshing on focus (60 seconds) */
    FOCUS: 60 * 1000,
    /** Time threshold for refreshing on events (5 seconds) */
    EVENT: 5 * 1000,
  },
  Profile: {
    /** Time threshold for refreshing on focus (60 seconds) */
    FOCUS: 60 * 1000,
    /** Time threshold for refreshing on events (5 seconds) */
    EVENT: 5 * 1000,
  },
} as const;

/**
 * Minimum loading time in milliseconds.
 * Used to prevent flashing loading states.
 */
export const MinLoadingTime = {
  DEFAULT: 500,
  SHORT: 300,
  LONG: 1000,
} as const;

/**
 * Debounce times in milliseconds.
 */
export const DebounceTimes = {
  SEARCH: 300,
  INPUT: 150,
  SCROLL: 100,
} as const;
