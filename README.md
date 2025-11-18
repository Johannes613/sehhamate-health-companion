# SehhaMate: AI-Powered Health & Wellness Platform

<!-- Tech Badges -->
<div align="center">
  <img src="https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React Native Badge">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React Badge">
  <img src="https://img.shields.io/badge/python-%233776AB.svg?style=for-the-badge&logo=python&logoColor=white" alt="Python Badge">
  <img src="https://img.shields.io/badge/fastapi-%23000000.svg?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI Badge">
  <img src="https://img.shields.io/badge/pytorch-%23EE4C2C.svg?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch Badge">
  <img src="https://img.shields.io/badge/opencv-%23white.svg?style=for-the-badge&logo=opencv&logoColor=white" alt="OpenCV Badge">
  <img src="https://img.shields.io/badge/yolov8-%2300FFFF.svg?style=for-the-badge&logo=yolo&logoColor=black" alt="YOLOv8 Badge">
</div>

**SehhaMate** is a comprehensive AI-powered health and wellness platform that combines mobile app technology with advanced machine learning to provide intelligent food analysis, medication safety checks, and personalized health insights. The platform features a React Native mobile app for on-the-go health monitoring and a professional React landing page for user engagement.

## 🌐 Live Links

- **Landing Page**: [https://health-sphere-ai.vercel.app/](https://health-sphere-ai.vercel.app/)
- **Mobile App**: Available on Expo Go

## 📱 Live Preview

<div align="center">
  <img src="https://github.com/user-attachments/assets/4ca8101e-c6a9-4d42-b48e-fe6f2859ad63" width="200" height="500" />
  <img src="https://github.com/user-attachments/assets/681d5104-957e-4499-9a58-bc52cf7ef8ca" width="200" height="500" />
  <img src="https://github.com/user-attachments/assets/c5eced95-479f-4ecd-b666-03035e6e7da0" width="200" height="500" />
  <img src="https://github.com/user-attachments/assets/c3e85460-c58c-435a-a664-ab6cf8d9603e" width="200" height="500" />
</div>

<div align="center">
  <img width="600" height="600" alt="SehhaMate Platform" src="https://github.com/user-attachments/assets/8cdf9282-be7a-400c-9af7-14f05cdd6d8f" />
</div>

## 🏗️ Platform Overview

The platform consists of three main components:

- **Mobile App**: React Native application with AI-powered scanning capabilities
- **Landing Page**: Professional React website showcasing SehhaMate features
- **Backend API**: FastAPI-based machine learning API for food and medication analysis

---

## 🎯 The Problem

- **Food Safety & Nutrition**: Users struggle to identify food items, track nutritional content, and make informed dietary choices.
- **Medication Safety**: Lack of easy access to medication information, potential drug interactions, and dosage warnings.
- **Health Monitoring**: Difficulty in tracking daily health metrics and maintaining wellness routines.
- **Accessibility**: Limited access to professional health guidance and personalized wellness recommendations.

**SehhaMate** addresses these challenges by providing an integrated platform that combines computer vision, machine learning, and user-friendly interfaces to deliver immediate health insights and guidance.

---

## ✨ Core Features

### 1. AI-Powered Food Scanner

- **Real-time Food Detection**: Instantly identify food items using advanced computer vision and machine learning models.
- **Nutritional Analysis**: Comprehensive breakdown of calories, macronutrients, vitamins, and minerals for detected foods.
- **Dietary Tracking**: Monitor daily food intake and maintain nutritional balance with detailed analytics.
- **Smart Recommendations**: AI-powered suggestions for healthier alternatives and meal planning.

### 2. Medication Safety Scanner

- **Medication Identification**: Scan medication packages to instantly access detailed information.
- **Drug Interaction Checker**: Identify potential interactions with other medications and supplements.
- **Dosage Warnings**: Receive important safety information and dosage recommendations.
- **Side Effect Analysis**: Comprehensive overview of potential side effects and precautions.

### 3. Health Chatbot

- **AI-Powered Assistant**: Get instant health-related answers and guidance using OpenAI GPT integration.
- **Personalized Recommendations**: Receive tailored health advice based on your profile and history.
- **Bilingual Support**: Chat in English or Arabic for better accessibility.

### 4. Analytics Dashboard

- **Health Trends**: Track glucose levels, dietary compliance, and allergen exposures over time.
- **Goal Management**: Set and monitor health goals with progress tracking.
- **Insights**: AI-generated insights based on your health data.

---

## 🛠️ Tech Stack

| Component | Technologies Used |
|-----------|------------------|
| **Mobile App** | React Native, Expo, JavaScript, ImagePicker, Firebase |
| **Landing Page** | React.js, Bootstrap 5, CSS3, JavaScript |
| **Backend API** | Python, FastAPI, PyTorch, OpenCV, Ultralytics |
| **Machine Learning** | Computer Vision, YOLO Models, Object Detection |
| **Image Processing** | OpenCV, Pillow, Image Analysis, Feature Extraction |
| **AI Services** | OpenAI GPT-4.1-mini, Custom Knowledge Base |
| **Database** | Firebase Firestore, Firebase Authentication |
| **Deployment** | Render (Backend), Vercel (Frontend), Expo (Mobile) |
| **Version Control** | Git, GitHub |

---

## 🤖 AI Model Performance & Architecture

### Model Performance Metrics

- **Precision**: 86% - High accuracy in food item identification
- **Recall**: Optimized for comprehensive food detection coverage
- **F1-Score**: Balanced performance between precision and recall
- **Inference Speed**: Real-time processing for mobile applications

### Model Test Results

<div align="center">
  <img width="870" height="580" alt="Model Test Results" src="https://github.com/user-attachments/assets/504042b8-a637-4b2a-b4b8-554be40ef43f" />
</div>

### Model Architecture Details

- **Base Model**: Advanced Convolutional Neural Network (CNN) architecture
- **Training Data**: Extensive dataset of food images with nutritional annotations
- **Transfer Learning**: Leverages pre-trained models for enhanced performance
- **Data Augmentation**: Robust training with varied lighting, angles, and conditions
- **Model Optimization**: Quantized for mobile deployment without performance loss

### Technical Specifications

- **Input Resolution**: Supports multiple image resolutions for flexibility
- **Output Classes**: Comprehensive food categorization system
- **Confidence Thresholds**: Configurable detection confidence levels
- **Model Size**: Optimized for mobile deployment and fast inference

### Performance Validation

- **Test Dataset**: Rigorously validated on diverse food categories
- **Cross-Validation**: K-fold validation ensuring model robustness
- **Real-World Testing**: Validated in various lighting and environmental conditions
- **Continuous Improvement**: Regular model updates based on user feedback

---

## 📁 Project Structure

```
sehhamate-health-companion/
├── sehhamate-mobile-app/    # React Native mobile application
│   ├── screens/             # App screens
│   ├── components/          # Reusable components
│   ├── services/            # API and business logic
│   ├── navigation/          # Navigation setup
│   └── contexts/            # React contexts
├── landing-page/            # React landing page
│   ├── src/
│   │   ├── components/      # React components
│   │   └── App.js           # Main app component
│   └── public/              # Static assets
└── backend-api/             # FastAPI backend
    ├── app/
    │   ├── ml/              # Machine learning models
    │   ├── api/             # API endpoints
    │   └── core/            # Core configuration
    ├── main.py              # FastAPI application
    └── requirements.txt     # Python dependencies
```

### Key Components

- **FoodScannerScreen.js**: Core scanning functionality with AI integration
- **MedicationScannerScreen.js**: Medication safety checking and analysis
- **HealthChatbotScreen.js**: AI-powered health assistant
- **AnalyticsDashboardScreen.js**: Health analytics and insights
- **Machine Learning Models**: Food detection and medication analysis algorithms
- **RESTful API**: Secure endpoints for health data processing
- **Responsive UI**: Cross-platform compatible user interfaces

---

## 🚀 Getting Started Locally

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI
- Python 3.8+ (for backend)
- FastAPI, PyTorch, OpenCV, Ultralytics and required Python packages

### Mobile App Setup

1. **Navigate to mobile app directory:**
   ```bash
   cd sehhamate-mobile-app
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `sehhamate-mobile-app` directory:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

4. **Scan QR code with Expo Go app on your device**

### Landing Page Setup

1. **Navigate to landing page directory:**
   ```bash
   cd landing-page
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open http://localhost:3000 in your browser**

### Backend API Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend-api
   pip install -r requirements.txt
   ```

2. **Start the FastAPI server:**
   ```bash
   uvicorn main:app --reload
   # or
   python main.py
   ```

3. **API will be available at http://localhost:8000**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

---

## 🔌 API Endpoints

### Health & Status
- **GET /health** - API health check and status

### Machine Learning
- **POST /api/v1/ml/detect-food** - Food detection and analysis
- **POST /api/v1/ml/analyze-meal** - Comprehensive meal analysis

---

## 📱 Features in Detail

### Food Scanner
- Real-time food recognition using YOLOv8 models
- Detailed nutritional breakdown
- Allergen detection and warnings
- Dietary compliance tracking
- Meal logging and history

### Medication Safety Checker
- Medication package scanning
- Drug interaction analysis
- Dosage and safety information
- Side effects and warnings
- Personalized risk assessment

### Health Chatbot
- OpenAI GPT-4.1-mini integration
- Bilingual support (English/Arabic)
- Context-aware responses
- Health recommendations
- Lab result interpretation

### Analytics Dashboard
- Glucose level trends
- Dietary compliance statistics
- Allergen exposure frequency
- Nutritional breakdowns
- Goal progress tracking
- AI-generated insights

---

## 🔮 Future Enhancements

- **Advanced AI Models**: Enhanced food recognition and nutritional analysis
- **Health Tracking**: Integration with wearable devices and health apps
- **Personalized Recommendations**: AI-driven health and wellness coaching
- **Community Features**: User forums and health challenge systems
- **Professional Integration**: Healthcare provider partnerships and telemedicine features
- **Voice Interaction**: Voice commands for hands-free operation
- **Offline Mode**: Core features available without internet connection

---

## 🤝 Contributing

We welcome contributions to SehhaMate! Please feel free to submit issues, feature requests, or pull requests to help improve the platform.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is part of a university course project (SWE401 - Software Engineering) with Dr. Murad Al-Rajab

---

## 👥 Authors

- **Yohannis Adamu Biniam Negash** - [GitHub](https://github.com/Johannes613)

---



