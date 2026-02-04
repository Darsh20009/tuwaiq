# Twaq Humanitarian Services Platform

## Overview

Twaq is an Arabic-language charitable donation platform built for the Saudi market. It enables users to make donations, track their giving history, and appear on a public leaderboard of top donors. The platform features a modern React frontend with Express backend, using MongoDB for data persistence and session-based authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (February 2026)

### UI/UX Improvements
- **Splash Screen Removed**: Website now loads directly to the main page
- **WhatsApp Contact Button**: Creative expandable popup design with contact number +966 50 579 3012
- **Mobile Responsiveness**: Enhanced CSS for touch-friendly targets and better mobile layouts
- **Admin Panel Redesign**: New sidebar navigation layout for better usability

### New Features
- **File Upload Component**: Supports images, videos, and documents with drag-drop and preview (10MB limit)
- **Job Applications Management**: Admin can view, filter, and manage job applications with status updates
- **Enhanced Job Management**: Search and filter functionality for job listings

### Backend Updates
- **Job Applications API**: Added CRUD endpoints for job applications (/api/job-applications)
- **Service Worker**: Updated cache versioning for proper cache clearing

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Animations**: Framer Motion for page transitions and banners
- **Forms**: React Hook Form with Zod validation
- **Language**: Arabic (RTL) with Cairo/Tajawal fonts

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in `shared/routes.ts`
- **Build**: Vite for frontend, esbuild for server bundling

### Authentication
- **Strategy**: Session-based authentication using Passport.js with local strategy
- **Session Store**: MemoryStore (development) with express-session
- **Password Hashing**: scrypt with random salt
- **Mobile Number**: Used as unique identifier for login

### Data Layer
- **Database**: MongoDB (connected via `MONGODB_URI` environment variable)
- **Schema Definition**: Drizzle ORM schemas in `shared/schema.ts` (PostgreSQL dialect, but app uses MongoDB)
- **Collections**: users, donations, jobs, job_applications, content, settings, uploads
- **Validation**: Zod schemas derived from Drizzle schemas using drizzle-zod

### Key Design Patterns
- **Shared Types**: Schema and route definitions in `/shared` are consumed by both client and server
- **Custom Hooks**: Authentication (`use-auth`), donations (`use-donations`), and leaderboard (`use-leaderboard`) logic encapsulated in React hooks
- **API Contract**: Routes defined with input/output Zod schemas for type-safe API calls

### Payment Flow
- Donations initiate a payment redirect to Geidea payment gateway (currently simulated)
- Callback page (`/api/donations/callback`) handles payment verification
- Donation status tracked as pending/success/failed

## External Dependencies

### Database
- **MongoDB**: Primary data store, requires `MONGODB_URI` environment variable

### Payment Gateway
- **Geidea**: Payment processing (simulated in current implementation)

### Session Management
- `express-session` with `memorystore` for session persistence
- `SESSION_SECRET` environment variable for session signing

### Development Tools
- Replit-specific Vite plugins for development environment
- PostCSS with Tailwind and Autoprefixer

### Required Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Secret key for session encryption (defaults to `twaq_secret_key`)
- `DATABASE_URL`: PostgreSQL URL (for Drizzle config, may be added later)