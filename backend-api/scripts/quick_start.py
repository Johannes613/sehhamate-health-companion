#!/usr/bin/env python3
"""
HealthSphere AI Quick Start Script
This script helps you get the backend running quickly after model training
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    print("Checking Python version...")
    if sys.version_info < (3, 8):
        print(" Python 3.8+ required. Current version:", sys.version)
        return False
    print(f"Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def check_dependencies():
    """Check if required packages are installed"""
    print("\nChecking dependencies...")
    required_packages = [
        'fastapi', 'uvicorn', 'ultralytics', 'opencv-python', 
        'pillow', 'numpy', 'pyyaml'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"{package}")
        except ImportError:
            print(f" {package} - Missing")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\nMissing packages: {', '.join(missing_packages)}")
        print("Install with: pip install -r requirements.txt")
        return False
    
    return True

def check_model_files():
    """Check if trained model files are present"""
    print("\nChecking model files...")
    model_dir = Path("app/ml/models")
    
    if not model_dir.exists():
        print(" Model directory not found: app/ml/models/")
        print("Please create the directory and add your trained model")
        return False
    
    # Check for essential files
    essential_files = ['best.pt', 'dataset.yaml']
    missing_files = []
    
    for file in essential_files:
        file_path = model_dir / file
        if file_path.exists():
            print(f"{file}")
        else:
            print(f" {file} - Missing")
            missing_files.append(file)
    
    if missing_files:
        print(f"\nMissing essential model files: {', '.join(missing_files)}")
        print("Please ensure your trained model is properly placed in app/ml/models/")
        return False
    
    return True

def install_dependencies():
    """Install missing dependencies"""
    print("\nInstalling dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True, text=True)
        print("Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f" Failed to install dependencies: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    print("\nStarting HealthSphere AI Backend...")
    print("Server will be available at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server")
    
    try:
        # Start server in background
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", "main:app", 
            "--reload", "--host", "0.0.0.0", "--port", "8000"
        ])
        
        # Wait a bit for server to start
        time.sleep(3)
        
        # Test if server is running
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            if response.status_code == 200:
                print("Server started successfully!")
                print("HealthSphere AI Backend is now running!")
                print("\nYou can now:")
                print("- Test the API: python scripts/test_food_detection.py")
                print("- View docs: http://localhost:8000/docs")
                print("- Upload images for food detection")
            else:
                print("Server started but health check failed")
        except:
            print("Server may still be starting up...")
        
        # Keep server running
        process.wait()
        
    except KeyboardInterrupt:
        print("\n\n Server stopped by user")
        if 'process' in locals():
            process.terminate()
    except Exception as e:
        print(f" Failed to start server: {e}")

def main():
    """Main function"""
    print("HealthSphere AI Backend - Quick Start")
    print("=" * 50)
    
    # Check prerequisites
    if not check_python_version():
        sys.exit(1)
    
    if not check_dependencies():
        print("\nWould you like to install missing dependencies? (y/n): ", end="")
        if input().lower().startswith('y'):
            if not install_dependencies():
                sys.exit(1)
        else:
            print("Please install dependencies manually and run again")
            sys.exit(1)
    
    if not check_model_files():
        print("\n Cannot start without trained model files")
        print("Please complete the following steps:")
        print("1. Train your YOLOv8 model in Google Colab")
        print("2. Download the model package")
        print("3. Extract and place files in app/ml/models/")
        print("4. Run this script again")
        sys.exit(1)
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()

