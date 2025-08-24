CREATE OR REPLACE FUNCTION approve_registration(
    registration_id UUID,
    admin_email TEXT
) RETURNS JSONB AS $$
DECLARE
    registration RECORD;
    new_user_id UUID;
    prn TEXT;
    employee_id TEXT;
    temp_password TEXT;
    hashed_password TEXT;
    target_table TEXT;
    credentials JSONB;
BEGIN
    -- Select the registration to be approved
    SELECT * INTO registration FROM public.pending_registrations
    WHERE id = registration_id;

    -- Check if registration exists and is pending
    IF NOT FOUND OR registration.status <> 'pending_approval' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Registration not found or not pending approval.');
    END IF;

    -- Generate credentials
    temp_password := substr(md5(random()::text), 0, 9);
    hashed_password := crypt(temp_password, gen_salt('bf'));

    IF registration.user_type = 'student' THEN
        target_table := 'students_' || lower(replace(registration.department, ' ', '_')) || '_' || lower(replace(registration.year, ' ', '_'));
        prn := 'PRN' || to_char(NOW(), 'YY') || LPAD(floor(random() * 10000)::text, 4, '0');
        
        EXECUTE format(
            'INSERT INTO public.%I (email, name, prn, password, department, year, field, course, mobile, face_url, face_registered)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
             RETURNING id',
            target_table
        ) 
        USING registration.email, registration.name, prn, hashed_password, registration.department, registration.year, registration.field, registration.course, registration.phone, registration.face_url
        INTO new_user_id;

        credentials := jsonb_build_object('email', registration.email, 'password', temp_password, 'prn', prn);

    ELSIF registration.user_type = 'faculty' THEN
        target_table := 'faculty';
        employee_id := 'EMP' || to_char(NOW(), 'YY') || LPAD(floor(random() * 10000)::text, 4, '0');

        INSERT INTO public.faculty (email, name, employee_id, password, department, field, course, mobile, face_url, face_registered)
        VALUES (registration.email, registration.name, employee_id, hashed_password, registration.department, registration.field, registration.course, registration.phone, registration.face_url, true)
        RETURNING id INTO new_user_id;

        credentials := jsonb_build_object('email', registration.email, 'password', temp_password, 'employee_id', employee_id);
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Invalid user type.');
    END IF;

    -- Update the pending registration status
    UPDATE public.pending_registrations
    SET status = 'approved', reviewed_at = NOW(), reviewed_by = admin_email
    WHERE id = registration_id;

    RETURN jsonb_build_object('success', true, 'message', 'Registration approved successfully.', 'credentials', credentials);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
