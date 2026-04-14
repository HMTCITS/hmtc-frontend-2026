/* --------------------------- Announcement Configuration --------------------------- */
export const ANNOUNCEMENT_CONFIG = {
  isActive: true, // Set to false to hide announcement
  message: 'SW ke-133',
  actionText: 'Berikan Doa dan Harapanmu!',
  actionUrl: '/magical-message',
  backgroundColor: 'bg-[#2F6FED]',
  textColor: 'text-white',
  dismissible: false, // Allow users to dismiss the announcement
  start: '2026-04-12T13:36:08+0000',
  end: '2026-05-12T13:36:08+0000',
  timezone: 'Asia/Jakarta',
} as const;

export type AnnouncementConfig = typeof ANNOUNCEMENT_CONFIG;

/**
 * Check if the announcement should be visible based on current time
 * @returns boolean - true if current time is within start and end dates
 */
export function isAnnouncementTimeValid(): boolean {
  const currentTime = new Date();
  const endTime = new Date(ANNOUNCEMENT_CONFIG.end);

  return currentTime <= endTime;
}

/**
 * Get human-readable date from Date object, ISO string, or unix timestamp
 * @param date - Date object, ISO string, or unix timestamp in seconds
 * @returns string - Formatted date string
 */
export function formatTimestamp(date: Date | string | number): string {
  if (typeof date === 'number') {
    // Assume unix timestamp in seconds
    return new Date(date * 1000).toLocaleString();
  }
  return new Date(date).toLocaleString();
}

/**
 * Get remaining time until announcement expires
 * @returns object with days, hours, minutes remaining
 */
export function getTimeRemaining(): {
  days: number;
  hours: number;
  minutes: number;
  expired: boolean;
} {
  const currentTime = new Date();
  const endTime = new Date(ANNOUNCEMENT_CONFIG.end);
  const timeLeftMs = endTime.getTime() - currentTime.getTime();

  if (timeLeftMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }

  const timeLeftSeconds = Math.floor(timeLeftMs / 1000);
  const days = Math.floor(timeLeftSeconds / (24 * 60 * 60));
  const hours = Math.floor((timeLeftSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeLeftSeconds % (60 * 60)) / 60);

  return { days, hours, minutes, expired: false };
}

/**
 * Get current unix timestamp in seconds
 * @returns number - Current unix timestamp
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Convert date to unix timestamp
 * @param date - Date object or date string
 * @returns number - Unix timestamp in seconds
 */
export function dateToTimestamp(date: Date | string): number {
  return Math.floor(new Date(date).getTime() / 1000);
}

/**
 * Helper function to check announcement status with detailed info
 * @returns object with detailed status information
 */
export function getAnnouncementStatus() {
  const currentTime = new Date();
  const startTime = new Date(ANNOUNCEMENT_CONFIG.start);
  const endTime = new Date(ANNOUNCEMENT_CONFIG.end);
  const isTimeValid = isAnnouncementTimeValid();
  const timeRemaining = getTimeRemaining();

  return {
    isActive: ANNOUNCEMENT_CONFIG.isActive,
    isTimeValid,
    currentTime: currentTime.toISOString(),
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    startDate: startTime.toLocaleString(),
    endDate: endTime.toLocaleString(),
    timeRemaining,
    shouldShow: ANNOUNCEMENT_CONFIG.isActive && isTimeValid,
  };
}
