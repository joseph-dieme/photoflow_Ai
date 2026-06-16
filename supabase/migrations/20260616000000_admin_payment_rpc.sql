-- Migration: Add RPC helper functions for Wave payments and Admin space
-- Created: 2026-06-16

-- 1. Get client invoice details (public access via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_invoice_details(invoice_uuid UUID)
RETURNS TABLE (
    invoice_number TEXT,
    amount_fcfa INTEGER,
    type TEXT,
    status TEXT,
    client_name TEXT,
    project_name TEXT,
    photographer_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.invoice_number,
        i.amount_fcfa,
        i.type,
        i.status,
        COALESCE(c.name, 'Client'),
        COALESCE(p.name, 'Prestation Photo'),
        COALESCE(prof.full_name, 'Studio Photo')
    FROM public.pf_invoices i
    LEFT JOIN public.pf_clients c ON i.client_id = c.id
    LEFT JOIN public.pf_projects p ON i.project_id = p.id
    LEFT JOIN public.pf_profiles prof ON i.user_id = prof.id
    WHERE i.id = invoice_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Mark invoice as paid (public access via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.pay_invoice(invoice_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.pf_invoices
    SET status = 'paid'
    WHERE id = invoice_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Get all user profiles with emails from auth.users (SECURITY DEFINER)
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

-- 4. Get global platform statistics (SECURITY DEFINER)
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

-- 5. Update a user's plan and storage limit (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.admin_update_user(
    user_id UUID,
    new_plan TEXT,
    new_storage_limit BIGINT
) RETURNS VOID AS $$
BEGIN
    UPDATE public.pf_profiles
    SET plan = new_plan,
        storage_limit = new_storage_limit,
        updated_at = now()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
