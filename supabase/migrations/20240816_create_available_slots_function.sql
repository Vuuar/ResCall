/*
  # Create function to get available time slots

  1. Functions
    - `get_available_slots(professional_id uuid, date_start date, date_end date, service_id uuid)` 
      - Returns available time slots for a professional based on working hours, appointments, and time off
*/

CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_professional_id uuid,
  p_date_start date,
  p_date_end date,
  p_service_id uuid
)
RETURNS TABLE (
  slot_start timestamptz,
  slot_end timestamptz
) AS $$
DECLARE
  v_service_duration integer;
  v_buffer integer;
  v_timezone text;
BEGIN
  -- Get service duration
  SELECT duration INTO v_service_duration
  FROM services
  WHERE id = p_service_id AND professional_id = p_professional_id;
  
  -- Get appointment buffer and timezone
  SELECT appointment_buffer, timezone INTO v_buffer, v_timezone
  FROM professional_settings
  WHERE professional_id = p_professional_id;
  
  -- Return available slots
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(p_date_start, p_date_end, '1 day'::interval) AS day
  ),
  working_hours_slots AS (
    SELECT
      (day + (start_time::text)::time)::timestamptz AT TIME ZONE v_timezone AS slot_start,
      (day + (end_time::text)::time)::timestamptz AT TIME ZONE v_timezone AS slot_end,
      day_of_week
    FROM date_range
    JOIN working_hours ON professional_id = p_professional_id AND is_active = true
    WHERE EXTRACT(DOW FROM day) = day_of_week
  ),
  slot_intervals AS (
    SELECT
      slot_start + (n * interval '15 minutes') AS interval_start,
      slot_start + (n * interval '15 minutes') + ((v_service_duration + v_buffer) * interval '1 minute') AS interval_end
    FROM working_hours_slots
    CROSS JOIN generate_series(0, 96) AS n -- 15-minute intervals in a day (24*4)
    WHERE slot_start + (n * interval '15 minutes') + ((v_service_duration + v_buffer) * interval '1 minute') <= slot_end
  ),
  busy_times AS (
    -- Existing appointments
    SELECT start_time - (v_buffer * interval '1 minute') AS busy_start,
           end_time + (v_buffer * interval '1 minute') AS busy_end
    FROM appointments
    WHERE professional_id = p_professional_id
    AND status NOT IN ('cancelled')
    AND start_time >= p_date_start::timestamptz
    AND end_time <= (p_date_end + interval '1 day')::timestamptz
    
    UNION ALL
    
    -- Time off periods
    SELECT start_time, end_time
    FROM time_off
    WHERE professional_id = p_professional_id
    AND start_time <= (p_date_end + interval '1 day')::timestamptz
    AND end_time >= p_date_start::timestamptz
  )
  SELECT
    interval_start,
    interval_start + (v_service_duration * interval '1 minute')
  FROM slot_intervals s
  WHERE NOT EXISTS (
    SELECT 1
    FROM busy_times b
    WHERE (s.interval_start, s.interval_end) OVERLAPS (b.busy_start, b.busy_end)
  )
  AND interval_start >= NOW()
  ORDER BY interval_start;
END;
$$ LANGUAGE plpgsql;
