#!/usr/bin/env python3
"""
Script to verify Railway configuration for Praxis Agent Carbon + InsForge + Swarm
"""

import os
import sys
import yaml
from pathlib import Path


def check_file_exists(filepath):
    """Check if a file exists"""
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        return False
    print(f"✅ File found: {filepath}")
    return True


def check_directory_exists(dirpath):
    """Check if a directory exists"""
    if not os.path.isdir(dirpath):
        print(f"❌ Directory not found: {dirpath}")
        return False
    print(f"✅ Directory found: {dirpath}")
    return True


def main():
    print(
        "🔍 Verifying Railway configuration for Praxis Agent Carbon + InsForge + Swarm"
    )
    print("=" * 80)

    # Check required files
    files_to_check = [
        "docker-compose.railway.yml",
        "railway.json",
        ".env.railway.example",
        "Dockerfile.swarm",
        "docker-compose.unified.yml",
    ]

    all_good = True
    for file in files_to_check:
        if not check_file_exists(file):
            all_good = False

    print("\n" + "=" * 80)

    # Check required directories
    directories_to_check = [
        "agent-zero",
        "insforge",
        "nanoclaw",
        "deploy/docker-init/db",
        "deploy/docker-init/logs",
        "swarm-workspace/groups",
        "swarm-workspace/global",
        "swarm-workspace/extra",
        "swarm-workspace/ipc",
    ]

    for directory in directories_to_check:
        if not check_directory_exists(directory):
            all_good = False

    print("\n" + "=" * 80)

    # Check docker-compose.railway.yml for basic validity
    try:
        with open("docker-compose.railway.yml", "r") as f:
            compose_data = yaml.safe_load(f)

        if compose_data and "services" in compose_data:
            services = compose_data["services"]
            expected_services = [
                "postgres",
                "postgrest",
                "insforge",
                "deno",
                "vector",
                "praxis-agent-carbon",
                "swarm",
            ]

            print("🔧 Services found in docker-compose.railway.yml:")
            for service in expected_services:
                if service in services:
                    print(f"  ✅ {service}")
                else:
                    print(f"  ❌ {service} (missing)")
                    all_good = False
        else:
            print("❌ Invalid docker-compose.railway.yml: no services section")
            all_good = False

    except Exception as e:
        print(f"❌ Error parsing docker-compose.railway.yml: {e}")
        all_good = False

    print("\n" + "=" * 80)

    # Check railway.json
    try:
        import json

        with open("railway.json", "r") as f:
            railway_data = json.load(f)

        if railway_data and "build" in railway_data:
            if "dockerComposePath" in railway_data["build"]:
                print("✅ railway.json: valid build configuration")
                print(
                    f"   Docker Compose path: {railway_data['build']['dockerComposePath']}"
                )
            else:
                print("❌ railway.json: missing dockerComposePath in build")
                all_good = False
        else:
            print("❌ railway.json: invalid structure")
            all_good = False

    except Exception as e:
        print(f"❌ Error parsing railway.json: {e}")
        all_good = False

    print("\n" + "=" * 80)

    if all_good:
        print("🎉 All checks passed! Railway configuration appears to be valid.")
        print("\n📋 Next steps for deployment:")
        print("1. Push this repository to GitHub")
        print("2. Create a new project on Railway")
        print("3. Connect your GitHub repository to Railway")
        print("4. Railway should automatically detect docker-compose.railway.json")
        print(
            "5. Set environment variables in Railway dashboard (copy from .env.railway.example)"
        )
        print("6. Deploy!")
        return 0
    else:
        print("❌ Some checks failed. Please fix the issues above before deploying.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
