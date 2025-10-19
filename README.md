# JengaV - Live Conversation Skill Coach

<div align="center">
  <img width="1200" height="475" alt="JengaV Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<p align="center">
  <strong>An AI-driven coach that provides real-time feedback on your speech, tone, and posture during live conversations, interviews, and presentations.</strong>
</p>

## 🎯 What is JengaV?

JengaV is an intelligent conversation skill coach that uses cutting-edge AI to help you become a more confident and effective communicator. Whether you're preparing for job interviews, delivering presentations, negotiating deals, or just want to improve your everyday conversations, JengaV provides personalized, real-time feedback to help you:

- **Eliminate filler words** (um, uh, like, you know)
- **Strengthen your language** with more assertive and confident phrasing
- **Improve your posture and body language**
- **Analyze your tone and delivery**
- **Track your progress** over time with detailed session summaries

## Members
- Omarion Dunkley: Omariondunkley7@gmail.com
- Shania Laird: sha13laird07@gmail.com
- Elizabeth Saddler: lizygifted4lyfe@gmail.com

## ✨ Key Features

### 🎙️ Multiple Categories
- **Interview** - Master job interviews with confidence
- **Presentation** - Deliver compelling presentations
- **Negotiations** - Excel in high-stakes discussions
- **Feedback Coach** - General conversation skill improvement

### 🔧 Session Modes
- **Audio Only** - Focus purely on speech analysis
- **With Video** - Include posture and facial expression analysis
- **Demo Mode** - Practice with pre-recorded scenarios

### 🤖 AI-Powered Analysis
- **Real-time speech analysis** using advanced natural language processing
- **Computer vision** for posture and body language feedback
- **Tone analysis** for emotional intelligence insights
- **Pronunciation scoring** and feedback
- **Smart nudges** during conversations to improve in real-time

### 📊 Comprehensive Scoring
- **Overall communication score** (0-100)
- **Strong word usage** tracking
- **Weak word identification** and suggestions
- **Filler word detection** and alternatives
- **Session summaries** with actionable improvements

### 📱 User Experience
- **Intuitive interface** with beautiful gradients and smooth animations
- **Session history** to track your improvement over time
- **Onboarding tutorials** for each mode
- **Firebase authentication** for secure data storage
- **Cross-platform compatibility**

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Gemini API Key** from Google AI Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd jengav-live-conversation-skill-coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` and start improving your conversation skills!

## 🏗️ Technical Architecture

### Frontend
- **React 19** with TypeScript for type-safe development
- **Vite** for fast build tooling and development experience
- **Tailwind CSS** for responsive, modern UI design
- **Custom component library** for consistent design system

### AI & Analysis
- **MediaPipe** for computer vision and facial expression analysis
- **Google Generative AI** for intelligent conversation feedback
- **Custom scoring algorithms** for speech analysis
- **Real-time audio processing** for live feedback

### Backend & Storage
- **Firebase Authentication** for secure user management
- **Firestore** for session data and user progress tracking
- **Real-time data synchronization** across devices

### Key Technologies
```typescript
// Core dependencies
"react": "^19.2.0"
"firebase": "^12.4.0"
"@mediapipe/tasks-vision": "^0.10.22-rc.20250304"
"@google/genai": "^1.25.0"
```

## 📋 Usage Guide

### Getting Started
1. **Sign up/Login** with your email address
2. **Complete the onboarding** tutorial for your preferred mode
3. **Select a category** (Interview, Presentation, etc.)
4. **Choose your session mode** (Audio only, With video, Demo)
5. **Start practicing** and receive real-time feedback!

### During a Session
- **Green highlights** indicate strong, confident language
- **Red highlights** show weak words or filler words to avoid
- **Real-time scores** update as you speak
- **Posture feedback** appears when using video mode
- **Tone analysis** helps you understand emotional delivery

### After a Session
- **Detailed scoring breakdown** with specific metrics
- **Personalized improvement suggestions**
- **Session transcript** with highlighted analysis
- **Progress tracking** over multiple sessions

## 🎛️ Configuration

### API Keys
The app requires a Gemini API key for AI-powered analysis:

1. Get your API key from [Google AI Studio](https://ai.google.dev/)
2. Add it to `.env.local`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### Firebase Configuration
Firebase is pre-configured, but you may need to:
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Update the Firebase config in `src/firebase/config.ts`

## 🛠️ Development

### Project Structure
```
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Main app screens
│   ├── firebase/           # Firebase configuration
│   ├── lib/               # Utility functions and scoring logic
│   └── types.ts           # TypeScript type definitions
├── public/                # Static assets
└── metadata.json         # App metadata
```

### Key Files
- **`lib/scoring.ts`** - Core speech analysis algorithms
- **`types.ts`** - TypeScript definitions for the app
- **`screens/SessionScreen.tsx`** - Main conversation interface
- **`firebase/`** - Authentication and data storage

### Building for Production
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 📱 Features in Detail

### Speech Analysis
- **Strong words detection**: "I will", "The solution is", "I recommend"
- **Weak words identification**: "I think", "Maybe", "I guess"
- **Filler word tracking**: "um", "uh", "like", "you know"
- **Pronunciation scoring** based on clarity and articulation

### Visual Feedback
- **Real-time highlights** during speech
- **Posture analysis** using computer vision
- **Facial expression tracking** for emotional intelligence
- **Body language suggestions** for better presence

### Progress Tracking
- **Session history** with detailed metrics
- **Improvement trends** over time
- **Personalized feedback** based on your patterns
- **Achievement system** for motivation

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code style
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is private and proprietary. All rights reserved.

## 🙏 Acknowledgments

- **Google AI Studio** for the Gemini API
- **MediaPipe** for computer vision capabilities
- **Firebase** for backend services
- **React** and the open-source community

## 📞 Support

For support and questions:
- Check the [Issues](../../issues) page for known problems
- Create a new issue for bugs or feature requests
- Contact the development team for technical questions

---

<div align="center">
  <p><strong>Start your journey to better communication today with JengaV!</strong></p>
  <p>Made with ❤️ for better conversations</p>
</div>
