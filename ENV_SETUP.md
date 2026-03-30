# EduVision Environment Variables Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role Key (Server-side only, never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Groq API Key (Server-side only, for AI features)
GROQ_API_KEY=your-groq-api-key
```

## Optional Environment Variables

```env
# Optional: RapidAPI Key for plagiarism checker
RAPIDAPI_KEY=your-rapidapi-key

# Optional: Gemini API Key for AI suggestions
GEMINI_API_KEY=your-gemini-api-key

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Security Settings
JWT_SECRET=your-secure-random-string-at-least-32-characters
```

## Security Best Practices

1. **NEVER** commit `.env.local` to version control
2. **NEVER** expose server-side API keys to the client
3. Use `NEXT_PUBLIC_` prefix only for variables that must be accessible in the browser
4. Rotate API keys regularly
5. Use environment-specific keys for development, staging, and production

## Getting API Keys

### Supabase
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy the URL and anon/public key

### Groq API
1. Go to https://console.groq.com
2. Create an account and generate an API key
3. Add to your `.env.local` as `GROQ_API_KEY`

### RapidAPI (for plagiarism checker)
1. Go to https://rapidapi.com
2. Subscribe to the plagiarism checker API
3. Copy your API key
