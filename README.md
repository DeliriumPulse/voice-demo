# Voice Note AI Demo

A focused voice-to-summary demo built with Next.js, React, and Google Gemini.
The app records a short voice note in the browser, submits the audio through a
server action, and returns a transcript with a concise professional summary.

The scope is intentionally small. This is not presented as a production voice
platform. It is a working prototype that shows the core loop of a voice-first AI
feature: capture audio, process it server-side, and turn speech into usable text.

## Why this project exists

I built this to demonstrate a practical AI integration, not a polished SaaS
product. The useful part is the end-to-end workflow: browser audio capture,
server-side processing, Gemini transcription/summarization, and a simple UI that
shows the result without hiding the prototype limits.

## What it does

- Records audio in the browser with the MediaRecorder API.
- Lets the user review the recording before submitting it.
- Sends the audio to a server action for processing.
- Uses `@google/generative-ai` with Gemini to transcribe and summarize the recording.
- Renders the transcript and summary in a simple responsive UI.
- Optionally uploads demo recordings to Firebase Storage when explicitly enabled.

## What it does not include

This project does **not** currently implement:

- Firebase Authentication
- Firestore data persistence
- Firebase Cloud Functions
- CI/CD automation
- User accounts, roles, or access control
- Rate limiting or abuse protection
- A storage retention/lifecycle policy
- Production monitoring or audit logging

Because of those gaps, this should be treated as a demo or prototype, not a production-ready voice product.

## Tech stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Google Gemini via `@google/generative-ai`
- Optional Firebase Admin Storage upload for demo artifacts

## Getting started

### Prerequisites

- Node.js 20+
- A Google Gemini API key
- Optional: a Firebase project and service account if you want to store uploaded demo audio

### Install

```bash
npm install
```

### Environment variables

Create `.env.local` and add:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Optional Firebase Storage support:

```env
STORE_VOICE_DEMOS=true
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket_name
VOICE_CLIENT_EMAIL=your_service_account_email
VOICE_PRIVATE_KEY="your_service_account_private_key"
```

If `STORE_VOICE_DEMOS` is not set to `true`, recordings are processed in memory and are not uploaded by the server action.

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000` and record a short voice note.

### Build

```bash
npm run build
```

## Production-readiness notes

Before adapting this for real users, add authentication, rate limiting, explicit
consent UX, upload size limits appropriate to your deployment, malware/content
safety checks where relevant, short-lived storage access, lifecycle deletion
rules, observability, and a clear privacy policy.

## License

No license file is currently included. Add one before distributing or reusing this code publicly.
