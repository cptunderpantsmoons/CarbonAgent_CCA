-- Praxis Agent Carbon Platform - Database Initialization
-- This script sets up the core database schema for the unified platform
-- It creates tables for InsForge, Agent Zero, and Swarm integration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Note: pgvector extension requires installation
-- For development, we'll use TEXT type for embeddings instead
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Create anon role for PostgREST
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon WITH NOLOGIN;
        GRANT USAGE ON SCHEMA public TO anon;
        -- Grant SELECT on all existing tables
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
        -- Grant SELECT on all future tables
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
    END IF;
END
$$;

-- Create authenticated role for PostgREST
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
        GRANT USAGE ON SCHEMA public TO authenticated;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    END IF;
END
$$;

-- ============================================================================
-- INSFORGE SCHEMA
-- ============================================================================

-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth accounts
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

-- API keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    last_used TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AGENT ZERO SCHEMA
-- ============================================================================

-- Agent configurations
CREATE TABLE IF NOT EXISTS agent_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    model_provider VARCHAR(100),
    model_name VARCHAR(255),
    system_prompt TEXT,
    tools JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent memories
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agent_configs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding TEXT,  -- Changed from VECTOR to TEXT for compatibility
    keywords TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agent_configs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500),
    messages JSONB DEFAULT '[]',
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    path VARCHAR(1000),
    secrets JSONB DEFAULT '{}',
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SWARM (NANOCLAW) SCHEMA
-- ============================================================================

-- Swarm groups
CREATE TABLE IF NOT EXISTS swarm_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    channel_type VARCHAR(50) NOT NULL, -- whatsapp, telegram, discord, etc.
    channel_id VARCHAR(255),
    trigger_word VARCHAR(100) DEFAULT '@Andy',
    model VARCHAR(255) DEFAULT 'claude-opus-4-1-20250805',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_type, channel_id)
);

-- Swarm messages
CREATE TABLE IF NOT EXISTS swarm_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES swarm_groups(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL, -- user, agent, system
    sender_id VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, file, system
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled tasks
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES swarm_groups(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    schedule VARCHAR(255) NOT NULL, -- cron expression
    task_prompt TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swarm sessions
CREATE TABLE IF NOT EXISTS swarm_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES swarm_groups(id) ON DELETE CASCADE,
    container_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'running', -- running, stopped, error
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- SHARED INFRASTRUCTURE
-- ============================================================================

-- File storage metadata
CREATE TABLE IF NOT EXISTS stored_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    size BIGINT,
    mime_type VARCHAR(255),
    checksum VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function deployments (Deno)
CREATE TABLE IF NOT EXISTS function_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entry_point VARCHAR(500) NOT NULL,
    environment JSONB DEFAULT '{}',
    deployment_url VARCHAR(1000),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id);

-- Agent Zero
CREATE INDEX IF NOT EXISTS idx_agent_configs_user_id ON agent_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_agent_id ON memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_keywords ON memories USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Swarm
CREATE INDEX IF NOT EXISTS idx_swarm_groups_user_id ON swarm_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_swarm_groups_channel ON swarm_groups(channel_type, channel_id);
CREATE INDEX IF NOT EXISTS idx_swarm_messages_group_id ON swarm_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_swarm_messages_created_at ON swarm_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_user_id ON scheduled_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_run ON scheduled_tasks(next_run);
CREATE INDEX IF NOT EXISTS idx_swarm_sessions_group_id ON swarm_sessions(group_id);

-- Shared
CREATE INDEX IF NOT EXISTS idx_stored_files_user_id ON stored_files(user_id);
CREATE INDEX IF NOT EXISTS idx_function_deployments_user_id ON function_deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_configs_updated_at BEFORE UPDATE ON agent_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swarm_groups_updated_at BEFORE UPDATE ON swarm_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_tasks_updated_at BEFORE UPDATE ON scheduled_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_function_deployments_updated_at BEFORE UPDATE ON function_deployments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all user-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE swarm_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE swarm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stored_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE function_deployments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - these should be expanded based on auth context)

-- Users can only see their own data
CREATE POLICY user_isolation ON users
    FOR ALL USING (id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY sessions_isolation ON sessions
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY oauth_accounts_isolation ON oauth_accounts
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY api_keys_isolation ON api_keys
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY agent_configs_isolation ON agent_configs
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY memories_isolation ON memories
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY conversations_isolation ON conversations
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY projects_isolation ON projects
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY swarm_groups_isolation ON swarm_groups
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY swarm_messages_isolation ON swarm_messages
    FOR ALL USING (
        group_id IN (
            SELECT id FROM swarm_groups 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

CREATE POLICY scheduled_tasks_isolation ON scheduled_tasks
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY stored_files_isolation ON stored_files
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY function_deployments_isolation ON function_deployments
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create admin user (if no users exist)
INSERT INTO users (id, email, password_hash, email_verified)
SELECT
    uuid_generate_v4(),
    'admin@example.com',
    crypt('change-this-password', gen_salt('bf')),
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM users);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active user sessions view
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    s.id,
    s.user_id,
    u.email,
    s.expires_at
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.expires_at > NOW();

-- Agent statistics view
CREATE OR REPLACE VIEW agent_statistics AS
SELECT 
    a.id,
    a.name,
    COUNT(DISTINCT c.id) as conversation_count,
    COUNT(DISTINCT m.id) as memory_count,
    MAX(c.updated_at) as last_activity
FROM agent_configs a
LEFT JOIN conversations c ON a.id = c.agent_id
LEFT JOIN memories m ON a.id = m.agent_id
GROUP BY a.id;

-- Swarm group activity view
CREATE OR REPLACE VIEW swarm_group_activity AS
SELECT 
    g.id,
    g.name,
    g.channel_type,
    COUNT(DISTINCT msg.id) as message_count,
    MAX(msg.created_at) as last_message,
    COUNT(DISTINCT sess.id) FILTER (WHERE sess.status = 'running') as active_sessions
FROM swarm_groups g
LEFT JOIN swarm_messages msg ON g.id = msg.group_id
LEFT JOIN swarm_sessions sess ON g.id = sess.group_id AND sess.ended_at IS NULL
GROUP BY g.id;

COMMIT;
