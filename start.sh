#!/bin/bash

# Start all services defined in docker-compose.yml
docker-compose up -d

# Function to check the health status or running status of all services
all_services_up() {
  local services=$(docker-compose ps -q)
  for service in $services; do
    # Check if the service has a health status, otherwise check its running status
    local health_status=$(docker inspect -f '{{.State.Health.Status}}' $service 2>/dev/null)
    local running_status=$(docker inspect -f '{{.State.Status}}' $service 2>/dev/null)
    if [ "$health_status" != "healthy" ] && [ "$running_status" != "running" ]; then
      return 1
    fi
  done
  return 0
}

# Wait until all services are up or timeout after a certain period
timeout=20 # Timeout in seconds
end=$((SECONDS+timeout))
echo "Waiting for services to get started..."

while [ $SECONDS -lt $end ]; do
  if all_services_up; then
    echo "All services are up and running."
    # Output the URLs for the services
    echo "" # This will add an empty line for spacing
    echo "" # This will add an empty line for spacing
    echo "" # This will add an empty line for spacing
    echo "
          _______ ______ _      ______         __
        |__   __|  ____| |    / __ \ \        / /
            | |  | |__  | |   | |  | \ \  /\  / / 
            | |  |  __| | |   | |  | |\ \/  \/ /  
            | |  | |____| |___| |__| | \  /\  /   
            |_|  |______|______\____/   \/  \/                             
    "
    echo "" # This will add an empty line for spacing
    echo "" # This will add an empty line for spacing
    echo "     Telow:       http://localhost:3000"
    echo "     Authorizer:  http://localhost:1000"
    echo "     Hasura:      http://localhost:2000"
    echo "" # This will add an empty line for spacing
    echo "" # This will add an empty line for spacing
    echo "" # This will add an empty line for spacing
    echo "" # This will add an empty line for spacing
    break
  fi
  sleep 5
done

# If not all services are starting after the timeout, print a message
if [ $SECONDS -ge $end ]; then
    echo "Timeout reached: Not all services are started."
fi
