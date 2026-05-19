import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
async function run() {
  const { data, error } = await supabase.from('products').select('name, description').limit(10)
  if (error) console.error(error)
  else console.log(data)
}
run()
