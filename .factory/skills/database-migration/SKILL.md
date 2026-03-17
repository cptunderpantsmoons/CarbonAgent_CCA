---
name: database-migration
version: 1.0.0
description: |
  Manage PostgreSQL database schema migrations with version control, rollback
  support, and automatic execution. Use this when making database schema changes,
  adding new tables, or modifying existing structures.

  Complexities: Migration ordering, dependency management, rollback logic,
  transaction handling, schema validation, multi-environment support.
---

# Database Migration

Manage PostgreSQL database schema changes with versioned migrations and rollback support.

## When to use this skill

Use this when you need to:
- Add new tables to the database
- Modify existing table structures
- Create or drop indexes
- Add or modify columns
- Create views or stored procedures
- Manage database schema across environments
- Rollback failed schema changes
- Track schema version history

## How it works

The migration system uses node-pg-migrate with these components:

1. **Migration Files**: Versioned SQL/JS migration files
2. **Migration Table**: Tracks applied migrations in database
3. **Runner**: Executes migrations in order
4. **Rollback**: Supports down migrations to revert changes
5. **Schema Lock**: Prevents concurrent migrations
6. **Validation**: Checks migration syntax before execution

## Key files

- `insforge/backend/src/infra/database/migrations/` - Migration files directory
- `insforge/backend/src/infra/database/migrations/bootstrap/` - Bootstrap migrations
- `insforge/backend/package.json` - Migration scripts
- `deploy/docker-init/db/` - Initial database schema

## Usage patterns

### Create a new migration

```bash
# From insforge/backend directory
cd /media/emt7/backup/CarbonAgent/insforge/backend

# Create a new migration
npm run migrate:create -- --name add_user_preferences_table

# Creates: migrations/20260316120000_add_user_preferences_table.up.sql
# And:    migrations/20260316120000_add_user_preferences_table.down.sql
```

### Write migration SQL

**Up migration** (migrations/20260316120000_add_user_preferences_table.up.sql):
```sql
-- Create user_preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Down migration** (migrations/20260316120000_add_user_preferences_table.down.sql):
```sql
-- Drop trigger
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

-- Drop index
DROP INDEX IF EXISTS idx_user_preferences_user_id;

-- Drop table
DROP TABLE IF EXISTS user_preferences;
```

### Run migrations

```bash
# From insforge directory
cd /media/emt7/backup/CarbonAgent/insforge

# Bootstrap migration system (first time only)
npm run migrate:bootstrap

# Run all pending migrations
npm run migrate:up

# Run with specific database URL
DATABASE_URL="postgresql://user:pass@localhost:5432/db" npm run migrate:up

# Run in local development
npm run migrate:up:local
```

### Rollback migrations

```bash
# Rollback last migration
npm run migrate:down

# Rollback multiple migrations
npm run migrate:down -- --count 3

# Rollback to specific migration
npm run migrate:down -- --migration 20260316100000
```

## Prerequisites

- PostgreSQL 15+ installed and running
- Node.js 20+ with npm
- Database exists and is accessible
- Sufficient permissions to CREATE/ALTER/DROP objects
- Migration schema exists (created by bootstrap)

## Migration file structure

```
migrations/
├── .migrations-schema.sql          # Schema lock table
├── 20260316100000_add_users_table.up.sql
├── 20260316100000_add_users_table.down.sql
├── 20260316120000_add_user_preferences_table.up.sql
├── 20260316120000_add_user_preferences_table.down.sql
└── ...
```

Migration filename format: `YYYYMMDDHHMMSS_descriptive_name.{up|down}.sql`

## Migration types

### SQL migrations

Use `.sql` files for pure SQL operations:

```sql
-- Up migration
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Down migration
ALTER TABLE users DROP COLUMN email_verified;
```

### JS migrations

Use `.js` files for complex logic with external libraries:

```javascript
// Up migration
exports.up = async (pgm) => {
    await pgm.sql('CREATE TABLE audit_log (id SERIAL PRIMARY KEY, data JSONB)');
};

