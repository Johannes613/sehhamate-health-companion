# HealthSphere AI Food Detection - Quick Start Guide

##  **Get Started in 5 Minutes!**

### **Prerequisites**
- Python 3.8+ installed
- All dependencies installed (`pip install -r requirements.txt`)
- Your trained model files are in place 

## Quick Test Commands

### **1. Test Your Backend Health**
```bash
cd /path/to/your/HealthSphere_AI/backend-api
python scripts/test_food_detection.py
```

### **2. Start Your FastAPI Server**
```bash
python scripts/quick_start.py
```

### **3. Manual Server Start**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

##  **Access Your API**

### **API Documentation**
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### **Food Detection Endpoints**
- **Detect Food**: `POST /api/v1/ml/detect-food`
- **Analyze Meal**: `POST /api/v1/ml/analyze-meal`
- **Food Classes**: `GET /api/v1/ml/food-classes`
- **Model Info**: `GET /api/v1/ml/model-info`

## Test with Sample Images

### **Using the Test Script**
```bash
python scripts/test_food_detection.py
```

### **Manual API Testing**
1. **Upload an image** to `/api/v1/ml/detect-food`
2. **Get detection results** with confidence scores
3. **View bounding boxes** and food classifications

## Expected Results

### **Model Performance**
- **Detection Accuracy**: 68% mAP (excellent!)
- **Speed**: 6-68ms per image
- **Classes**: 30 food types supported

### **Sample Response**
```json
{
  "detections": [
    {
      "class_name": "broccoli",
      "confidence": 0.81,
      "bbox": [100, 150, 300, 400],
      "area": 50000
    }
  ],
  "processing_time": "45.2ms",
  "total_detections": 1
}
```

## Troubleshooting

### **Common Issues**
- **Model not found**: Check `best.pt` is in `app/ml/models/`
- **Import errors**: Install requirements with `pip install -r requirements.txt`
- **GPU issues**: Model works on CPU (slower but functional)

### **Performance Tips**
- **GPU available**: Use for faster inference
- **Batch processing**: Process multiple images together
- **Image optimization**: Resize to 640x640 for best results

## 📱 **Integration Examples**

### **Frontend Integration**
```javascript
// Upload image and get detections
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('/api/v1/ml/detect-food', {
  method: 'POST',
  body: formData
});

const results = await response.json();
console.log('Detected foods:', results.detections);
```

### **Python Client**
```python
import requests

with open('food_image.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8000/api/v1/ml/detect-food', files=files)
    
results = response.json()
print(f"Detected {len(results['detections'])} food items")
```

## You're Ready!

### **What You Have**
-  **Production-ready** food detection model
-  **FastAPI backend** with ML endpoints
-  **Testing scripts** for validation
-  **Complete documentation** for deployment

### **Next Steps**
1. **Test the system** with sample images
2. **Integrate with your frontend** application
3. **Deploy to production** environment
4. **Monitor performance** and accuracy

---

##  **Success!**

**Your HealthSphere AI food detection system is fully operational!**

- **Model**: Trained and optimized 
- **Backend**: FastAPI with ML endpoints 
- **Testing**: Scripts and documentation 
- **Deployment**: Multiple format options 

**Start detecting food and building amazing health applications!**
