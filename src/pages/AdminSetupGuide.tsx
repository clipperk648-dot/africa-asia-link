import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const AdminSetupGuide = () => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const steps = [
    {
      number: 1,
      title: 'Go to Supabase Dashboard',
      description: 'Open your Supabase project and go to the SQL Editor',
      action: 'https://app.supabase.com',
      completed: false
    },
    {
      number: 2,
      title: 'Create Database Tables',
      description: 'Copy and run the SQL schema below in the SQL Editor',
      sql: `-- Profiles table
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

-- Products table
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
  currency text DEFAULT 'NGN',
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

-- Clusters table
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

-- Cluster Members table
CREATE TABLE IF NOT EXISTS cluster_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  cluster_id uuid REFERENCES clusters(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  joined_quantity integer DEFAULT 0,
  joined_amount numeric DEFAULT 0,
  joined_at timestamp with time zone DEFAULT now()
);

-- Cluster Messages
CREATE TABLE IF NOT EXISTS cluster_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  cluster_id uuid REFERENCES clusters(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  content text,
  type text DEFAULT 'text',
  poll_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Support Messages
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id uuid REFERENCES profiles(id),
  recipient_id uuid REFERENCES profiles(id),
  text text,
  sender_role text,
  created_at timestamp with time zone DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  title text,
  message text,
  type text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid UNIQUE REFERENCES profiles(id),
  balance numeric DEFAULT 0,
  currency text DEFAULT 'NGN',
  created_at timestamp with time zone DEFAULT now()
);

-- Orders table
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

-- Supplier Products table
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
);`,
      completed: false
    },
    {
      number: 3,
      title: 'Enable Row Level Security (RLS)',
      description: 'Optional but recommended for production. Go to Authentication > Policies',
      completed: false
    },
    {
      number: 4,
      title: 'Import Alibaba Products',
      description: 'Navigate to /admin/supplier-products and click "Seed Alibaba"',
      completed: false
    }
  ];

  const handleCopySQL = (sql: string) => {
    navigator.clipboard.writeText(sql).then(() => {
      setCopiedStep(2);
      toast.success('SQL copied to clipboard!');
      setTimeout(() => setCopiedStep(null), 2000);
    });
  };

  return (
    <AdminLayout>
      <main className="max-w-4xl mx-auto px-4 py-6 w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Database Setup Guide</h1>
          <p className="text-muted-foreground">Follow these steps to initialize your database and start importing Alibaba products</p>
        </div>

        <div className="space-y-4">
          {steps.map((step) => (
            <GlassCard key={step.number} className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-start pt-1">
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-2">Step {step.number}: {step.title}</h3>
                  <p className="text-muted-foreground mb-4">{step.description}</p>

                  {step.action && (
                    <a
                      href={step.action}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      Open Supabase Dashboard
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {step.sql && (
                    <div className="mt-4">
                      <div className="relative">
                        <pre className="bg-background/50 border border-border/50 rounded-lg p-4 text-xs overflow-x-auto max-h-96">
                          <code>{step.sql}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 gap-2"
                          onClick={() => handleCopySQL(step.sql!)}
                        >
                          <Copy className="w-4 h-4" />
                          {copiedStep === step.number ? 'Copied!' : 'Copy SQL'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-6 bg-green-500/10 border-green-500/30">
          <div className="flex gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-400 mb-1">Ready to Import?</h4>
              <p className="text-sm text-green-300 mb-4">Once your database is set up, go to the Supplier Products page to import Alibaba products.</p>
              <a href="/admin/supplier-products" className="inline-block">
                <Button size="sm">Go to Supplier Products</Button>
              </a>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-blue-500/10 border-blue-500/30">
          <h4 className="font-semibold text-blue-400 mb-3">Need Help?</h4>
          <ul className="text-sm text-blue-300 space-y-2">
            <li>• Check console (F12) for any error messages</li>
            <li>• Verify your Supabase project is active and has data</li>
            <li>• Ensure you're logged in as admin</li>
            <li>• Review the Supabase documentation for RLS setup</li>
          </ul>
        </GlassCard>
      </main>
    </AdminLayout>
  );
};

export default AdminSetupGuide;
