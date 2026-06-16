-- Migration: Secure admin panel access and administrative RPCs
-- Created: 2026-06-16

-- 1. Add is_admin column to pf_profiles
ALTER TABLE public.pf_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Make all existing testing users admins by default
UPDATE public.pf_profiles SET is_admin = TRUE;

-- 3. Create helper function to check if the caller is an admin
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.pf_profiles 
        WHERE id = auth.uid() AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Access Denied: User is not an administrator';
    END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-declare user management admin RPCs with security checks
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    plan TEXT,
    storage_used BIGINT,
    storage_limit BIGINT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    PERFORM public.check_is_admin();
    RETURN QUERY
    SELECT 
        p.id, 
        p.full_name, 
        u.email::TEXT, 
        p.plan, 
        p.storage_used, 
        p.storage_limit, 
        p.created_at
    FROM public.pf_profiles p
    JOIN auth.users u ON p.id = u.id
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_get_metrics()
RETURNS JSON AS $$
DECLARE
    total_users BIGINT;
    pro_users BIGINT;
    total_projects BIGINT;
    total_photos BIGINT;
    total_storage BIGINT;
    result JSON;
BEGIN
    PERFORM public.check_is_admin();
    SELECT COUNT(*), COUNT(*) FILTER (WHERE plan = 'pro'), COALESCE(SUM(storage_used), 0)
    INTO total_users, pro_users, total_storage
    FROM public.pf_profiles;

    SELECT COUNT(*) INTO total_projects FROM public.pf_projects;
    SELECT COUNT(*) INTO total_photos FROM public.pf_photos;

    result := json_build_object(
        'totalUsers', total_users,
        'proUsers', pro_users,
        'totalProjects', total_projects,
        'totalPhotos', total_photos,
        'totalStorageBytes', total_storage
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_update_user(
    user_id UUID,
    new_plan TEXT,
    new_storage_limit BIGINT
) RETURNS VOID AS $$
BEGIN
    PERFORM public.check_is_admin();
    UPDATE public.pf_profiles
    SET plan = new_plan,
        storage_limit = new_storage_limit,
        updated_at = now()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Re-declare promo code admin RPCs with security checks
CREATE OR REPLACE FUNCTION public.admin_get_promo_codes()
RETURNS TABLE (
    id UUID,
    code TEXT,
    discount_type TEXT,
    discount_value INTEGER,
    max_uses INTEGER,
    uses_count INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    PERFORM public.check_is_admin();
    RETURN QUERY
    SELECT 
        p.id,
        p.code,
        p.discount_type,
        p.discount_value,
        p.max_uses,
        p.uses_count,
        p.expires_at,
        p.is_active,
        p.created_at
    FROM public.pf_promo_codes p
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Define with correct check_is_admin() validation
CREATE OR REPLACE FUNCTION public.admin_create_promo_code(
    code_val TEXT,
    type_val TEXT,
    value_val INTEGER,
    max_uses_val INTEGER,
    expires_at_val TIMESTAMP WITH TIME ZONE
) RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    PERFORM public.check_is_admin();
    INSERT INTO public.pf_promo_codes (
        code,
        discount_type,
        discount_value,
        max_uses,
        expires_at,
        uses_count,
        is_active
    ) VALUES (
        UPPER(code_val),
        type_val,
        value_val,
        max_uses_val,
        expires_at_val,
        0,
        true
    ) RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_toggle_promo_code(
    code_uuid UUID,
    new_status BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM public.check_is_admin();
    UPDATE public.pf_promo_codes
    SET is_active = new_status
    WHERE id = code_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_delete_promo_code(
    code_uuid UUID
) RETURNS VOID AS $$
BEGIN
    PERFORM public.check_is_admin();
    DELETE FROM public.pf_promo_codes
    WHERE id = code_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
