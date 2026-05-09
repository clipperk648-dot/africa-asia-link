import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pwpqaljpshlcxxsfrrgv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cHFhbGpwc2hsY3h4c2Zycmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTkzODksImV4cCI6MjA5MzgzNTM4OX0.z2bTBu6lDr3i7NykxydSTvrc5u2DHbVau4Mn4cfAA6M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * SQL Schema for required tables:
 * 
 * -- Profiles table
 * create table profiles (
 *   id uuid references auth.users on delete cascade primary key,
 *   email text unique,
 *   name text,
 *   phone text,
 *   role text default 'buyer',
 *   avatar text,
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * -- Products table
 * create table products (
 *   id uuid default uuid_generate_v4() primary key,
 *   name text not null,
 *   category text,
 *   price numeric not null,
 *   image text,
 *   images text[],
 *   rating numeric default 0,
 *   description text,
 *   seller_id uuid references profiles(id),
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- Clusters table
 * create table clusters (
 *   id uuid default uuid_generate_v4() primary key,
 *   name text not null,
 *   description text,
 *   creator_id uuid references profiles(id),
 *   target_product_id uuid references products(id),
 *   target_product_name text,
 *   target_price numeric default 0,
 *   current_funded numeric default 0,
 *   quantity integer default 0,
 *   max_members integer default 5,
 *   current_members integer default 0,
 *   preferred_shipping_method text,
 *   shipping_status text default 'shipping not started yet',
 *   shipping_started_at timestamp with time zone,
 *   stop_counting boolean default false,
 *   status text default 'active',
 *   deadline timestamp with time zone,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- Cluster Members table
 * create table cluster_members (
 *   id uuid default uuid_generate_v4() primary key,
 *   cluster_id uuid references clusters(id) on delete cascade,
 *   user_id uuid references profiles(id),
 *   joined_quantity integer default 0,
 *   joined_amount numeric default 0,
 *   joined_at timestamp with time zone default now()
 * );
 * 
 * -- Cluster Messages
 * create table cluster_messages (
 *   id uuid default uuid_generate_v4() primary key,
 *   cluster_id uuid references clusters(id) on delete cascade,
 *   user_id uuid references profiles(id),
 *   content text,
 *   type text default 'text',
 *   poll_data jsonb,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- Support Messages
 * create table support_messages (
 *   id uuid default uuid_generate_v4() primary key,
 *   sender_id uuid references profiles(id),
 *   recipient_id uuid references profiles(id),
 *   text text,
 *   sender_role text,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- Notifications
 * create table notifications (
 *   id uuid default uuid_generate_v4() primary key,
 *   user_id uuid references profiles(id),
 *   title text,
 *   message text,
 *   type text,
 *   read boolean default false,
 *   created_at timestamp with time zone default now()
 * );
 */
