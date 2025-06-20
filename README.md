# resume-site.md

> AI-Powered Resume Website Instructions Generator Through Voice Conversation

**Built for the [Bolt.new Hackathon](https://hackathon.dev) 🚀**

Transform your career story into comprehensive website building instructions through natural conversation. Talk about your experience, get detailed instructions, then paste them into [Bolt.new](https://bolt.new) to build your professional resume website.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.1-blue.svg)

## 🎯 What It Does

resume-site.md revolutionizes resume website creation by generating comprehensive building instructions through intelligent conversation. Instead of building the website directly, it creates detailed specifications that you paste into [Bolt.new](https://bolt.new) to generate your professional resume site.

### The Process ✨

1. **Voice Interview**: Natural conversation about your career
2. **AI Analysis**: GPT-4 powered extraction and professional formatting
3. **Instructions Generation**: Complete design brief with all content and specifications
4. **Copy & Paste**: Take the instructions to [Bolt.new](https://bolt.new) and watch your website come to life

## 🔄 How The Workflow Works

```
resume-site.md → Generate Instructions → Bolt.new → Your Resume Website
```

### Step 1: Generate Instructions
- Have a conversation about your career with our AI
- AI extracts and formats your professional information
- Receive comprehensive website building instructions

### Step 2: Build with Bolt.new
- Copy the generated instructions
- Paste them into [Bolt.new](https://bolt.new)
- Watch Bolt's AI build your professional resume website
- Deploy instantly to the web

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

### 📋 **Comprehensive Instructions Output**
- Complete website content structure
- Modern design specifications (dark mode, responsive, animations)
- Technical requirements and best practices
- SEO and performance optimization guidelines
- Ready-to-paste format for Bolt.new

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
- Access to [Bolt.new](https://bolt.new) for building the final website

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

### Usage

1. **Generate Instructions**:
   - Open the application in your browser
   - Enter your OpenAI API key (stored locally and encrypted)
   - Click the microphone and start talking about your career
   - Complete the voice interview process
   - Download the generated website instructions

2. **Build Your Website**:
   - Open [Bolt.new](https://bolt.new) in a new tab
   - Paste the instructions into Bolt's input field
   - Watch Bolt's AI build your professional resume website
   - Deploy and share your new resume site!

## 🎯 What Gets Generated

The app produces a comprehensive markdown document containing:

### Content Structure
- Personal information and contact details
- Professional summary and career objectives
- Detailed work experience with achievements
- Education and certifications
- Technical skills and competencies

### Design Specifications
- Modern, minimalistic design requirements
- Dark mode with light mode toggle
- Responsive layout for all devices
- Professional color schemes and typography
- Animation and interaction guidelines

### Technical Requirements
- React + Tailwind CSS recommendations
- SEO optimization specifications
- Performance requirements
- Accessibility considerations
- Mobile-first responsive design

### Example Output
```markdown
# Build a Resume Website for John Smith

We are building a professional resume website for John Smith, a Senior Software Engineer...

## Personal Information
- Name: John Smith
- Email: john@example.com
- LinkedIn: https://linkedin.com/in/johnsmith

## Design Requirements
Create a modern, minimalistic, and professional resume website with a strong emphasis on clarity...
```

## 📋 Interview Flow

```
Welcome → Email → LinkedIn → LinkedIn Data → Career Goals → Work Experience → Instructions Ready
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

### Instructions-Focused Output
- Comprehensive specifications for AI builders
- Optimized for Bolt.new's AI capabilities
- Clear, actionable design requirements
- Professional content formatting

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
- Update output format in `src/utils/resumeGenerator.ts`

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
└── utils/               # Utility functions (including resumeGenerator)
```

### Key Files
- `resumeGenerator.ts`: Converts interview data to website instructions
- `interviewSteps.ts`: Defines the conversation flow
- `useOpenAI.ts`: Handles AI conversation and data extraction

## 🎪 Hackathon Context

Built for the **Bolt.new Hackathon** at [hackathon.dev](https://hackathon.dev), this project showcases:

### Innovation
- Voice-first approach to resume building
- AI-powered career story extraction
- Perfect integration with Bolt.new's AI website builder
- Instructions-based workflow for maximum flexibility

### Technical Excellence
- Advanced React patterns and hooks
- Real-time speech processing
- Secure API integration
- Professional design system

### Bolt.new Integration
- Optimized output format for Bolt's AI
- Comprehensive design specifications
- Ready-to-paste instructions
- Seamless workflow from conversation to website

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

- **Bolt.new** for inspiring the hackathon and providing the perfect deployment platform
- **OpenAI** for the powerful GPT-4 API
- **Vercel** for the excellent development experience
- **Tailwind CSS** for the utility-first styling approach

## 🔗 Links

- **Live Demo**: [resume-site.md](https://your-demo-url.com)
- **Hackathon**: [hackathon.dev](https://hackathon.dev)
- **Bolt.new**: [bolt.new](https://bolt.new)

---

**Built with ❤️ for the Bolt.new Hackathon**

*Transform your career story into professional website instructions through the power of conversation and AI, then bring them to life with Bolt.new.*