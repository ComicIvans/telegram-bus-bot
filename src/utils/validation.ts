/**
 * Validate that value is a numeric stop ID.
 * @param text – user input
 * @returns cleaned stop ID
 * @throws on invalid format
 */
export function validateStopId(text: string): string {
  const id = text.trim();
  if (!/^\d+$/.test(id)) {
    throw new Error('Invalid stop ID');
  }
  return id;
}

/**
 * Parse comma-separated days into array of uppercase abbreviations.
 * @param text – e.g. "L,M,X,J,V"
 * @returns ["L","M",...]
 * @throws on invalid entries
 */
export function parseDays(text: string): string[] {
  const days = text.split(',').map((d) => d.trim().toUpperCase());
  const allowed = new Set(['L', 'M', 'X', 'J', 'V', 'S', 'D']);
  if (days.length === 0 || days.some((d) => !allowed.has(d))) {
    throw new Error('Invalid days format');
  }
  return days;
}

interface TimeSlot {
  from: string;
  to: string;
}

/**
 * Parse comma-separated time slots.
 * Format per slot: "HH:MM-HH:MM"
 * @param text – e.g. "06:30-09:00,16:30-18:00"
 * @returns array of {from,to}
 * @throws on invalid format
 */
export function parseTimeSlots(text: string): TimeSlot[] {
  return text.split(',').map((slot) => {
    const [from, to] = slot.trim().split('-');
    if (!from || !to || !/^\d\d:\d\d$/.test(from) || !/^\d\d:\d\d$/.test(to)) {
      throw new Error('Invalid time slot');
    }
    return { from, to };
  });
}

export type { TimeSlot };
