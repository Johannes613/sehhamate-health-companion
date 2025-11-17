#!/usr/bin/env python3
"""
Test script for HealthSphere AI Food Detection API
This script tests the API endpoints after the model is integrated
"""

import requests
import json
import os
import time
from pathlib import Path

# API configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1/ml"

def test_health_endpoint():
    """Test the main health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("Health endpoint working")
            print(f"Response: {response.json()}")
        else:
            print(f" Health endpoint failed: {response.status_code}")
    except Exception as e:
        print(f" Health endpoint error: {e}")

def test_model_info():
    """Test the model info endpoint"""
    print("\nTesting model info endpoint...")
    try:
        response = requests.get(f"{API_BASE}/model-info")
        if response.status_code == 200:
            print("Model info endpoint working")
            data = response.json()
            print(f"Model: {data.get('model_name')}")
            print(f"Classes: {data.get('num_classes')}")
            print(f"Framework: {data.get('framework')}")
        else:
            print(f" Model info endpoint failed: {response.status_code}")
    except Exception as e:
        print(f" Model info endpoint error: {e}")

def test_food_classes():
    """Test the food classes endpoint"""
    print("\nTesting food classes endpoint...")
    try:
        response = requests.get(f"{API_BASE}/food-classes")
        if response.status_code == 200:
            print("Food classes endpoint working")
            data = response.json()
            print(f"Total classes: {data.get('num_classes')}")
            print(f"First 5 classes: {data.get('classes', [])[:5]}")
        else:
            print(f" Food classes endpoint failed: {response.status_code}")
    except Exception as e:
        print(f" Food classes endpoint error: {e}")

def test_food_detection_with_sample_image():
    """Test food detection with a sample image from the dataset"""
    print("\nTesting food detection endpoint...")
    
    # Look for a sample image in the dataset
    sample_image_path = None
    dataset_path = Path("app/data/Food_Dataset")
    
    # Try to find a test image
    for test_dir in ["test/images", "valid/images", "train/images"]:
        test_path = dataset_path / test_dir
        if test_path.exists():
            for img_file in test_path.glob("*.jpg"):
                sample_image_path = img_file
                break
            if sample_image_path:
                break
    
    if not sample_image_path:
        print("No sample image found in dataset. Skipping detection test.")
        return
    
    print(f"Using sample image: {sample_image_path}")
    
    try:
        with open(sample_image_path, 'rb') as f:
            files = {'file': f}
            
            start_time = time.time()
            response = requests.post(
                f"{API_BASE}/detect-food",
                files=files
            )
            end_time = time.time()
            
        if response.status_code == 200:
            print("Food detection endpoint working")
            data = response.json()
            print(f"Total detections: {data.get('total_detections')}")
            print(f"Inference time: {(end_time - start_time)*1000:.2f}ms")
            
            # Show detections
            detections = data.get('detections', [])
            for i, det in enumerate(detections[:3]):  # Show first 3
                print(f"  Detection {i+1}: {det.get('class_name')} (conf: {det.get('confidence'):.2f})")
                
        else:
            print(f" Food detection endpoint failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f" Food detection endpoint error: {e}")

def test_meal_analysis():
    """Test the meal analysis endpoint"""
    print("\nTesting meal analysis endpoint...")
    
    # Look for a sample image
    sample_image_path = None
    dataset_path = Path("app/data/Food_Dataset")
    
    for test_dir in ["test/images", "valid/images", "train/images"]:
        test_path = dataset_path / test_dir
        if test_path.exists():
            for img_file in test_path.glob("*.jpg"):
                sample_image_path = img_file
                break
            if sample_image_path:
                break
    
    if not sample_image_path:
        print("No sample image found. Skipping meal analysis test.")
        return
    
    try:
        with open(sample_image_path, 'rb') as f:
            files = {'file': f}
            
            response = requests.post(
                f"{API_BASE}/analyze-meal",
                files=files
            )
            
        if response.status_code == 200:
            print("Meal analysis endpoint working")
            data = response.json()
            analysis = data.get('meal_analysis', {})
            print(f"Total food items: {analysis.get('total_food_items')}")
            print(f"Unique food types: {analysis.get('unique_food_types')}")
            
        else:
            print(f" Meal analysis endpoint failed: {response.status_code}")
            
    except Exception as e:
        print(f"Meal analysis endpoint error: {e}")

def run_all_tests():
    """Run all API tests"""
    print("Starting HealthSphere AI Food Detection API Tests")
    print("=" * 60)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print(" Server is not responding. Please start the server first:")
            print("   uvicorn main:app --reload --host 0.0.0.0 --port 8000")
            return
    except:
        print(" Cannot connect to server. Please start the server first:")
        print("   uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        return
    
    # Run tests
    test_health_endpoint()
    test_model_info()
    test_food_classes()
    test_food_detection_with_sample_image()
    test_meal_analysis()
    
    print("\n" + "=" * 60)
    print("API testing completed!")

if __name__ == "__main__":
    run_all_tests()

