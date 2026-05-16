import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const DatabaseInitializer = () => {
  useEffect(() => {
    const initializeDB = async () => {
      try {
        // List of critical tables to check
        const criticalTables = [
          'profiles', 
          'products', 
          'clusters', 
          'cluster_members', 
          'orders',
          'supplier_products'
        ];
        
        const missingTables = [];

        for (const table of criticalTables) {
          const { error } = await supabase
            .from(table)
            .select('id')
            .limit(1);

          if (error && (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message.includes('does not exist'))) {
            missingTables.push(table);
          }
        }

        if (missingTables.length > 0) {
          console.error('Database schema incomplete. Missing tables:', missingTables.join(', '));
          toast.error(`Database incomplete. Missing: ${missingTables.join(', ')}`, {
            description: 'Please run the SQL migrations in the Supabase dashboard.',
            duration: 10000,
          });
          return;
        }

        // Check if realtime is enabled by trying to subscribe
        const channel = supabase.channel('schema-check')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {})
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
              console.warn('Realtime subscription failed. Ensure Realtime is enabled for the profiles table.');
            }
          });

        console.log('Database connection and schema verified successfully');
        
        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Database initialization check failed:', error);
      }
    };

    initializeDB();
  }, []);

  return null;
};
