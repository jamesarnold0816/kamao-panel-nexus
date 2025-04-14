import { supabase } from './supabase';

async function setupDatabaseTables() {
  console.log('Checking and creating tables if they do not exist...');

  try {
    // Check if plan_upgrade_requests table exists, and create it if not
    const { error: checkError } = await supabase
      .from('plan_upgrade_requests')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') { // Table doesn't exist
      console.log('Creating plan_upgrade_requests table...');
      
      // Create the table using SQL
      const { error: createError } = await supabase.rpc('create_plan_requests_table', {});
      
      if (createError) {
        console.error('Error creating plan_upgrade_requests table:', createError);
        
        // Fallback to direct SQL execution
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS plan_upgrade_requests (
              id UUID PRIMARY KEY,
              reseller_id UUID REFERENCES users(id),
              reseller_name TEXT NOT NULL,
              reseller_email TEXT NOT NULL,
              current_plan TEXT NOT NULL,
              requested_plan TEXT NOT NULL,
              status TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
          `
        });
        
        if (sqlError) {
          console.error('Error executing SQL to create table:', sqlError);
        } else {
          console.log('plan_upgrade_requests table created successfully');
        }
      } else {
        console.log('plan_upgrade_requests table created successfully');
      }
    } else {
      console.log('plan_upgrade_requests table already exists');
    }
    
  } catch (error) {
    console.error('Error setting up database tables:', error);
  }
}

// Execute the setup function
setupDatabaseTables();

export default setupDatabaseTables; 