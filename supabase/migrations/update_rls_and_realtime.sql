-- 1. Update is_admin function to remove hardcoded email
-- This function is used by RLS policies to check if the current user is an admin.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Enable REPLICA IDENTITY FULL for tables used with Realtime
-- This ensures that UPDATE and DELETE events contain the full row data.
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.supplier_products REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- 3. Fix Supplier Products RLS Policies
-- Remove hardcoded email check and use the updated is_admin() function.
DROP POLICY IF EXISTS "Admin can manage supplier products" ON public.supplier_products;
CREATE POLICY "Admin can manage supplier products"
  ON public.supplier_products
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Anyone can view active supplier products" ON public.supplier_products;
CREATE POLICY "Anyone can view active supplier products"
  ON public.supplier_products
  FOR SELECT
  USING (status = 'active');

-- Ensure admins can view and update all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- 4. Enable Realtime for critical tables (if not already enabled)
-- Note: In Supabase, this is usually managed via the 'supabase_realtime' publication.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Add tables to the publication if they are not already there
        -- We use a safe way to add tables to avoid errors if they are already present
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
        EXCEPTION WHEN others THEN END;
        
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
        EXCEPTION WHEN others THEN END;
        
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.supplier_products;
        EXCEPTION WHEN others THEN END;
        
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
        EXCEPTION WHEN others THEN END;
    END IF;
END $$;
