import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const DatabaseInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const initializeDB = async () => {
      try {
        // Check if products table exists by trying to fetch from it
        const { error: checkError } = await supabase
          .from('products')
          .select('id')
          .limit(1);

        if (checkError?.code === 'PGRST205') {
          // Table doesn't exist, create it
          console.log('Creating database schema...');
          setStatus('Creating database tables...');

          // Create all required tables using SQL
          const { error: createError } = await supabase.rpc('exec', {
            sql: `
              CREATE TABLE IF NOT EXISTS profiles (
                id uuid PRIMARY KEY,
                email text UNIQUE,
                name text,
                phone text,
                role text DEFAULT 'buyer',
                avatar text,
                suspended boolean DEFAULT false,
                created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
              );

              CREATE TABLE IF NOT EXISTS products (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                name text NOT NULL,
                nameZH text,
                category text,
                price numeric NOT NULL,
                image text,
                images text[],
                rating numeric DEFAULT 0,
                reviews integer DEFAULT 0,
                description text,
                specifications text[],
                company text,
                location text,
                unit text,
                unitPrice numeric,
                currency text DEFAULT 'USD',
                moq integer,
                supplyAbilityPerMonth integer,
                quantityAvailable integer,
                leadTimeDays integer,
                incoterm text,
                portOfShipment text,
                brochureUrl text,
                hsCode text,
                brand text,
                model text,
                originCountry text,
                province text,
                city text,
                contactName text,
                contactEmail text,
                contactPhone text,
                wechat text,
                whatsapp text,
                oemAvailable boolean DEFAULT false,
                odmAvailable boolean DEFAULT false,
                customPackaging boolean DEFAULT false,
                sampleAvailable boolean DEFAULT false,
                certifications text[],
                warrantyMonths integer,
                inquiries integer DEFAULT 0,
                seller_id uuid REFERENCES profiles(id),
                created_at timestamp with time zone DEFAULT now()
              );

              CREATE TABLE IF NOT EXISTS clusters (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                name text NOT NULL,
                description text,
                creator_id uuid REFERENCES profiles(id),
                target_product_id uuid REFERENCES products(id),
                target_product_name text,
                target_price numeric DEFAULT 0,
                current_funded numeric DEFAULT 0,
                quantity integer DEFAULT 0,
                max_members integer DEFAULT 5,
                current_members integer DEFAULT 0,
                preferred_shipping_method text,
                shipping_status text DEFAULT 'shipping not started yet',
                shipping_started_at timestamp with time zone,
                stop_counting boolean DEFAULT false,
                status text DEFAULT 'active',
                deadline timestamp with time zone,
                created_at timestamp with time zone DEFAULT now()
              );

              CREATE TABLE IF NOT EXISTS cluster_members (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                cluster_id uuid REFERENCES clusters(id) ON DELETE CASCADE,
                user_id uuid REFERENCES profiles(id),
                joined_quantity integer DEFAULT 0,
                joined_amount numeric DEFAULT 0,
                joined_at timestamp with time zone DEFAULT now()
              );

              CREATE TABLE IF NOT EXISTS cluster_messages (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                cluster_id uuid REFERENCES clusters(id) ON DELETE CASCADE,
                user_id uuid REFERENCES profiles(id),
                content text,
                type text DEFAULT 'text',
                poll_data jsonb,
                created_at timestamp with time zone DEFAULT now()
              );

              CREATE TABLE IF NOT EXISTS support_messages (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                sender_id uuid REFERENCES profiles(id),
                recipient_id uuid REFERENCES profiles(id),
                text text,
                sender_role text,
                created_at timestamp with time zone DEFAULT now()
              );

              CREATE TABLE IF NOT EXISTS notifications (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                user_id uuid REFERENCES profiles(id),
                title text,
                message text,
                type text,
                read boolean DEFAULT false,
                created_at timestamp with time zone DEFAULT now()
              );

              CREATE TABLE IF NOT EXISTS wallets (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                user_id uuid UNIQUE REFERENCES profiles(id),
                balance numeric DEFAULT 0,
                currency text DEFAULT 'NGN',
                created_at timestamp with time zone DEFAULT now()
              );

              CREATE TABLE IF NOT EXISTS orders (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                buyer_id uuid REFERENCES profiles(id),
                seller_id uuid REFERENCES profiles(id),
                product_id uuid REFERENCES products(id),
                quantity integer NOT NULL,
                total_price numeric NOT NULL,
                status text DEFAULT 'pending',
                created_at timestamp with time zone DEFAULT now()
              );

              CREATE TABLE IF NOT EXISTS supplier_products (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                title text NOT NULL,
                description text,
                price_min numeric,
                price_max numeric,
                image_url text,
                supplier_name text,
                supplier_email text,
                category text,
                status text DEFAULT 'active',
                created_at timestamp with time zone DEFAULT now()
              );
            `
          });

          if (createError) {
            console.error('Error creating schema:', createError);
          } else {
            console.log('Database schema created successfully');
            setStatus('Database schema created');
          }
        }

        setInitialized(true);
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };

    initializeDB();
  }, []);

  return null;
};
