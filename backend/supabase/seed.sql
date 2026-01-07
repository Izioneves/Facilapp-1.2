-- Seed Data
-- Use this file to populate static data like categories or default config.

-- App Config
insert into public.app_config (maintenance_mode, min_version)
values (false, '1.0.0')
on conflict do nothing;

-- Example: Insert default categories (if we had a categories table, but currently it's an array on profiles)
-- Since we don't have a separate categories table, we skip specific category inserts.

-- Note: Users/Stores are dynamic and should not be seeded here to avoid conflict with Auth system.