// Down migration
exports.down = async (pgm) => {
    await pgm.sql('DROP TABLE audit_log');
};
```

## Configuration

```bash
# Environment variables
DATABASE_URL="postgresql://user:pass@host:5432/database"
MIGRATIONS_DIR="src/infra/database/migrations"
MIGRATIONS_SCHEMA="system"  # Schema for migration tracking table
MIGRATIONS_TABLE="migrations"  # Table name for tracking
```

## Migration lifecycle

1. **Creation**: Generate migration file with up/down SQL
2. **Development**: Write migration SQL locally
3. **Testing**: Test migration on development database
4. **Version Control**: Commit migration file to git
5. **Execution**: Run migration on target environment
6. **Verification**: Verify schema changes applied correctly
7. **Rollback** (if needed): Revert using down migration

## Best practices

1. **Write reversible migrations**: Always write both up and down migrations
2. **Use transactions**: Each migration runs in a transaction by default
3. **Test rollbacks**: Verify down migrations work correctly
4. **Keep migrations small**: One logical change per migration
5. **Use descriptive names**: Make migration purpose obvious from filename
6. **Don't modify existing migrations**: Create new migrations instead
7. **Backup before migration**: Always backup database before running migrations
8. **Use indexes wisely**: Create indexes after data is loaded if possible
9. **Avoid data migrations**: Prefer application-level data migrations
10. **Document breaking changes**: Note in comments if migration changes API

## Error handling

Common errors and solutions:

- **MigrationAlreadyApplied**: Migration was already run, check migration table
- **MigrationLockError**: Another migration is in progress, wait or clear lock
- **SyntaxError**: SQL syntax is invalid, test SQL in psql first
- **DependencyError**: Migration depends on table that doesn't exist, check order
- **PermissionDenied**: Insufficient database permissions, check user grants
- **ConnectionError**: Can't connect to database, verify DATABASE_URL

## Security considerations

- Migrations run with elevated database privileges
- Never commit sensitive data (passwords, tokens) in migration files
- Use environment variables for database credentials
- Review migration files for security issues before committing
- Test migrations on copy of production data if possible
- Keep audit log of who ran which migration when

## Troubleshooting

**Migration stuck:**
```bash
# Check if migration is locked
psql $DATABASE_URL -c "SELECT * FROM system.migrations WHERE locked = true"

# Clear lock manually (use caution!)
psql $DATABASE_URL -c "UPDATE system.migrations SET locked = false"
```

**Migration failed mid-execution:**
```bash
# Check migration status
psql $DATABASE_URL -c "SELECT * FROM system.migrations ORDER BY name DESC LIMIT 5"

# View failed migration logs
docker logs praxis-postgres | grep -i error

# Fix and rerun (may need to manually undo partial changes)
```

**Down migration doesn't work:**
```bash
# Test down migration manually
psql $DATABASE_URL -f migrations/20260316120000_add_user_preferences_table.down.sql

# Check if objects exist before dropping
psql $DATABASE_URL -c "\d user_preferences"

# May need to manually clean up
```

**Migration order issues:**
```bash
# Check which migrations have run
psql $DATABASE_URL -c "SELECT name FROM system.migrations ORDER BY name"

# Verify dependencies are met
grep -r "REFERENCES" migrations/*.up.sql
```

## Verify it worked

After running migration:
1. Check migration table: `SELECT * FROM system.migrations ORDER BY name DESC LIMIT 1`
2. Verify new table exists: `\d new_table_name` in psql
3. Check indexes: `\di` to list indexes
4. Test table operations: Insert/select from new table
5. Verify constraints: Try inserting invalid data to check constraints
6. Test rollback: Run down migration and verify table is gone

## Migration commands reference

```bash
# Bootstrap migration system (first time)
npm run migrate:bootstrap

# Run all pending migrations
npm run migrate:up

# Run single migration
npm run migrate:up -- --file 20260316120000_add_user_preferences_table.sql

# Rollback last migration
npm run migrate:down

# Rollback specific migration
npm run migrate:down -- --count 3

# Create new migration
npm run migrate:create -- --name migration_name

# Redo last migration (down then up)
npm run migrate:redo

# List migrations
psql $DATABASE_URL -c "SELECT name, run_on FROM system.migrations ORDER BY name"
```

## Advanced patterns

### Conditional migrations

```sql
-- Add column only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
```

### Data migrations

```sql
-- Backfill data for new column
UPDATE users SET email_verified = TRUE WHERE email IS NOT NULL AND email != '';
```

### Idempotent migrations

```sql
-- Create table if not exists
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
```

## What not to do

- Don't modify committed migrations - create new ones instead
- Don't run migrations on production without testing first
- Don't ignore failed migrations - investigate and fix
- Don't mix schema and data migrations if possible
- Don't use SELECT * in migrations - be explicit about columns
- Don't forget indexes - they're crucial for performance
- Don't create constraints without understanding performance impact
- Don't run migrations without backup
- Don't assume migrations will be fast - test on production-size dataset

## Integration with deployment

Migrations run automatically on deployment:

```dockerfile
# In InsForge Dockerfile
RUN npm run migrate:bootstrap && \
    npm run migrate:up
```

For Railway deployment, migrations run in container startup:

```yaml
# docker-compose.railway.yml
command: sh -c "cd backend && npm run migrate:up && cd .. && npm run dev"
```

## Monitoring

Track migration status:

```sql
-- View all migrations
SELECT name, run_on FROM system.migrations ORDER BY name;

-- View pending migrations (files without DB entries)
SELECT file_name FROM migrations_directory
EXCEPT
SELECT name FROM system.migrations;

-- Check migration lock
SELECT * FROM system.migrations WHERE locked = true;
```
