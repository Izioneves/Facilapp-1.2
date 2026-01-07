# Backend Directory

This directory contains the backend logic, effectively managing the Supabase configuration.

## Structure
- `/supabase/migrations`: SQL files to set up the database schema and RLS policies.
- `/supabase/functions`: Database functions (RPC) or Edge Functions.
- `/supabase/seed.sql`: Initial data population.

## Deployment
Migrating to a new Supabase project:
1. Copy content from `migrations/*.sql` to the Supabase SQL Editor.
2. Run `seed.sql` if needed.
