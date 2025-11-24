# Nocturne - Spooky Task Manager

**Status:** 🚧 In Development  
**Version:** 0.1.0  
**Last Updated:** November 22, 2025

## Project Overview

Nocturne is an elegant, spooky-themed task management application designed for the Kiro Costume Contest. It combines practical productivity features with a toggleable gothic aesthetic, creating a unique and engaging user experience.

### Core Value Proposition

- **Reduces Decision Fatigue:** AI Focus Coach generates structured 25-minute session plans
- **Accessible & Inclusive:** WCAG AA compliant with full keyboard navigation and screen reader support
- **Customizable Atmosphere:** Toggleable spookiness levels (Minimal → Twilight → Haunted)
- **Cross-Platform:** Responsive design works on desktop, tablet, and mobile
- **Privacy-First:** All data stored locally, no external servers required

### Target Audience

- Students managing coursework and study sessions
- Professionals juggling multiple projects
- Anyone seeking a calming, focused productivity tool

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS with custom gothic design tokens
- **State Management:** React Context + Local Storage
- **Animations:** Framer Motion for atmospheric effects
- **Accessibility:** ARIA roles, semantic HTML, keyboard navigation

### AI Integration
- **Kiro Agent Hooks:** Focus Coach session planning
- **Explainability:** Confidence scores and reasoning for AI suggestions

### Development Tools
- **Kiro Specs:** Formal requirements and design documentation
- **Kiro Steering:** Coding standards and accessibility guidelines
- **TypeScript:** Type-safe development
- **ESLint + Prettier:** Code quality and formatting

## Project Structure

```
nocturne/
├── .kiro/
│   ├── specs/
│   │   └── nocturne-task-manager/
│   │       ├── requirements.md
│   │       ├── design.md (pending)
│   │       └── tasks.md (pending)
│   ├── steering/
│   │   ├── coding-standards.md (pending)
│   │   ├── accessibility-guidelines.md (pending)
│   │   └── spooky-design-principles.md (pending)
│   └── hooks/
│       └── focus-coach.md (pending)
├── apps/
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── lib/
│       │   ├── hooks/
│       │   └── app/
│       └── public/
├── packages/
│   └── ui/
│       └── src/
│           ├── components/
│           └── theme/
├── docs/
│   ├── demo-script.md (pending)
│   └── accessibility-checklist.md (pending)
├── PROJECT.md (this file)
├── DEVELOPMENT.md (pending)
└── README.md (pending)
```

## Key Features

### MVP Features (Phase 1)
- ✅ Task CRUD operations (create, read, update, delete)
- ✅ Tags and due dates
- ✅ Project-based organization
- ✅ Local storage persistence
- ✅ CSV import
- ✅ AI Focus Coach with 25-minute sessions
- ✅ Toggleable spooky theme system
- ✅ Full keyboard navigation
- ✅ Screen reader support

### Future Enhancements (Post-Contest)
- Calendar integration (Google/Microsoft)
- Smart reminders with notifications
- Progress visualization and analytics
- Team collaboration features
- Mobile native apps

## Kiro Integration Showcase

This project demonstrates multiple Kiro features for the contest:

1. **Specs:** Formal requirements with EARS patterns and acceptance criteria
2. **Vibe Coding:** Gothic UI scaffolding with atmospheric prompts
3. **Agent Hooks:** AI Focus Coach for intelligent session planning
4. **Steering Docs:** Coding standards, accessibility guidelines, design principles
5. **MCP (Future):** Calendar and notification integrations

## Development Phases

### Phase 1: Foundation ✅
- [x] Project structure setup
- [x] Kiro spec creation (requirements.md)
- [x] Design document (design.md)
- [x] Implementation plan (tasks.md)
- [ ] Steering docs
- [ ] Next.js + Tailwind configuration

### Phase 2: Core Task Management (In Progress)
- [ ] Data models (Task, Project, User)
- [ ] Task CRUD operations
- [ ] Tags and due dates
- [ ] Local storage persistence
- [ ] CSV import

### Phase 3: Spooky UI System
- [ ] Design token system
- [ ] Gothic typography
- [ ] Ambient animations
- [ ] Component library

### Phase 4: AI Focus Coach
- [ ] Session model
- [ ] Kiro agent hook
- [ ] Micro-plan generation
- [ ] Explainability layer
- [ ] Timer implementation

### Phase 5: Accessibility & Polish
- [ ] Keyboard navigation
- [ ] ARIA implementation
- [ ] Screen reader testing
- [ ] Color contrast validation
- [ ] Onboarding tour

### Phase 6: Testing & Submission
- [ ] Unit tests
- [ ] E2E tests
- [ ] Accessibility audit
- [ ] Demo video
- [ ] Documentation

## Success Metrics

### Contest Judging Criteria
- **Usefulness:** Solves real productivity problems for students and professionals
- **Creativity:** Unique spooky aesthetic that's calming, not gimmicky
- **Kiro Integration:** Showcases specs, hooks, steering, and vibe coding
- **Polish:** High-quality UI, accessibility, and user experience
- **Technical Excellence:** Clean code, proper architecture, comprehensive testing

### User Experience Goals
- Onboarding completion in < 60 seconds
- Task creation in < 5 seconds
- Focus session start in < 10 seconds
- WCAG AA accessibility compliance
- 100% keyboard navigable

## Team & Contributions

- **Developer:** [Your Name]
- **AI Assistant:** Kiro
- **Contest:** Kiro Costume Contest 2025

## License

MIT License (or specify your preferred license)

---

**Note:** This document is actively maintained throughout development. Check the Last Updated date for currency.
