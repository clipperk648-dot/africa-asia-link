import https from 'https';
import { URL } from 'url';

const SUPABASE_URL = 'https://pwpqaljpshlcxxsfrrgv.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cHFhbGpwc2hsY3h4c2Zycmd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODI1OTM4OSwiZXhwIjoyMDkzODM1Mzg5fQ.NFksb8rQFQmLTJxKzfMcwhXhWkJEPr_zlxopWGCQOtc';

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SERVICE_KEY,
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cHFhbGpwc2hsY3h4c2Zycmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTkzODksImV4cCI6MjA5MzgzNTM4OX0.z2bTBu6lDr3i7NykxydSTvrc5u2DHbVau4Mn4cfAA6M'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ sql }));
    req.end();
  });
}

async function setupDatabase() {
  console.log('Setting up database tables...');

  const sqls = [
    `CREATE TABLE IF NOT EXISTS profiles (
      id uuid PRIMARY KEY,
      email text UNIQUE,
      name text,
      phone text,
      role text DEFAULT 'buyer',
      avatar text,
      suspended boolean DEFAULT false,
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
    );`,

    `CREATE TABLE IF NOT EXISTS products (
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
    );`,

    `CREATE TABLE IF NOT EXISTS clusters (
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
    );`,

    `CREATE TABLE IF NOT EXISTS cluster_members (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      cluster_id uuid REFERENCES clusters(id) ON DELETE CASCADE,
      user_id uuid REFERENCES profiles(id),
      joined_quantity integer DEFAULT 0,
      joined_amount numeric DEFAULT 0,
      joined_at timestamp with time zone DEFAULT now()
    );`,

    `CREATE TABLE IF NOT EXISTS cluster_messages (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      cluster_id uuid REFERENCES clusters(id) ON DELETE CASCADE,
      user_id uuid REFERENCES profiles(id),
      content text,
      type text DEFAULT 'text',
      poll_data jsonb,
      created_at timestamp with time zone DEFAULT now()
    );`,

    `CREATE TABLE IF NOT EXISTS support_messages (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      sender_id uuid REFERENCES profiles(id),
      recipient_id uuid REFERENCES profiles(id),
      text text,
      sender_role text,
      created_at timestamp with time zone DEFAULT now()
    );`,

    `CREATE TABLE IF NOT EXISTS notifications (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id uuid REFERENCES profiles(id),
      title text,
      message text,
      type text,
      read boolean DEFAULT false,
      created_at timestamp with time zone DEFAULT now()
    );`,

    `CREATE TABLE IF NOT EXISTS wallets (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id uuid UNIQUE REFERENCES profiles(id),
      balance numeric DEFAULT 0,
      currency text DEFAULT 'NGN',
      created_at timestamp with time zone DEFAULT now()
    );`,

    `CREATE TABLE IF NOT EXISTS orders (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      buyer_id uuid REFERENCES profiles(id),
      seller_id uuid REFERENCES profiles(id),
      product_id uuid REFERENCES products(id),
      quantity integer NOT NULL,
      total_price numeric NOT NULL,
      status text DEFAULT 'pending',
      created_at timestamp with time zone DEFAULT now()
    );`,

    `CREATE TABLE IF NOT EXISTS supplier_products (
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
    );`
  ];

  for (let i = 0; i < sqls.length; i++) {
    try {
      console.log('Executing SQL', i + 1, 'of', sqls.length);
      const result = await executeSQL(sqls[i]);
      console.log('Result:', result);
    } catch (err) {
      console.error('Error executing SQL', i + 1, ':', err);
    }
  }

  console.log('Database setup completed');
}

setupDatabase().catch(console.error);
