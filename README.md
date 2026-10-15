# NotePilot
## AI Meeting Summarizer & Scheduler

An **AI-powered web application** that transforms online meetings into **clear summaries**, **actionable tasks**, and **smart schedules**.  
Designed to reduce post-meeting confusion and help users turn conversations into execution.

---

## Overview

Meetings often end with **unclear outcomes**, **forgotten tasks**, and **no structured follow-up**.  
This project solves that problem by automatically:

- **Summarizing meeting conversations**
- **Extracting key decisions and action items**
- **Scheduling tasks** based on meeting context
- **Providing AI-powered suggestions** for next steps

The application is designed as a **modern SaaS-style product**, with a **scalable frontend** and **AI-powered backend integration**.

---

## Features

### AI Meeting Summaries
Automatically generate concise summaries from meeting transcripts, highlighting key points, decisions, and next steps.

### Task Extraction & Scheduling
Convert spoken action items into structured follow-ups with dates, owners, and calendar-ready reminders.

### Smart Suggestions
AI recommends next actions, blocker tracking, and follow-up prompts based on the meeting context.

### Decision & Risk Tracking
Capture important decisions, unresolved risks, and blockers so teams can act on them after the call.

### Meeting Templates & Easier Input
Use built-in templates for product syncs, customer calls, and leadership standups, or upload notes and audio directly.

### Personal Workspace + History
Each user gets a personal workspace experience with saved meetings, quick access to recent summaries, and a persistent activity dashboard.

### Export-ready workflow
Copy summaries, download markdown notes, and generate calendar `.ics` files for scheduled tasks.

### Clean Dashboard UI
View summaries, action lists, and upcoming tasks in one place with an intuitive interface that feels like a lightweight product workspace.

### Modern Frontend Architecture
Built with **Next.js App Router** and **React** for scalability, performance, and maintainability.

---

## Tech Stack

### Frontend
- **Next.js 13+ (App Router)**
- **React**
- **Tailwind CSS**
- **JavaScript**

### Backend
- **Node.js**
- **API routes / serverless functions**
- **AI integration** (LLM-based summarization)
- **Database** for meetings and tasks

## AI Configuration

Meeting summarization uses the Groq API. Set `GROQ_API_KEY` in `.env.local` to
your Groq API key. The app defaults to the Groq-hosted `openai/gpt-oss-120b`
model; set `GROQ_MODEL` in `.env.local` to another model ID available to your
Groq account if needed.
