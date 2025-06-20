# resume-site.md

> AI-Powered Resume Website Builder Through Voice Conversation

**Built for the [Bolt.new Hackathon](https://hackathon.dev) 🚀**

Transform your career story into a professional resume website through natural conversation. No forms, no templates—just talk about your experience and get a modern, responsive website ready to deploy.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.1-blue.svg)

## 🎯 What It Does

resume-site.md revolutionizes resume creation by replacing tedious forms with intelligent conversation. Users speak naturally about their career while AI extracts, analyzes, and formats their information into comprehensive website instructions.

### The Magic ✨

1. **Voice-First Interview**: Natural conversation about your career
2. **AI Analysis**: GPT-4 powered extraction and professional writing
3. **Website Generation**: Complete design brief for modern resume sites
4. **One-Click Deploy**: Ready to paste into Bolt.new or any AI builder

## 🚀 Features

### 🎤 **Intelligent Voice Interface**
- Real-time speech recognition with visual feedback
- Adaptive conversation flow based on responses
- Text input fallback for accessibility
- Smart auto-submission with pause detection

### 🤖 **AI-Powered Processing**
- OpenAI GPT-4 integration for natural language understanding
- Structured data extraction from conversational input
- Professional achievement summarization
- Career progression analysis

### 📱 **Modern Design System**
- Dark-mode interface with smooth animations
- Responsive design for all devices
- Professional UI components with micro-interactions
- Apple-level design aesthetics

### 🔒 **Privacy & Security**
- Local API key encryption with CryptoJS
- Fresh session on every reload
- No data persistence between sessions
- Secure OpenAI API communication

### 🎨 **Professional Output**
- Complete website design specifications
- Modern, responsive layout requirements
- Dark/light mode toggle functionality
- SEO and performance optimizations

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **AI**: OpenAI GPT-4 API integration
- **Speech**: Web Speech API (Recognition & Synthesis)
- **Security**: CryptoJS for local encryption
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build**: Vite

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/resume-site-md.git
cd resume-site-md

# Install dependencies
npm install

# Start development server
npm run dev
```

### Setup

1. Open the application in your browser
2. Enter your OpenAI API key (stored locally and encrypted)
3. Click the microphone and start talking about your career!

## 🎯 How It Works

### 1. **Conversational Interview**
The AI conducts a structured interview covering:
- Personal information (name, email, LinkedIn)
- LinkedIn profile data parsing
- Career objectives and goals
- Detailed work experience discussion

### 2. **Intelligent Processing**
- Real-time conversation analysis
- Structured data extraction
- Professional achievement formatting
- Career story synthesis

### 3. **Website Generation**
Produces a comprehensive design brief including:
- Complete content structure
- Modern design specifications
- Technical requirements
- Responsive layout guidelines

### 4. **Deploy Ready**
The output is optimized for:
- Bolt.new (primary target)
- Any AI website builder
- Manual development
- CMS integration

## 📋 Interview Flow

```
Welcome → Email → LinkedIn → LinkedIn Data → Career Goals → Work Experience → Website Ready
```

Each step uses adaptive AI to:
- Ask relevant follow-up questions
- Extract structured information
- Validate and format data
- Progress naturally through the flow

## 🎨 Design Philosophy

### Voice-First Experience
- Natural conversation over form filling
- Visual feedback for speech recognition
- Smooth transitions between speaking and listening
- Accessible text input alternatives

### Professional Aesthetics
- Dark-mode interface with high contrast
- Smooth animations and micro-interactions
- Apple-inspired design language
- Consistent spacing and typography

### AI-Human Collaboration
- AI handles data processing and formatting
- Human provides authentic career stories
- Collaborative refinement of content
- Professional output generation

## 🔧 Configuration

### Environment Variables
```env
# OpenAI API key is entered through the UI and stored locally
# No environment variables required for basic operation
```

### Customization
- Modify interview steps in `src/config/interviewSteps.ts`
- Adjust design tokens in `src/design/tokens.ts`
- Customize AI prompts in `src/hooks/useOpenAI.ts`

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── voice/           # Voice interface components
│   ├── ui/              # Reusable UI components
│   └── VoiceAgent.tsx   # Main application component
├── hooks/               # Custom React hooks
├── config/              # Interview configuration
├── types/               # TypeScript definitions
└── utils/               # Utility functions
```

### Key Hooks
- `useApiKey`: Secure API key management
- `useSpeechRecognition`: Voice input handling
- `useSpeechSynthesis`: AI voice responses
- `useOpenAI`: GPT-4 integration
- `useStepController`: Interview flow management

## 🎪 Hackathon Context

Built for the **Bolt.new Hackathon** at [hackathon.dev](https://hackathon.dev), this project showcases:

### Innovation
- Voice-first approach to resume building
- AI-powered career story extraction
- Modern web presence over traditional PDFs

### Technical Excellence
- Advanced React patterns and hooks
- Real-time speech processing
- Secure API integration
- Professional design system

### User Experience
- Conversational interface design
- Smooth animations and feedback
- Accessibility considerations
- Mobile-responsive layout

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bolt.new** for inspiring the hackathon and providing the deployment platform
- **OpenAI** for the powerful GPT-4 API
- **Vercel** for the excellent development experience
- **Tailwind CSS** for the utility-first styling approach

## 🔗 Links

- **Live Demo**: [resume-site.md](https://your-demo-url.com)
- **Hackathon**: [hackathon.dev](https://hackathon.dev)
- **Bolt.new**: [bolt.new](https://bolt.new)

---

**Built with ❤️ for the Bolt.new Hackathon**

*Transform your career story into a professional website through the power of conversation and AI.*