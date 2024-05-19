#!/bin/bash

# Define the cgroup name
CGROUP_NAME="mygroup"

# Check if CPU limit argument is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <cpu_limit_microseconds>"
    exit 1
fi

# CPU limit in microseconds
CPU_LIMIT_MICROSECONDS="$1"

# Function to create or update the cgroup and set CPU limits
create_or_update_cgroup() {
    if ! sudo cgget -g cpu:$CGROUP_NAME &>/dev/null; then
        # Cgroup doesn't exist, create it
        echo "Creating cgroup: $CGROUP_NAME"
        sudo cgcreate -g cpu:$CGROUP_NAME
    fi
    
    # Apply CPU limits to the cgroup
    echo "Applying CPU limit of $CPU_LIMIT_MICROSECONDS microseconds to cgroup: $CGROUP_NAME"
    sudo cgset -r cpu.cfs_quota_us=$CPU_LIMIT_MICROSECONDS $CGROUP_NAME
}

# Function to run the worker process within the cgroup
run_worker_in_cgroup() {
    sudo cgexec -g cpu:$CGROUP_NAME node worker.js
}

# Main function
main() {
    create_or_update_cgroup
    run_worker_in_cgroup
}

# Run the main function
main
