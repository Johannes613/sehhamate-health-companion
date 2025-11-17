# HealthSphere AI Backend - Deployment Guide

## Overview
This guide will walk you through deploying your HealthSphere AI backend to Render, a cloud platform that supports Python applications and provides easy deployment for ML models.

## Prerequisites
- GitHub account with your HealthSphere AI project
- Render account (free tier available)
- Trained YOLOv8 model files in `app/ml/models/`

## Step 1: Prepare Your Repository

### 1.1 Ensure Model Files Are Present
Make sure these files exist in your repository:
```
app/ml/models/
├── best.pt                    # Your trained YOLOv8 model
├── dataset.yaml              # Dataset configuration
├── model_info.yaml           # Model metadata
└── exported_models/          # Exported model formats
```

### 1.2 Commit and Push Your Changes
```bash
git add .
git commit -m "Prepare for deployment: Add Dockerfile, render.yaml, and configuration"
git push origin main
```

## Step 2: Deploy to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email address

### 2.2 Connect Your Repository
1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub account if not already connected
4. Select your HealthSphere AI repository
5. Click "Connect"

### 2.3 Configure Your Service

#### Basic Settings:
- **Name**: `healthsphere-ai-backend`
- **Environment**: `Python 3`
- **Region**: Choose closest to your users
- **Branch**: `main`

#### Build & Deploy Settings:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Plan**: Start with `Starter` (free tier)

#### Environment Variables:
Click "Advanced" and add these environment variables:
```
ENVIRONMENT=production
DEBUG=false
PORT=8000
```

### 2.4 Deploy
1. Click "Create Web Service"
2. Render will automatically start building your application
3. Monitor the build logs for any errors
4. Wait for deployment to complete (usually 5-10 minutes)

## Step 3: Verify Deployment

### 3.1 Check Service Status
- In Render dashboard, your service should show "Live" status
- Note the generated URL (e.g., `https://healthsphere-ai-backend.onrender.com`)

### 3.2 Test Your API
```bash
# Test health endpoint
curl https://your-app-name.onrender.com/health

# Test model info
curl https://your-app-name.onrender.com/api/v1/ml/model-info

# Test food classes
curl https://your-app-name.onrender.com/api/v1/ml/food-classes
```

### 3.3 Test Image Upload
```python
import requests

# Test food detection
with open('test_image.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post(
        'https://your-app-name.onrender.com/api/v1/ml/detect-food',
        files=files
    )
    print(response.json())
```

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain
1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain (e.g., `api.healthsphere.ai`)
4. Update DNS records as instructed by Render

## Step 5: Monitor and Scale

### 5.1 Monitor Performance
- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Monitor response times and error rates
- **Health Checks**: Automatic health monitoring at `/health`

### 5.2 Scale Your Service
- **Free Tier**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Paid Plans**: Always-on, better performance, custom domains
- **Auto-scaling**: Available on paid plans

## Troubleshooting

### Common Issues:

#### 1. Build Failures
```bash
# Check requirements.txt for compatibility
# Ensure all dependencies are listed
# Check Python version compatibility
```

#### 2. Model Loading Errors
```bash
# Verify model files are committed to repository
# Check file paths in FoodDetector class
# Ensure model files are not too large (>100MB)
```

#### 3. Memory Issues
```bash
# YOLOv8 models can be memory-intensive
# Consider using smaller model variants
# Upgrade to paid plan for more resources
```

#### 4. Cold Start Delays
```bash
# Free tier has 15-minute sleep timer
# First request after sleep will be slower
# Consider paid plan for always-on service
```

## Performance Optimization

### 1. Model Optimization
```python
# In FoodDetector class, consider:
- Using ONNX format for faster inference
- Implementing model caching
- Adding request queuing for high traffic
```

### 2. Caching Strategy
```python
# Implement Redis caching for:
- Model predictions
- Food class information
- API responses
```

### 3. CDN Integration
- Use Cloudflare or similar for static assets
- Cache API responses at edge locations
- Reduce latency for global users

## Security Considerations

### 1. Environment Variables
- Never commit sensitive data to repository
- Use Render's environment variable system
- Rotate API keys regularly

### 2. API Rate Limiting
```python
# Consider implementing rate limiting:
- Per-user limits
- Per-endpoint limits
- DDoS protection
```

### 3. Input Validation
- Validate all uploaded images
- Implement file size limits
- Check file types and content

## Cost Management

### Free Tier Limits:
- 750 hours/month
- 15-minute sleep timer
- Limited bandwidth
- Basic support

### Paid Plans:
- **Starter**: $7/month - Always on, custom domains
- **Standard**: $25/month - Better performance, auto-scaling
- **Pro**: $50/month - High performance, priority support

## Next Steps

### 1. Production Monitoring
- Set up logging aggregation (e.g., Logtail, Papertrail)
- Implement error tracking (e.g., Sentry)
- Set up performance monitoring

### 2. CI/CD Pipeline
- Automate testing before deployment
- Set up staging environment
- Implement blue-green deployments

### 3. Backup Strategy
- Regular database backups
- Model version management
- Configuration backups

## Support Resources

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **FastAPI Documentation**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **YOLOv8 Documentation**: [docs.ultralytics.com](https://docs.ultralytics.com)
- **Render Community**: [community.render.com](https://community.render.com)

---

**Congratulations!** Your HealthSphere AI backend is now deployed and accessible worldwide. Users can upload food images and get real-time AI-powered analysis through your API endpoints.
