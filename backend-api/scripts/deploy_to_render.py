#!/usr/bin/env python3
"""
HealthSphere AI Backend - Render Deployment Script
This script helps automate the deployment process to Render
"""
import os
import sys
import subprocess
import requests
import time
from pathlib import Path

def check_git_status():
    """Check if repository is ready for deployment"""
    print("Checking Git repository status...")
    
    try:
        # Check if we're in a git repository
        result = subprocess.run(['git', 'status'], capture_output=True, text=True)
        if result.returncode != 0:
            print("Error: Not in a Git repository")
            return False
        
        # Check for uncommitted changes
        result = subprocess.run(['git', 'diff', '--name-only'], capture_output=True, text=True)
        if result.stdout.strip():
            print("Warning: You have uncommitted changes:")
            for file in result.stdout.strip().split('\n'):
                if file:
                    print(f"  - {file}")
            
            response = input("Do you want to commit these changes? (y/n): ")
            if response.lower() == 'y':
                commit_changes()
            else:
                print("Please commit your changes before deploying")
                return False
        
        return True
        
    except Exception as e:
        print(f"Error checking Git status: {e}")
        return False

def commit_changes():
    """Commit all changes"""
    try:
        subprocess.run(['git', 'add', '.'], check=True)
        commit_message = input("Enter commit message (or press Enter for default): ")
        if not commit_message:
            commit_message = "Prepare for deployment: Update configuration and dependencies"
        
        subprocess.run(['git', 'commit', '-m', commit_message], check=True)
        print("Changes committed successfully")
        
    except Exception as e:
        print(f"Error committing changes: {e}")
        sys.exit(1)

def check_model_files():
    """Verify that model files are present"""
    print("Checking model files...")
    
    required_files = [
        "app/ml/models/best.pt",
        "app/ml/models/dataset.yaml",
        "app/ml/models/model_info.yaml"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print("Warning: Missing required model files:")
        for file in missing_files:
            print(f"  - {file}")
        print("Please ensure all model files are present before deployment")
        return False
    
    print("All required model files are present")
    return True

def check_deployment_files():
    """Verify deployment configuration files"""
    print("Checking deployment configuration...")
    
    required_files = [
        "Dockerfile",
        "render.yaml",
        "requirements.txt",
        "main.py"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print("Error: Missing deployment files:")
        for file in missing_files:
            print(f"  - {file}")
        return False
    
    print("All deployment files are present")
    return True

def push_to_github():
    """Push changes to GitHub"""
    print("Pushing changes to GitHub...")
    
    try:
        # Check if we have a remote origin
        result = subprocess.run(['git', 'remote', '-v'], capture_output=True, text=True)
        if 'origin' not in result.stdout:
            print("Error: No remote origin configured")
            print("Please add your GitHub repository as origin:")
            print("git remote add origin <your-github-repo-url>")
            return False
        
        # Push to main branch
        subprocess.run(['git', 'push', 'origin', 'main'], check=True)
        print("Changes pushed to GitHub successfully")
        return True
        
    except Exception as e:
        print(f"Error pushing to GitHub: {e}")
        return False

def get_render_url():
    """Get the Render service URL from user"""
    print("\n" + "="*50)
    print("DEPLOYMENT READY!")
    print("="*50)
    print("\nNext steps:")
    print("1. Go to https://render.com and sign in")
    print("2. Click 'New +' and select 'Web Service'")
    print("3. Connect your GitHub repository")
    print("4. Configure your service:")
    print("   - Name: healthsphere-ai-backend")
    print("   - Environment: Python 3")
    print("   - Build Command: pip install -r requirements.txt")
    print("   - Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT")
    print("   - Plan: Starter (free)")
    print("5. Add environment variables:")
    print("   - ENVIRONMENT=production")
    print("   - DEBUG=false")
    print("   - PORT=8000")
    print("6. Click 'Create Web Service'")
    print("\nAfter deployment, your API will be available at:")
    print("https://your-app-name.onrender.com")
    
    return input("\nEnter your Render service URL (or press Enter to skip): ").strip()

def test_deployment(url):
    """Test the deployed API"""
    if not url:
        return
    
    print(f"\nTesting deployed API at {url}...")
    
    try:
        # Test health endpoint
        response = requests.get(f"{url}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
        
        # Test model info
        response = requests.get(f"{url}/api/v1/ml/model-info", timeout=10)
        if response.status_code == 200:
            print("✅ Model info endpoint working")
        else:
            print(f"❌ Model info endpoint failed: {response.status_code}")
        
        # Test food classes
        response = requests.get(f"{url}/api/v1/ml/food-classes", timeout=10)
        if response.status_code == 200:
            print("✅ Food classes endpoint working")
        else:
            print(f"❌ Food classes endpoint failed: {response.status_code}")
        
        print("\n🎉 Deployment successful! Your HealthSphere AI API is now live!")
        
    except Exception as e:
        print(f"❌ Error testing deployment: {e}")
        print("The service might still be starting up. Try again in a few minutes.")

def main():
    """Main deployment process"""
    print("🚀 HealthSphere AI Backend - Render Deployment")
    print("=" * 50)
    
    # Check prerequisites
    if not check_git_status():
        sys.exit(1)
    
    if not check_model_files():
        sys.exit(1)
    
    if not check_deployment_files():
        sys.exit(1)
    
    # Push to GitHub
    if not push_to_github():
        sys.exit(1)
    
    # Get deployment instructions
    render_url = get_render_url()
    
    # Test deployment if URL provided
    if render_url:
        test_deployment(render_url)
    
    print("\n📚 For detailed deployment instructions, see: DEPLOYMENT_GUIDE.md")
    print("🔗 Render Dashboard: https://dashboard.render.com")

if __name__ == "__main__":
    main()
