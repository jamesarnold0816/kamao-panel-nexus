# Supabase Database Setup

## Method 1: Using the Supabase Web UI

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query and paste the contents of `supabase-schema.sql`
4. Run the query to create all required tables

## Method 2: Using the Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push --db-url=YOUR_SUPABASE_URL
```

## Manual Verification

After running the setup script, verify that the following tables were created:

1. users
2. products
3. orders
4. plan_upgrade_requests

You can check this in the Table Editor section of your Supabase dashboard.

## Troubleshooting

If you encounter any issues:

1. **Table Already Exists**: If you get errors about tables already existing, you can drop the tables first:
   ```sql
   DROP TABLE IF EXISTS plan_upgrade_requests;
   DROP TABLE IF EXISTS orders;
   DROP TABLE IF EXISTS products;
   DROP TABLE IF EXISTS users;
   ```
   
2. **Permission Issues**: Make sure you're using the service role key (not the anon key) when executing these commands.

3. **Database Errors**: Check the browser console and server logs for detailed error messages.

## Testing the API

After setup, test the API endpoints:

```bash
# Get all plan requests (as admin)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" http://localhost:5000/api/plan-requests
```

The server automatically attempts to create missing tables on startup, but manual verification is recommended. 