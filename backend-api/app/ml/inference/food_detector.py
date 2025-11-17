from ultralytics import YOLO
import cv2
import numpy as np
from typing import List, Dict
import yaml
import os

class FoodDetector:
    def __init__(self, model_path: str = "app/ml/models/best.pt"):
        """Initialize the YOLOv8 food detection model"""
        self.model = YOLO(model_path)
        self.confidence_threshold = 0.25
        self.iou_threshold = 0.5
        
        # Load class names from dataset config (fallback to model names if available)
        dataset_config_path = "app/ml/models/dataset.yaml"
        if os.path.exists(dataset_config_path):
            try:
                with open(dataset_config_path, 'r') as f:
                    config = yaml.safe_load(f)
                    self.class_names = config.get('names', [])
                    print(f"Loaded {len(self.class_names)} class names from dataset config")
            except Exception as e:
                print(f"Error loading dataset config: {e}")
                self.class_names = []
        else:
            self.class_names = []
        
        # If dataset config failed, try to get names from the model
        if not self.class_names and hasattr(self.model, 'names') and self.model.names:
            self.class_names = list(self.model.names.values())
            print(f"Loaded {len(self.class_names)} class names from model")
        
        # Final fallback - hardcoded class names from your dataset
        if not self.class_names:
            self.class_names = [
                'baby corn', 'bean sprout', 'black glutinous rice', 'boiled egg', 'brocoli',
                'cabbage', 'carrot', 'chicken breast', 'chicken leg', 'corn', 'cucumber',
                'dark green leaf vegetable', 'fried chicken', 'fried egg', 'fried tofu',
                'green bean', 'green pepper', 'oily tofu', 'okra', 'pork chop', 'rice',
                'salmon', 'sausage', 'scrambled eggs with tomatoes', 'shred chicken',
                'shrimp', 'shrimp roll', 'stewed pork', 'sweet potato', 'tomato'
            ]
            print(f"Using hardcoded class names: {len(self.class_names)} classes")
        
        print(f"Final class names: {self.class_names}")

    def detect_food_items(self, image_path: str) -> List[Dict]:
        """Detect food items in an image file"""
        try:
            results = self.model(image_path, conf=self.confidence_threshold, iou=self.iou_threshold)
            
            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = float(box.conf[0].cpu().numpy())
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        # Get class name safely
                        if class_id < len(self.class_names):
                            class_name = self.class_names[class_id]
                        else:
                            class_name = f"class_{class_id}"
                        
                        detection = {
                            'class_id': class_id,
                            'class_name': class_name,
                            'confidence': confidence,
                            'bbox': [float(x1), float(y1), float(x2), float(y2)],
                            'area': float((x2 - x1) * (y2 - y1))
                        }
                        detections.append(detection)
            
            print(f"Detected {len(detections)} items: {[d['class_name'] for d in detections]}")
            return detections
            
        except Exception as e:
            print(f"Detection error: {e}")
            return []

    def detect_from_bytes(self, image_bytes: bytes) -> List[Dict]:
        """Detect food items from image bytes (for API uploads)"""
        import io
        from PIL import Image
        
        print(f"Starting detection from {len(image_bytes)} bytes of image data")
        
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            print(f"Image opened successfully: {image.size} {image.mode}")
            
            # Save temporarily and run detection
            temp_path = "temp_image.jpg"
            image.save(temp_path)
            print(f"Image saved to temp file: {temp_path}")
            
            try:
                print("Running YOLOv8 detection...")
                detections = self.detect_food_items(temp_path)
                print(f"Detection completed. Found {len(detections)} items")
                return detections
            finally:
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    print(f"Temp file cleaned up: {temp_path}")
                    
        except Exception as e:
            print(f"Error in detect_from_bytes: {e}")
            import traceback
            traceback.print_exc()
            return []

    def get_model_info(self) -> Dict:
        """Get model information and configuration"""
        return {
            "model_name": "HealthSphere_Food_Detection_v1",
            "framework": "YOLOv8",
            "num_classes": len(self.class_names),
            "confidence_threshold": self.confidence_threshold,
            "iou_threshold": self.iou_threshold,
            "supported_formats": ["JPG", "PNG", "JPEG"],
            "class_names": self.class_names
        }


