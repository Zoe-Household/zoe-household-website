# Zoe Household Website Development
## Project Plan

**Project Duration:** August 3 - August 31, 2026  
**Launch Date:** August 31, 2026

---

## Team

| Role | Name | GitHub |
|------|------|--------|
| Project Manager | Motabisola | @motabisola |
| Lead Developer | Arrdel | @arrdel |
| Developer | Kerechi | @kerechi |
| Designer | Kamsi-Pamela | @kamsi-pamela |
| Designer | Bishopdaniel | @bishopdaniel |

---

## Timeline Overview

```
Week 1 (Aug 3-9)    ████████████████████  Design System + Core Pages Design
Week 2 (Aug 10-16)  ████████████░░░░░░░░  Design Completion + Core Dev Starts
Week 3 (Aug 17-23)  ░░░░████████████████  Feature Development
Week 4 (Aug 24-31)  ░░░░░░░░████████████  Testing, Polish, Launch
```

### Milestone Schedule

| Milestone | Due Date | Focus |
|-----------|----------|-------|
| M1: Design System & Core Pages | Aug 14 | Figma design system, components, core page designs |
| M2: Core Development | Aug 21 | Project setup, Tailwind, components, infrastructure |
| M3: Feature Development | Aug 26 | Page implementations, forms, backends, features |
| M4: Testing & Polish | Aug 29 | QA, accessibility, performance, bug fixes |
| M5: Launch | Aug 31 | Content review, deployment, go-live |

---

## Phase 1: Design (Aug 3-14)

### Week 1 Priorities (Aug 3-9)

| Issue | Title | Assignee | Priority |
|-------|-------|----------|----------|
| #43 | Figma File Setup & Design Handoff Process | Designers | Critical |
| #3 | Design System: Color Palette & Typography | Designers | Critical |
| #4 | Design System: Spacing & Layout Grid | Designers | Critical |
| #5 | Design System: Core UI Components | Designers | Critical |
| #6 | Design System: Content Cards | Designers | Critical |
| #7 | Design System: Forms | Designers | Critical |
| #8 | Design: Homepage - Mobile & Desktop | Designers | Critical |

### Week 2 Design Priorities (Aug 10-14)

| Issue | Title | Assignee | Priority |
|-------|-------|----------|----------|
| #9 | Design: Campus Page Template | Designers | Critical |
| #10 | Design: Sermons Page | Designers | Critical |
| #11 | Design: Give Page | Designers | Critical |
| #12 | Design: Prayer Request Page | Designers | Critical |
| #13 | Design: Events Page | Designers | High |
| #14 | Design: About & Beliefs Pages | Designers | High |
| #15 | Design: Motion & Animation Specifications | Designers | High |

### Designer Workload Split Suggestion

**Designer 1 (kamsi-pamela):**
- Design System (colors, typography, spacing)
- Core UI Components
- Homepage
- Sermons Page
- Motion Specifications

**Designer 2 (bishopdaniel):**
- Content Cards (sermon, event, ministry)
- Forms
- Campus Page Template
- Give Page
- Prayer Page
- Events Page
- About/Beliefs Pages

---

## Phase 2: Core Development (Aug 10-21)

Development starts mid-Week 2 as designs become available.

### Week 2 Dev Priorities (Aug 10-16)

| Issue | Title | Assignee | Priority |
|-------|-------|----------|----------|
| #16 | Project Restructure & Tech Stack Setup | @arrdel | Critical |
| #21 | Infrastructure - CI/CD Pipeline & Deployment | @arrdel | Critical |
| #17 | Implement Design System in Tailwind | @kerechi | Critical |
| #22 | Data Layer & Content Structure | @kerechi | Critical |

### Week 3 Core Dev (Aug 17-21)

| Issue | Title | Assignee | Priority |
|-------|-------|----------|----------|
| #18 | Build Core UI Components | @arrdel | Critical |
| #19 | Build Content Card Components | @kerechi | Critical |
| #20 | Implement Motion System | @arrdel | High |

### Developer Workload Split

**Lead Developer (@arrdel):**
- Project restructure & tech stack
- CI/CD pipeline setup
- Core UI components (shadcn/ui customization)
- Motion system (Framer Motion)
- Homepage implementation
- Form backends (API routes)
- Campus finder tool

**Developer (@kerechi):**
- Design system in Tailwind
- Data layer setup
- Content card components
- Campus pages
- Sermons page
- Events page
- About/Beliefs pages

---

## Phase 3: Feature Development (Aug 17-26)

### Page Implementations

| Issue | Title | Assignee | Priority | Dependencies |
|-------|-------|----------|----------|--------------|
| #23 | Build Homepage | @arrdel | Critical | #8, #18, #20 |
| #24 | Build Campus Pages | @kerechi | Critical | #9, #19, #22 |
| #25 | Build Sermons Page | @kerechi | Critical | #10, #19 |
| #26 | Build Give Page | @arrdel | Critical | #11 |
| #27 | Build Prayer Request Page & Backend | @arrdel | Critical | #12 |
| #28 | Build Events Page | @kerechi | High | #13, #19 |
| #29 | Build Contact Form & Backend | @arrdel | High | #7 |
| #30 | Build About & Beliefs Pages | @kerechi | High | #14 |

### Interactive Features

