/*
  # Create auth trigger for new users

  1. Functions
    - `handle_new_user()` - Creates a professional record when a new user signs up
  2. Triggers
    - `on_auth_user_created` - Triggers the function when a new user is created
*/

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.professionals (id, email, first_name, last_name, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.email)
  );
  
  -- Create default professional settings
  INSERT INTO public.professional_settings (professional_id)
  VALUES (NEW.id);
  
  -- Create default working hours (Mon-Fri, 9am-5pm)
  INSERT INTO public.working_hours (professional_id, day_of_week, start_time, end_time)
  VALUES
    (NEW.id, 1, '09:00:00', '17:00:00'),
    (NEW.id, 2, '09:00:00', '17:00:00'),
    (NEW.id, 3, '09:00:00', '17:00:00'),
    (NEW.id, 4, '09:00:00', '17:00:00'),
    (NEW.id, 5, '09:00:00', '17:00:00');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
