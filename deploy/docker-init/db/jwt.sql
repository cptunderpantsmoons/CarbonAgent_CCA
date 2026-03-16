-- JWT Configuration for Praxis Agent Carbon Platform
-- This script sets up JWT authentication functions and configuration

-- ============================================================================
-- JWT FUNCTIONS
-- ============================================================================

-- Function to generate JWT tokens
CREATE OR REPLACE FUNCTION generate_jwt_token(
    user_id UUID,
    expires_in INTERVAL DEFAULT INTERVAL '30 days'
) RETURNS TEXT AS $$
DECLARE
    secret_key TEXT;
    token_payload JSONB;
    token TEXT;
BEGIN
    -- Get the JWT secret from application config
    secret_key := current_setting('app.jwt_secret', TRUE);
    
    IF secret_key IS NULL OR secret_key = '' THEN
        RAISE EXCEPTION 'JWT secret not configured';
    END IF;
    
    -- Build token payload
    token_payload := jsonb_build_object(
        'user_id', user_id,
        'exp', EXTRACT(EPOCH FROM (NOW() + expires_in))::BIGINT,
        'iat', EXTRACT(EPOCH FROM NOW())::BIGINT
    );
    
    -- Sign the token (simplified - in production use proper JWT library)
    token := encode(
        digest(
            token_payload::TEXT || secret_key,
            'sha256'
        ),
        'base64'
    );
    
    RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify JWT token
CREATE OR REPLACE FUNCTION verify_jwt_token(token TEXT)
RETURNS JSONB AS $$
DECLARE
    secret_key TEXT;
    token_payload JSONB;
    token_data JSONB;
BEGIN
    -- Get the JWT secret from application config
    secret_key := current_setting('app.jwt_secret', TRUE);
    
    IF secret_key IS NULL OR secret_key = '' THEN
        RAISE EXCEPTION 'JWT secret not configured';
    END IF;
    
    -- In a real implementation, this would decode and verify the JWT signature
    -- For now, we'll create a placeholder that should be replaced with proper JWT logic
    -- This should be implemented at the application level (InsForge backend)
    
    RETURN jsonb_build_object('valid', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SESSION MANAGEMENT WITH JWT
-- ============================================================================

-- Function to create user session with JWT
CREATE OR REPLACE FUNCTION create_user_session(
    user_id UUID,
    expires_in INTERVAL DEFAULT INTERVAL '30 days'
) RETURNS JSONB AS $$
DECLARE
    session_id UUID;
    jwt_token TEXT;
    expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate expiration
    expires_at := NOW() + expires_in;
    
    -- Create session record
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (user_id, encode(gen_random_bytes(32), 'hex'), expires_at)
    RETURNING sessions.id INTO session_id;
    
    -- Generate JWT token
    jwt_token := generate_jwt_token(user_id, expires_in);
    
    -- Return session info with token
    RETURN jsonb_build_object(
        'session_id', session_id,
        'user_id', user_id,
        'token', jwt_token,
        'expires_at', expires_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and refresh session
CREATE OR REPLACE FUNCTION refresh_session(session_id UUID)
RETURNS JSONB AS $$
DECLARE
    session_data sessions;
    new_token TEXT;
BEGIN
    -- Get existing session
    SELECT * INTO session_data
    FROM sessions
    WHERE sessions.id = session_id
    AND sessions.expires_at > NOW();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found or expired';
    END IF;
    
    -- Generate new token
    new_token := generate_jwt_token(
        session_data.user_id,
        session_data.expires_at - NOW()
    );
    
    -- Update last used timestamp
    UPDATE sessions
    SET updated_at = NOW()
    WHERE sessions.id = session_id;
    
    RETURN jsonb_build_object(
        'session_id', session_id,
        'user_id', session_data.user_id,
        'token', new_token,
        'expires_at', session_data.expires_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INT AS $$
DECLARE
    deleted_count INT;
BEGIN
    -- Delete expired sessions
    DELETE FROM sessions
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- JWT HELPER FUNCTIONS
-- ============================================================================

-- Set current user context from JWT (called by application middleware)
CREATE OR REPLACE FUNCTION set_user_context(user_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::TEXT, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user ID from context
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', TRUE)::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific permission (placeholder for RBAC)
CREATE OR REPLACE FUNCTION user_has_permission(permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    user_id := get_current_user_id();
    
    -- For now, all authenticated users have all permissions
    -- This should be expanded with proper RBAC
    RETURN user_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUDIT FUNCTIONS
-- ============================================================================

-- Log user action for audit trail
CREATE OR REPLACE FUNCTION log_user_action(
    action TEXT,
    resource_type VARCHAR DEFAULT NULL,
    resource_id UUID DEFAULT NULL,
    details JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
    user_id UUID;
BEGIN
    user_id := get_current_user_id();
    
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
    VALUES (user_id, action, resource_type, resource_id, details)
    RETURNING audit_logs.id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS FOR AUDIT LOGGING
-- ============================================================================

-- Trigger function to log table changes
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_user_action(
            'INSERT',
            TG_TABLE_NAME::TEXT,
            NEW.id,
            jsonb_build_object('operation', 'INSERT', 'new_data', row_to_json(NEW))
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_user_action(
            'UPDATE',
            TG_TABLE_NAME::TEXT,
            NEW.id,
            jsonb_build_object(
                'operation', 'UPDATE',
                'old_data', row_to_json(OLD),
                'new_data', row_to_json(NEW)
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_user_action(
            'DELETE',
            TG_TABLE_NAME::TEXT,
            OLD.id,
            jsonb_build_object('operation', 'DELETE', 'old_data', row_to_json(OLD))
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Enable audit logging on critical tables (optional - can be resource intensive)
-- Uncomment to enable:
-- CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
--     FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- SCHEDULED MAINTENANCE
-- ============================================================================

-- Create a scheduled task to clean up expired sessions (should be run daily)
-- This can be managed by pg_cron or application scheduler

COMMENT ON FUNCTION cleanup_expired_sessions IS 
'Clean up expired sessions - should be scheduled to run daily';

COMMENT ON FUNCTION generate_jwt_token IS 
'Generate JWT token for user authentication';

COMMENT ON FUNCTION verify_jwt_token IS 
'Verify JWT token and return payload (implementation at application level)';

COMMENT ON FUNCTION create_user_session IS 
'Create new session and return JWT token';

COMMENT ON FUNCTION refresh_session IS 
'Refresh existing session and generate new token';

COMMENT ON FUNCTION log_user_action IS 
'Log user action to audit trail';

COMMIT;
