import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const DatabaseInitializer = () => {
  useEffect(() => {
    const initializeDB = async () => {
      try {
        // Check if products table exists by trying to fetch from it
        const { error: checkError } = await supabase
          .from('products')
          .select('id')
          .limit(1);

        if (checkError?.code === 'PGRST205') {
          // Table doesn't exist
          console.log('Database tables not initialized. Please create them using the Supabase dashboard or migration tools.');
          console.log('Required tables: products, profiles, clusters, cluster_members, cluster_messages, support_messages, notifications, wallets, orders, supplier_products');
          return;
        }

        // Check for other potential errors
        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is ok if empty
          console.warn('Database check error:', checkError);
        }

        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Database initialization check failed:', error);
      }
    };

    initializeDB();
  }, []);

  return null;
};
