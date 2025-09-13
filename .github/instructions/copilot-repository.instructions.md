---
applyTo: "**/*.ts,**/*.tsx"
---

# AI SDK Preview Roundtrips - Repository Instructions

## Project Overview

This repository demonstrates the Vercel AI SDK's **automatic multiple tool steps** feature through a Next.js application. Currently implements a package tracking assistant showcasing multi-step tool calling with the `maxSteps` parameter in `streamText`. The app includes a complete chat interface with streaming responses, tool invocations, and custom UI components.

**Future Evolution**: The PRD.md indicates plans to evolve this into a Dataset Discovery & Evaluation Agent for scientists - an AI agent that helps discover, evaluate, and acquire research datasets. The existing architecture provides the foundation for this expansion.

## Tech Stack & Dependencies

- **Framework**: Next.js 14.2.5 with App Router
- **Language**: TypeScript throughout the codebase
- **Styling**: Tailwind CSS with custom dark/light theme support
- **Animations**: Framer Motion for smooth UI transitions
- **AI**: Vercel AI SDK (`ai` package) with OpenAI integration (`@ai-sdk/openai`)
- **Storage**: Vercel KV for data persistence
- **Markdown**: React Markdown with remark-gfm for chat message rendering
- **Package Manager**: pnpm (see pnpm-lock.yaml)

## Architecture & Folder Structure

```
├── app/(preview)/              # Next.js App Router with route grouping
│   ├── page.tsx               # Main chat interface using useChat hook
│   ├── layout.tsx             # Root layout with global styles
│   ├── globals.css            # Global styles and Tailwind imports
│   └── api/chat/route.ts      # Chat API endpoint with streamText and tools
├── components/                # Reusable React components
│   ├── message.tsx            # Chat message components with tool invocation handling
│   ├── data.ts                # Mock data types and constants (Order, TrackingInformation)
│   ├── tracker.tsx            # Package tracking UI component
│   ├── orders.tsx             # Orders list UI component
│   ├── markdown.tsx           # Custom markdown renderer
│   ├── icons.tsx              # SVG icon components
│   └── use-scroll-to-bottom.ts # Custom hook for chat scroll behavior
├── src/                       # Clean Architecture folders (prepared for Dataset Discovery expansion)
│   ├── application/           # Use cases and business logic (currently empty)
│   ├── composition/           # Dependency injection and composition root
│   ├── config/                # Configuration and environment settings
│   ├── domain/                # Core business entities and rules
│   └── infrastructure/        # External dependencies (APIs, storage)
└── public/                    # Static assets (product images)
```

## Build & Development Commands

Always run commands in the following order for reliable development:

