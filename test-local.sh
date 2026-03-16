#!/bin/bash

# Praxis Agent Carbon Platform - Local Test Script
# This script tests all core functionality locally

set -e

echo "=========================================="
echo "PRAXIS AGENT CARBON LOCAL TEST SUITE"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASS=0
FAIL=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        PASS=$((PASS+1))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        FAIL=$((FAIL+1))
    fi
}

echo "1. Container Health Checks"
echo "----------------------------"

# Check if containers are running
docker ps --format "{{.Names}}" | grep -q "praxis-postgres-local"
test_result $? "PostgreSQL container running"

docker ps --format "{{.Names}}" | grep -q "praxis-postgrest-local"
test_result $? "PostgREST container running"

docker ps --format "{{.Names}}" | grep -q "praxis-adminer-local"
test_result $? "Adminer container running"

echo ""
echo "2. Database Connectivity"
echo "----------------------------"

# Test PostgreSQL connection
docker exec praxis-postgres-local pg_isready -U postgres > /dev/null 2>&1
test_result $? "PostgreSQL accepting connections"

# Test database exists
docker exec praxis-postgres-local psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='praxis_agent_carbon';" -t | grep -q "1"
test_result $? "Database 'praxis_agent_carbon' exists"

echo ""
echo "3. Database Schema Validation"
echo "----------------------------"

# Test tables exist
TABLE_COUNT=$(docker exec praxis-postgres-local psql -U postgres -d praxis_agent_carbon -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" -t)
[ "$TABLE_COUNT" -ge 15 ]
test_result $? "Expected number of tables created ($TABLE_COUNT tables)"

# Test admin user exists
docker exec praxis-postgres-local psql -U postgres -d praxis_agent_carbon -c "SELECT email FROM users WHERE email='admin@example.com';" -t | grep -q "admin@example.com"
test_result $? "Admin user created"

# Test JWT functions exist
docker exec praxis-postgres-local psql -U postgres -d praxis_agent_carbon -c "SELECT routine_name FROM information_schema.routines WHERE routine_name='generate_jwt_token';" -t | grep -q "generate_jwt_token"
test_result $? "JWT functions created"

echo ""
echo "4. API Layer Tests"
echo "----------------------------"

# Test PostgREST API is responding
curl -s http://localhost:5437/ | grep -q "swagger"
test_result $? "PostgREST API responding"

# Test OpenAPI spec
curl -s http://localhost:5437/ | grep -q "\"openapi\""
test_result $? "OpenAPI specification available"

# Test users endpoint accessible
curl -s -o /dev/null -w "%{http_code}" http://localhost:5437/users | grep -q "200"
test_result $? "Users endpoint accessible (HTTP 200)"

echo ""
echo "5. Data Integrity Tests"
echo "----------------------------"

# Test we can query users table
USER_COUNT=$(curl -s http://localhost:5437/users | jq '. | length')
[ "$USER_COUNT" -ge 1 ]
test_result $? "Can query users table ($USER_COUNT users found)"

# Test RLS policies exist
RLS_COUNT=$(docker exec praxis-postgres-local psql -U postgres -d praxis_agent_carbon -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname='public';" -t)
[ "$RLS_COUNT" -ge 5 ]
test_result $? "Row-level security policies created ($RLS_COUNT policies)"

echo ""
echo "6. Authentication System Tests"
echo "----------------------------"

# Test anon role exists
docker exec praxis-postgres-local psql -U postgres -c "SELECT rolname FROM pg_roles WHERE rolname='anon';" -t | grep -q "anon"
test_result $? "Anonymous role created for PostgREST"

# Test authenticated role exists
docker exec praxis-postgres-local psql -U postgres -c "SELECT rolname FROM pg_roles WHERE rolname='authenticated';" -t | grep -q "authenticated"
test_result $? "Authenticated role created"

echo ""
echo "7. Service Integration Tests"
echo "----------------------------"

# Test PostgREST can connect to PostgreSQL
curl -s http://localhost:5437/users > /dev/null 2>&1
test_result $? "PostgREST successfully connected to database"

# Test database is listening on correct port
docker exec praxis-postgres-local psql -U postgres -c "SELECT inet_server_port();" -t | grep -q "5432"
test_result $? "PostgreSQL listening on port 5432"

echo ""
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo "Total:  $((PASS+FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}=========================================="
    echo "✓ ALL TESTS PASSED!"
    echo "==========================================${NC}"
    echo ""
    echo "Your local environment is ready!"
    echo ""
    echo "Available Services:"
    echo "  • PostgreSQL:   localhost:5436"
    echo "  • PostgREST:    http://localhost:5437"
    echo "  • Adminer DB:   http://localhost:8888"
    echo ""
    echo "Admin Credentials:"
    echo "  • Email:    admin@example.com"
    echo "  • Password: change-this-password"
    echo ""
    echo "Next Steps:"
    echo "  1. Test API endpoints: curl http://localhost:5437/users"
    echo "  2. Open Adminer: http://localhost:8888"
    echo "  3. Deploy to Railway when ready"
    echo ""
    exit 0
else
    echo -e "${RED}=========================================="
    echo "✗ SOME TESTS FAILED"
    echo "==========================================${NC}"
    echo ""
    echo "Please check the logs:"
    echo "  docker logs praxis-postgres-local"
    echo "  docker logs praxis-postgrest-local"
    echo ""
    exit 1
fi
