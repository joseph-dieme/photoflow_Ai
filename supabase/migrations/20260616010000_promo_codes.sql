-- Migration: Add pf_promo_codes table and RPC functions for discount management
-- Created: 2026-06-16

-- 1. Create pf_promo_codes Table
CREATE TABLE IF NOT EXISTS public.pf_promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    discount_value INTEGER NOT NULL,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.pf_promo_codes ENABLE ROW LEVEL SECURITY;

-- 3. Create basic RLS policies
CREATE POLICY "Anyone can view valid promo codes by code" ON public.pf_promo_codes
    FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- 4. RPC: Public validation function
CREATE OR REPLACE FUNCTION public.check_promo_code(code_text TEXT)
RETURNS TABLE (
    valid BOOLEAN,
    discount_type TEXT,
    discount_value INTEGER,
    message TEXT
) AS $$
DECLARE
    promo RECORD;
BEGIN
    SELECT * INTO promo 
    FROM public.pf_promo_codes 
    WHERE UPPER(code) = UPPER(code_text);
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, 0, 'Code promo invalide.'::TEXT;
        RETURN;
    END IF;
    
    IF NOT promo.is_active THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, 0, 'Ce code promo est inactif.'::TEXT;
        RETURN;
    END IF;
    
    IF promo.expires_at IS NOT NULL AND promo.expires_at < now() THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, 0, 'Ce code promo a expiré.'::TEXT;
        RETURN;
    END IF;
    
    IF promo.max_uses IS NOT NULL AND promo.uses_count >= promo.max_uses THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, 0, 'La limite d''utilisation de ce code a été atteinte.'::TEXT;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT TRUE, promo.discount_type, promo.discount_value, 'Code promo appliqué !'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: Increment usage counter
CREATE OR REPLACE FUNCTION public.use_promo_code(code_text TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.pf_promo_codes
    SET uses_count = uses_count + 1
    WHERE UPPER(code) = UPPER(code_text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC: Admin list promo codes
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

-- 7. RPC: Admin create promo code
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

-- 8. RPC: Admin toggle promo code
CREATE OR REPLACE FUNCTION public.admin_toggle_promo_code(
    code_uuid UUID,
    new_status BOOLEAN
) RETURNS VOID AS $$
BEGIN
    UPDATE public.pf_promo_codes
    SET is_active = new_status
    WHERE id = code_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RPC: Admin delete promo code
CREATE OR REPLACE FUNCTION public.admin_delete_promo_code(
    code_uuid UUID
) RETURNS VOID AS $$
BEGIN
    DELETE FROM public.pf_promo_codes
    WHERE id = code_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
