# SehhaMate Health Companion

A comprehensive health management platform designed to help users manage their diabetes, track nutrition, monitor medications, and maintain a healthy lifestyle. The platform consists of a mobile application, backend API, and landing page.

## 🏗️ Project Structure

```
sehhamate-health-companion/
├── backend-api/          # FastAPI backend service
├── landing-page/         # React landing page
└── sehhamate-mobile-app/ # React Native mobile application
```

## 📱 Mobile Application (sehhamate-mobile-app)

A React Native mobile application built with Expo that provides comprehensive health management features.

### Features

- **Food Scanner**: AI-powered food recognition and nutrition analysis
- **Medication Safety Checker**: Medication identification and interaction analysis
- **Health Chatbot**: AI-powered health assistant with OpenAI integration
- **Analytics Dashboard**: Comprehensive health analytics and insights
- **Activity Tracking**: Track physical activities and exercise
- **Nutrition Logging**: Log meals and track daily nutrition
- **Goal Management**: Set and track health goals
- **Profile Management**: Personalized user profiles with health information

### Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: React Context API
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **AI Services**: OpenAI (GPT-4.1-mini)
- **UI Components**: Custom components with React Native

### Getting Started

1. **Install Dependencies**
   ```bash
   cd sehhamate-mobile-app
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the `sehhamate-mobile-app` directory:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. **Run the Application**
   ```bash
   npm start
   # or
   npm run android  # for Android
   npm run ios      # for iOS
   npm run web      # for web
   ```

### Key Dependencies

- `expo`: ^54.0.24
- `react-native`: 0.76.5
- `@react-navigation/native`: ^6.1.18
- `firebase`: ^11.1.0
- `expo-image-picker`: ~16.0.4
- `expo-linear-gradient`: ~14.0.1
- `react-native-chart-kit`: ^6.12.0

## 🔧 Backend API (backend-api)

A FastAPI-based backend service that provides food detection and analysis capabilities using YOLOv8 machine learning models.

### Features

- **Food Detection**: YOLOv8-based food recognition
- **Nutrition Analysis**: Detailed nutrition information for detected foods
- **RESTful API**: Clean API endpoints for mobile app integration

### Tech Stack

- **Framework**: FastAPI
- **ML Model**: YOLOv8 (Ultralytics)
- **Image Processing**: OpenCV, Pillow
- **Deployment**: Docker, Render.com

### Getting Started

1. **Install Dependencies**
   ```bash
   cd backend-api
   pip install -r requirements.txt
   ```

2. **Run the Server**
   ```bash
   python main.py
   # or
   uvicorn main:app --reload
   ```

3. **API Documentation**
   Once the server is running, visit:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Key Dependencies

- `fastapi`: 0.103.1
- `uvicorn`: ASGI server
- `ultralytics`: YOLOv8 models
- `opencv-python`: Image processing
- `torch`: PyTorch for ML models

## 🌐 Landing Page (landing-page)

A modern, responsive landing page built with React to showcase the SehhaMate Health Companion platform.

### Features

- **Responsive Design**: Mobile-first approach
- **Modern UI**: Bootstrap 5 styling
- **Interactive Components**: React-based interactive elements

### Tech Stack

- **Framework**: React
- **Styling**: Bootstrap 5
- **Icons**: React Icons

### Getting Started

1. **Install Dependencies**
   ```bash
   cd landing-page
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🔐 Environment Variables

### Mobile App (.env)
```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

### Backend API
Create a `.env` file in the `backend-api` directory if needed for additional configuration.

## 📦 Deployment

### Mobile App
The mobile app can be built and deployed using Expo Application Services (EAS):
```bash
cd sehhamate-mobile-app
eas build --platform android
eas build --platform ios
```

### Backend API
The backend API can be deployed using Docker or directly to Render.com. See `backend-api/DEPLOYMENT_GUIDE.md` for detailed instructions.

### Landing Page
The landing page can be deployed to any static hosting service (Netlify, Vercel, etc.):
```bash
cd landing-page
npm run build
# Deploy the 'build' directory
```

## 🧪 Testing

### Mobile App
```bash
cd sehhamate-mobile-app
npm test
```

### Backend API
```bash
cd backend-api
pytest tests/
```

## 📝 Project Requirements

This project implements the following functional requirements:

- **FR-2.1**: Food Scanner with AI-powered recognition
- **FR-2.2**: Medication Safety Checker
- **FR-2.3**: Health Chatbot with AI integration
- **FR-2.4**: Scan History Management
- **FR-5.1**: Analytics Dashboard
- **FR-5.2**: Nutritional Breakdowns
- **FR-5.3**: Goal Management
- **FR-5.4**: Alert System

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is part of a university course project (SWE401 - Software Engineering).

## 👥 Authors

- **Yohannis Biniam** - [GitHub](https://github.com/Johannes613)

## 🙏 Acknowledgments

- Expo team for the excellent React Native framework
- FastAPI for the robust backend framework
- Firebase for backend services
- OpenAI for AI capabilities
- Ultralytics for YOLOv8 models

## 📞 Contact

For questions or support, please open an issue in the repository.

---

**Note**: This is an academic project developed for SWE401 - Software Engineering course.