1. **Install dependencies**: `pnpm install` (never use npm or yarn due to pnpm-lock.yaml)
2. **Development server**: `pnpm dev` (starts on http://localhost:3000)
3. **Build for production**: `pnpm build`
4. **Start production server**: `pnpm start`
5. **Lint code**: `pnpm lint`

## Environment Setup

- Create `.env` file with `OPENAI_API_KEY=your_key_here`
- OpenAI API key is required for the chat functionality to work
- The app uses GPT-4o model specifically (see api/chat/route.ts)

## Key Code Patterns & Conventions

### AI SDK Multi-Step Tool Pattern
The core innovation demonstrated here is automatic tool chaining:

```typescript
// In api/chat/route.ts - The foundation pattern
const stream = streamText({
  model: openai("gpt-4o"),
  maxSteps: 5,              // Enables automatic multi-step tool calls
  tools: {
    toolName: {
      description: "clear description for AI to understand when to use",
      parameters: z.object({ /* Zod validation schema */ }),
      execute: async function ({ param }) {
        // Add artificial delay for better UX in demos
        await new Promise(resolve => setTimeout(resolve, 500));
        return data;
      },
    },
  },
});
```

**Critical**: The AI decides when to chain tools based on descriptions and context. Design tool descriptions to be clear about their purpose and when they should be called in sequence.

### Component Architecture for Tool Results
Each tool result gets its own specialized UI component:

```typescript
// In message.tsx - Tool result rendering pattern
{toolInvocations?.map((toolInvocation) => {
  const { toolName, toolCallId, state, result } = toolInvocation;
  
  if (state === "result") {
    return (
      <div key={toolCallId}>
        {toolName === "listOrders" ? (
          <Orders orders={result} />
        ) : toolName === "viewTrackingInformation" ? (
          <Tracker trackingInformation={result} />
        ) : null}
      </div>
    );
  }
})}
```

### Data Mock Pattern
Mock data is centralized in `components/data.ts` with TypeScript interfaces:

```typescript
// Mock data pattern for development/demo
export interface Order {
  id: string;
  name: string;
  orderedAt: string;
  image: string;
}

export const ORDERS: Order[] = [/* predefined data */];
export const getOrders = () => ORDERS;  // Function wrapper for future API integration
```

### AI SDK Integration
### Chat Interface Best Practices
- Use `useChat` hook from `ai/react` for all chat functionality
- Handle streaming with `useStreamableValue` for real-time updates
- Tool invocations render conditionally based on `state === "result"`
- Always wrap chat messages in Framer Motion for smooth animations

### Component Architecture
- All components are client-side (`"use client"` directive)
- Use TypeScript interfaces for all props and data structures
- Follow the established pattern: Message → Tool Invocation → Custom UI Component
- Tool results are displayed as custom components (Orders, Tracker, etc.)

### Animation Patterns
- Use Framer Motion's `motion.div` for all animated elements
- Standard animation: `initial={{ opacity: 0, y: 5 }}, animate={{ opacity: 1, y: 0 }}`
- Stagger animations with `transition={{ delay: 0.05 * index }}`
- Always wrap chat messages and suggested actions in motion components

### Styling Guidelines
- Use Tailwind CSS utility classes exclusively
- Color scheme: zinc colors for text, blue for accents
- Dark mode support: use dark: prefixes (e.g., `text-zinc-800 dark:text-zinc-300`)
- Responsive design: mobile-first with md: breakpoints
- Layout: center-aligned with max-width constraints (`md:max-w-[500px]`)

### Tool Implementation Pattern
```typescript
// In API route (route.ts)
tools: {
  toolName: {
    description: "clear description",
    parameters: z.object({ /* Zod validation */ }),
    execute: async function ({ /* params */ }) {
      // Tool logic with async delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      return result;
    },
  },
}

// In Message component (message.tsx)
{toolInvocations?.map((toolInvocation) => {
  if (state === "result") {
    return toolName === "yourTool" ? (
      <YourCustomComponent data={result} />
    ) : null;
  }
})}
```

## Future Architecture: Dataset Discovery Evolution

Based on PRD.md, this codebase is planned to expand into a Dataset Discovery & Evaluation Agent. The current architecture provides the foundation:

### Planned Tools (from PRD.md)
- `searchDatasets(keywords[], licenseFilter, dateRange)` - Search scientific datasets
- `fetchMetadata(pid|url)` - Retrieve dataset metadata
- `checkLicense(metadata)` - Validate usage permissions
- `formatCompatibilityCheck(metadata, userFormatReqs)` - Check data format compatibility
- `downloadDataset(pid|url, destPath)` - Download and store datasets
- `generateCitation(metadata)` - Generate academic citations

### Architecture Readiness
- The `src/` directory structure anticipates clean architecture patterns
- The multi-step tool pattern is ideal for complex dataset evaluation workflows
- Component patterns can be extended for dataset cards, evaluation results, and citation displays

When evolving the codebase:
1. Move domain logic into `src/domain/` 
2. Place API integrations in `src/infrastructure/`
3. Implement use cases in `src/application/`
4. Keep UI components focused on presentation

## Assistant Personality
The AI assistant follows specific guidelines defined in the system prompt:
- Friendly package tracking assistant persona
- Concise responses (never use lists, tables, or bullet points)
- Single cohesive responses instead of structured formats
- Focus on package tracking and order management functionality

## Mock Data Structure
The app uses predefined mock data in `components/data.ts`:
- `ORDERS`: Array of orders with id, name, orderedAt, image
- `TRACKING_INFORMATION`: Array with orderId, progress status, description
- Progress states: "Shipped", "Out for Delivery", "Delivered"

## Validation & Testing
- Always test tool calls in development mode to verify streaming works
- Verify dark/light theme switching works correctly  
- Test responsive design on mobile and desktop
- Ensure animations don't interfere with functionality
- Check that tool invocation results display properly in the UI

## Common Patterns to Follow
- Import paths: Use `@/` alias for root imports
- File naming: kebab-case for files, PascalCase for components
- State management: Use React hooks, avoid external state libraries
- Error handling: Graceful degradation for API failures
- Loading states: Use streaming responses, avoid loading spinners

## Deployment Notes
- Configured for Vercel deployment (vercel.json not needed for Next.js)
- Environment variables must be set in Vercel dashboard
- Build command: `pnpm build` (configured in package.json)
- Node.js runtime version: Uses Next.js defaults (Node 18+)
