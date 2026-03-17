#!/bin/bash

echo "=========================================="
echo "Swapping UI Files in Running Container"
echo "=========================================="

# Copy new UI files directly into running container
echo "1. Copying new webui files..."
docker cp /media/emt7/backup/CarbonAgent/agent-zero/webui/. praxis-agent-carbon:/usr/src/app/webui/

# Copy other updated files
echo "2. Copying usr files..."
docker cp /media/emt7/backup/CarbonAgent/agent-zero/usr/. praxis-agent-carbon:/usr/src/app/usr/

echo "3. Copying prompts..."
docker cp /media/emt7/backup/CarbonAgent/agent-zero/prompts/. praxis-agent-carbon:/usr/src/app/prompts/

echo "4. Copying python tools..."
docker cp /media/emt7/backup/CarbonAgent/agent-zero/python/. praxis-agent-carbon:/usr/src/app/python/

echo "5. Restarting the run_ui service to pick up changes..."
docker exec praxis-agent-carbon supervisorctl restart run_ui

echo "6. Waiting for service to restart..."
sleep 10

echo "7. Checking if service is running..."
docker exec praxis-agent-carbon supervisorctl status run_ui

echo ""
echo "=========================================="
echo "UI Swap Complete!"
echo "=========================================="
echo ""
echo "Check the new UI at: http://localhost:50080"
echo ""
echo "If it still shows old UI, try hard refresh (Ctrl+Shift+R)"
echo ""
