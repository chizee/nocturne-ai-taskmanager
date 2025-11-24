# 🌙 Nocturne

> An elegant, spooky-themed task manager that reduces decision fatigue with AI-powered focus sessions.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Built with Kiro](https://img.shields.io/badge/Built%20with-Kiro-blueviolet)](https://kiro.ai)
[![Accessibility: WCAG AA](https://img.shields.io/badge/Accessibility-WCAG%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)

**🎃 Kiro Costume Contest 2025 Submission**

---

## ✨ What is Nocturne?

Nocturne is a productivity application that combines practical task management with a calming gothic aesthetic. Designed for students and professionals, it features an AI Focus Coach that generates structured 25-minute work sessions, reducing decision fatigue and helping you start working immediately.

### Key Features

🎯 **AI Focus Coach** - Intelligent session planning with explainable 3-step micro-plans  
👻 **Toggleable Spooky Theme** - Adjust atmosphere from Minimal to Haunted  
♿ **Fully Accessible** - WCAG AA compliant with keyboard navigation and screen reader support  
📦 **CSV Import** - Quickly migrate existing task lists  
🏷️ **Smart Organization** - Tags, due dates, and project-based grouping  
💾 **Privacy-First** - All data stored locally in your browser  
📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

---

## 🎬 Demo

**[🎥 Watch Demo Video](https://youtu.be/your-demo-link)** (3 minutes)

**[🚀 Try Live Demo](https://nocturne-demo.vercel.app)**

---

## 🏗️ Built with Kiro

This project showcases multiple Kiro features:

### 📋 Specs-Driven Development
- Formal requirements with EARS patterns
- 14 requirements with 70+ acceptance criteria
- Correctness properties for property-based testing
- See: `.kiro/specs/nocturne-task-manager/`

### 🎨 Vibe Coding
- Gothic UI scaffolding with atmospheric prompts
- "Minimal, elegant, gothic" design language
- Ambient animations and breathing effects

### 🤖 Agent Hooks
- AI Focus Coach for intelligent session planning
- Explainability layer with confidence scores
- Friendly ghost companion personality

### 📚 Steering Documents
- Coding standards and best practices
- Accessibility guidelines (WCAG AA)
- Spooky design principles
- See: `.kiro/steering/`

### 🔌 MCP Integration (Planned)
- Calendar sync (Google/Microsoft)
- Notification services
- Time-zone utilities

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Modern browser with JavaScript enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/chizee/nocturne-ai-taskmanager.git
cd nocturne-ai-taskmanager

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm build
pnpm start
```

### Immersive Welcome Page

Nocturne includes a stunning fullscreen video welcome page:

1. Add your video: `public/assets/intro-video/nocturne-intro.mp4`
2. Add fallback image: `public/assets/image/nocturne-intro.png`
3. Visit: `/welcome.html`

See `WELCOME-PAGE-GUIDE.md` for full documentation.

---

## 📖 Usage

### Creating Your First Task

1. Click the input field or press `Ctrl+N`
2. Type your task description
3. Press `Enter` to create
4. Optionally add tags, due dates, or assign to a project

### Starting a Focus Session

1. Click "Start Focus Session" or press `Ctrl+F`
2. The AI Focus Coach analyzes your tasks
3. Review the 3-step micro-plan with explanations
4. Click "Begin" to start the 25-minute timer
5. Work through the plan step-by-step

### Adjusting Spookiness

1. Click the theme toggle in the top-right
2. Choose your preferred level:
   - **Minimal:** Clean dark interface with subtle gothic typography
   - **Twilight:** Ambient animations and atmospheric gradients
   - **Haunted:** Full atmospheric effects with particle animations

### Keyboard Shortcuts

- `Ctrl+N` - New task
- `Ctrl+F` - Start focus session
- `Ctrl+/` - Show all shortcuts
- `Tab` / `Shift+Tab` - Navigate elements
- `Escape` - Close modals
- `Enter` - Activate focused element

---

## 🏛️ Architecture

### Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS with custom design tokens
- **State:** React Context + Local Storage
- **Animations:** Framer Motion
- **AI:** Kiro Agent Hooks
- **Testing:** Vitest, Testing Library, Playwright

### Project Structure

```
nocturne/
├── .kiro/                    # Kiro specs, steering, hooks
├── apps/web/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Core logic and utilities
│   │   └── hooks/           # Custom React hooks
│   └── public/              # Static assets
├── packages/ui/              # Reusable component library
├── docs/                     # Documentation
└── tests/                    # E2E tests
```

---

## ♿ Accessibility

Nocturne is built with accessibility as a core requirement, not an afterthought.

### Compliance
- ✅ WCAG 2.1 Level AA compliant
- ✅ Keyboard navigable (100% of features)
- ✅ Screen reader compatible (NVDA, JAWS, VoiceOver tested)
- ✅ Color contrast ratios meet standards
- ✅ Semantic HTML and ARIA roles
- ✅ Focus indicators on all interactive elements

### Testing
- Automated: Axe DevTools, Pa11y
- Manual: Keyboard-only navigation, screen reader testing
- Color-blind simulation: Deuteranopia, Protanopia, Tritanopia

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Accessibility tests
npm run test:a11y

# All tests
npm run test:all
```

### Testing Strategy

- **Unit Tests:** Core logic, data models, utilities
- **Property-Based Tests:** Universal properties (round-trip, invariants)
- **E2E Tests:** Critical user flows (task creation, focus sessions)
- **Accessibility Tests:** Axe, keyboard navigation, screen reader

---

## 🎨 Design Philosophy

### Spooky but Calming

Nocturne's aesthetic is inspired by gothic architecture and night-time tranquility. The design uses:

- **Typography:** Elegant serif fonts (Cinzel, Crimson Text)
- **Colors:** Deep purples, midnight blues, ghostly whites
- **Animations:** Subtle breathing effects, gentle particle systems
- **Atmosphere:** Eerie but soothing, mysterious but welcoming

The toggleable spookiness system ensures users can customize the experience to their comfort level.

### Accessibility-First

Every design decision considers accessibility:
- High contrast ratios for readability
- Non-color indicators for information
- Keyboard-friendly interactions
- Screen reader optimized content

---

## 🗺️ Roadmap

### MVP (Contest Submission) ✅
- [x] Task CRUD operations
- [x] Tags, due dates, projects
- [x] AI Focus Coach
- [x] Toggleable spooky theme
- [x] Full accessibility
- [x] CSV import

### Post-Contest Enhancements
- [ ] Calendar integration (Google/Microsoft)
- [ ] Smart reminders with notifications
- [ ] Progress visualization and analytics
- [ ] Team collaboration features
- [ ] Mobile native apps (iOS/Android)
- [ ] Browser extensions
- [ ] Pomodoro statistics and insights

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the coding standards in `.kiro/steering/`
4. Write tests for new features
5. Ensure accessibility compliance
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Kiro AI** - For the amazing development tools and contest
- **Contest Judges** - For reviewing this submission
- **Open Source Community** - For the incredible libraries and tools

---

## 📞 Contact

**Developer:** [Your Name]  
**Email:** [your.email@example.com]  
**GitHub:** [@yourusername](https://github.com/yourusername)  
**Twitter:** [@yourhandle](https://twitter.com/yourhandle)

---

## 🎃 Contest Information

**Event:** Kiro Costume Contest 2025  
**Category:** Productivity Tools  
**Submission Date:** [Date]  
**Theme:** Spooky but Functional

### Why Nocturne Deserves to Win

1. **Usefulness:** Solves real productivity problems with AI-powered focus sessions
2. **Creativity:** Unique calming gothic aesthetic with toggleable intensity
3. **Kiro Integration:** Showcases specs, hooks, steering, and vibe coding
4. **Polish:** WCAG AA accessible, responsive, performant
5. **Technical Excellence:** Clean architecture, comprehensive testing, well-documented

---

<div align="center">

**Built with 💜 and a touch of 👻 using Kiro**

[⭐ Star this repo](https://github.com/yourusername/nocturne) | [🐛 Report Bug](https://github.com/yourusername/nocturne/issues) | [✨ Request Feature](https://github.com/yourusername/nocturne/issues)

</div>