| Issue | Title | Assignee | Priority |
|-------|-------|----------|----------|
| #31 | Campus Finder Interactive Tool | @arrdel | High |
| #32 | Visit Registration Form & Backend | @arrdel | Critical |
| #33 | SEO & Metadata Implementation | @kerechi | High |
| #34 | Analytics & Monitoring Setup | @arrdel | Medium |

---

## Phase 4: Testing & Polish (Aug 24-29)

### QA Tasks

| Issue | Title | Assignee | Priority |
|-------|-------|----------|----------|
| #35 | Accessibility Audit & Fixes | All | Critical |
| #36 | Cross-Browser & Device Testing | All | Critical |
| #37 | Performance Optimization | @arrdel | High |
| #38 | Form & Backend Testing | @kerechi | Critical |

### Testing Assignments

- **@arrdel:** Performance optimization, backend testing, accessibility fixes
- **@kerechi:** Cross-browser testing, content verification, accessibility fixes
- **@motabisola:** Coordinate testing, track bugs, verify content
- **Designers:** Visual QA, design consistency review

---

## Phase 5: Launch (Aug 29-31)

| Issue | Title | Assignee | Priority |
|-------|-------|----------|----------|
| #39 | Content Review & Final Updates | @motabisola | Critical |
| #40 | Production Deployment | @arrdel | Critical |
| #41 | Documentation & Handoff | All | High |

### Launch Day Checklist (Aug 31)

1. [ ] Final content review complete
2. [ ] All forms tested in production
3. [ ] DNS propagation verified
4. [ ] Analytics tracking verified
5. [ ] Error monitoring active
6. [ ] Team notified
7. [ ] Go-live!

---

## Dependencies Chart

```
Design System (#3, #4) 
    ↓
Core Components (#5, #6, #7)
    ↓
Page Designs (#8, #9, #10, #11, #12, #13, #14)
    ↓
Motion Specs (#15)

Project Setup (#16)
    ↓
Tailwind Implementation (#17) ← Design System
    ↓
UI Components (#18, #19) ← Component Designs
    ↓
Motion System (#20) ← Motion Specs
    ↓
Page Implementations (#23-#32)
    ↓
Testing (#35-#38)
    ↓
Launch (#39-#41)
```

---

## Critical Path

The following items are on the critical path and must not slip:

1. **Aug 3-7:** Design system (colors, typography, spacing, components)
2. **Aug 8-14:** Homepage + Campus page designs
3. **Aug 10-14:** Project restructure + CI/CD
4. **Aug 15-21:** Core components + Homepage implementation
5. **Aug 22-26:** Form backends + All pages complete
6. **Aug 27-29:** Testing + Bug fixes
7. **Aug 30-31:** Content review + Deploy

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Design delays | Blocks development | Prioritize critical pages, parallel work on components |
| Missing content (bank details, etc.) | Incomplete pages | Flag early, use placeholders, escalate to leadership |
| Backend complexity | Feature delays | Keep forms simple, use email notifications initially |
| Integration issues (Tithely, YouTube) | Feature gaps | Test integrations early, have fallback plans |
| Testing time crunch | Quality issues | Start testing early, automate where possible |

---

## Communication Plan

### Daily
- Async standup in project channel (Slack/Discord)
- Update GitHub issues with progress

### Weekly
- Monday: Week kickoff, priorities review
- Friday: Week retrospective, blocker resolution

### As Needed
- Design review sessions
- Technical discussions
- Escalations to @motabisola

---

## GitHub Project

All issues are created and organized by milestone:

- **M1: Design System & Core Pages** (11 issues) - Due Aug 14
- **M2: Core Development** (7 issues) - Due Aug 21
- **M3: Feature Development** (12 issues) - Due Aug 26
- **M4: Testing & Polish** (4 issues) - Due Aug 29
- **M5: Launch** (3 issues) - Due Aug 31

View the project: https://github.com/Zoe-Household/zoe-household-website/issues

### Labels

| Label | Description |
|-------|-------------|
| `design` | Design work in Figma |
| `frontend` | Frontend development |
| `backend` | Backend/API development |
| `infrastructure` | DevOps, CI/CD |
| `testing` | QA tasks |
| `phase:design` | Design phase |
| `phase:dev-core` | Core development |
| `phase:dev-features` | Feature development |
| `phase:testing` | Testing phase |
| `phase:launch` | Launch prep |
| `priority:critical` | Must have |
| `priority:high` | Important |
| `page:home`, `page:campus`, etc. | Page-specific |

---

## Content Requirements (Action Items for PM)

The following content must be obtained from church leadership:

- [ ] Confirm all 6 campuses and their details
- [ ] Real Tithely embed URLs/API keys
- [ ] Real bank account details (replace placeholders)
- [ ] Legal entity name for footer
- [ ] Brand palette (if one exists beyond PRD)
- [ ] Approved slogans
- [ ] Leadership photos and bios (if including)
- [ ] Confirm sermons page intent (featured only vs. full library)
- [ ] Event details (dates, locations, registration)
- [ ] Prayer team email for notifications
- [ ] Verify ChurchOS integration plans

---

## Success Criteria

The project is successful when:

1. ✅ Website live at zoehousehold.org by Aug 31
2. ✅ All core pages functional (Home, Campus x6, Sermons, Events, Give, Prayer, About)
3. ✅ Forms submit successfully with notifications
4. ✅ Mobile-responsive across all devices
5. ✅ Lighthouse scores 90+ (Performance, Accessibility, SEO)
6. ✅ No critical bugs
7. ✅ Content accurate and approved
8. ✅ Analytics and monitoring active
