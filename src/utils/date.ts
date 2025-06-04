// Add duration to a date
export function addDuration(date: Date, durationMinutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + durationMinutes);
  return result;
}

// Check if a time slot is available
export function isTimeSlotAvailable(
  startTime: Date,
  endTime: Date,
  appointments: any[]
): boolean {
  // Check if the time slot overlaps with any existing appointment
  for (const appointment of appointments) {
    const appointmentStart = new Date(appointment.start_time);
    const appointmentEnd = new Date(appointment.end_time);
    
    // Check for overlap
    if (
      (startTime >= appointmentStart && startTime < appointmentEnd) ||
      (endTime > appointmentStart && endTime <= appointmentEnd) ||
      (startTime <= appointmentStart && endTime >= appointmentEnd)
    ) {
      return false;
    }
  }
  
  return true;
}
