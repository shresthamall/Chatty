# Chatty - AI Chatbot Application

Chatty is a full-stack AI-powered chat application built with React, TypeScript, Hasura GraphQL, and Nhost. It features real-time messaging, user authentication, and AI-powered responses using OpenRouter.

## Features

- 🔐 Email-based authentication with Nhost Auth
- 💬 Real-time chat with GraphQL Subscriptions
- 🤖 AI-powered responses via OpenRouter
- 🚀 Serverless architecture with Hasura and Nhost
- 🔄 Real-time updates with GraphQL Subscriptions
- 🔒 Row-Level Security (RLS) for data isolation

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS Modules
- **State Management**: Apollo Client
- **Authentication**: Nhost Auth
- **Database & API**: Hasura GraphQL Engine
- **Workflow Automation**: n8n
- **AI**: OpenRouter
- **Deployment**: Netlify

## Prerequisites

- Node.js 18+
- NPM or Yarn
- Nhost account
- Hasura Cloud or self-hosted Hasura
- n8n instance
- OpenRouter API key

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/chatty.git
cd chatty
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
VITE_NHOST_SUBDOMAIN=your-nhost-subdomain
VITE_NHOST_REGION=your-nhost-region
VITE_GRAPHQL_URL=https://your-hasura-endpoint/v1/graphql
VITE_NHOST_WEBHOOK_SECRET=your-webhook-secret
```

### 4. Start the development server

```bash
npm run dev
# or
yarn dev
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── graphql/         # GraphQL operations and client setup
├── pages/           # Page components
│   ├── Auth.tsx     # Authentication page
│   └── Chat.tsx     # Main chat interface
├── utils/           # Utility functions
└── App.tsx          # Main application component
```

## Database Schema

The application uses the following database schema with Row-Level Security (RLS) enabled:

### Tables

#### `chats`
- `id` (uuid, primary key)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `user_id` (uuid, foreign key to auth.users)
- `title` (text)

#### `messages`
- `id` (uuid, primary key)
- `chat_id` (uuid, foreign key to chats)
- `content` (text)
- `created_at` (timestamptz)
- `role` (enum: 'user', 'assistant')

## GraphQL API

The application uses the following GraphQL operations:

### Queries
- `GetChats` - Fetch user's chat list
- `GetMessages` - Fetch messages for a specific chat

### Mutations
- `InsertChat` - Create a new chat
- `InsertMessage` - Add a new message
- `SendMessage` - Custom mutation that triggers the AI response

### Subscriptions
- `OnNewMessage` - Real-time updates for new messages

## n8n Workflow

The n8n workflow handles AI responses:
1. Receives webhook from Hasura Action
2. Validates user permissions
3. Calls OpenRouter API
4. Saves response to database
5. Returns the AI's reply

## Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Set up the following environment variables in Netlify:
   - `VITE_NHOST_SUBDOMAIN`
   - `VITE_NHOST_REGION`
   - `VITE_GRAPHQL_URL`
   - `VITE_NHOST_WEBHOOK_SECRET`
3. Set the build command: `npm run build`
4. Set the publish directory: `dist`
5. Deploy!