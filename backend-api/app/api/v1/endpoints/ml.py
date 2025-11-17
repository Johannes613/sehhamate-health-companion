from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.ml.inference.food_detector import FoodDetector
import os
import uuid
from typing import List, Dict

router = APIRouter()
food_detector = FoodDetector()

@router.post("/detect-food")
async def detect_food_in_image(file: UploadFile = File(...)):
    """Detect food items in uploaded image"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Run food detection
        detections = food_detector.detect_from_bytes(image_bytes)
        
        # Prepare response
        response = {
            "success": True,
            "image_filename": file.filename,
            "total_detections": len(detections),
            "detections": detections,
            "model_info": {
                "model_name": "HealthSphere_Food_Detection_v1",
                "confidence_threshold": food_detector.confidence_threshold,
                "num_classes": len(food_detector.class_names)
            }
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

@router.get("/food-classes")
async def get_food_classes():
    """Get list of supported food classes"""
    return {
        "success": True,
        "num_classes": len(food_detector.class_names),
        "classes": food_detector.class_names
    }

@router.get("/model-info")
async def get_model_info():
    """Get model information and performance metrics"""
    return {
        "success": True,
        "model_name": "HealthSphere_Food_Detection_v1",
        "framework": "YOLOv8",
        "num_classes": len(food_detector.class_names),
        "confidence_threshold": food_detector.confidence_threshold,
        "supported_formats": ["JPG", "PNG", "JPEG"]
    }

@router.post("/analyze-meal")
async def analyze_complete_meal(file: UploadFile = File(...)):
    """Analyze a complete meal image with multiple food items"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Run food detection
        detections = food_detector.detect_from_bytes(image_bytes)
        
        # Analyze meal composition
        meal_analysis = {
            "total_food_items": len(detections),
            "unique_food_types": len(set(det['class_name'] for det in detections)),
            "food_distribution": {},
            "confidence_summary": {
                "high_confidence": len([d for d in detections if d['confidence'] > 0.7]),
                "medium_confidence": len([d for d in detections if 0.5 <= d['confidence'] <= 0.7]),
                "low_confidence": len([d for d in detections if d['confidence'] < 0.5])
            }
        }
        
        # Count food types
        for detection in detections:
            food_type = detection['class_name']
            if food_type in meal_analysis['food_distribution']:
                meal_analysis['food_distribution'][food_type] += 1
            else:
                meal_analysis['food_distribution'][food_type] = 1
        
        response = {
            "success": True,
            "image_filename": file.filename,
            "detections": detections,
            "meal_analysis": meal_analysis,
            "model_info": food_detector.get_model_info()
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Meal analysis failed: {str(e)}")

@router.get("/debug-model")
async def debug_model():
    """Debug endpoint to check model loading and class names"""
    try:
        return {
            "success": True,
            "model_loaded": food_detector.model is not None,
            "class_names_count": len(food_detector.class_names),
            "class_names": food_detector.class_names,
            "confidence_threshold": food_detector.confidence_threshold,
            "model_info": food_detector.get_model_info()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "model_loaded": False
        }

@router.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {
        "success": True,
        "status": "healthy",
        "timestamp": "2025-08-10T21:16:00Z",
        "model_loaded": food_detector.model is not None
    }

@router.post("/test-upload")
async def test_upload(file: UploadFile = File(...)):
    """Test endpoint to check if file upload is working"""
    try:
        # Just read the file and return basic info
        image_bytes = await file.read()
        return {
            "success": True,
            "filename": file.filename,
            "content_type": file.content_type,
            "file_size": len(image_bytes),
            "message": "File upload test successful"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload test failed: {str(e)}")


