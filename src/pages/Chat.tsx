import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useSignOut, useUserData } from '@nhost/react';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { GET_CHATS, GET_MESSAGES, CREATE_CHAT, SEND_MESSAGE, SEND_BOT_MESSAGE } from '../graphql/operations';

interface Chat {
  id: string;
  created_at: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const Chat: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const { signOut } = useSignOut();
  const user = useUserData();
  
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Fetch chats
  const { data: chatsData, loading: chatsLoading, error: chatsError } = useQuery<{ chats: Chat[] }>(GET_CHATS);

  // Get messages for the selected chat
  const { data: messagesData, loading: messagesLoading } = useSubscription<{ messages: Message[] }>(
    GET_MESSAGES,
    { variables: { chatId: selectedChat }, skip: !selectedChat }
  );

  // Mutations
  const [createChat] = useMutation(CREATE_CHAT, { refetchQueries: [{ query: GET_CHATS }] });
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [sendBotMessage] = useMutation(SEND_BOT_MESSAGE);

  const handleCreateChat = async () => {
    if (!user?.id) {
      console.error('No user ID found');
      return;
    }
    
    try {
      const result = await createChat({
        variables: {
          userId: user.id
        }
      });
      
      if (result.data?.insert_chats_one?.id) {
        setSelectedChat(result.data.insert_chats_one.id);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const userMessage = newMessage;
    setNewMessage('');
    setIsSending(true);
    setIsBotTyping(false);

    try {
      // Save user message
      await sendMessage({ variables: { chatId: selectedChat, message: userMessage } });
      setIsSending(false);
      setIsBotTyping(true);
      // Trigger bot response
      await sendBotMessage({ variables: { chatId: selectedChat, message: userMessage } });
      setIsBotTyping(false);
    } catch (error) {
      setIsSending(false);
      setIsBotTyping(false);
      console.error('Error sending message:', error);
    }
  };


  return (
    <div className={`chat-app-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Left Panel: Chat List */}
      <div className="chat-list-panel">
        <div className="chat-list-header">
          <button 
            onClick={handleCreateChat} 
            className="new-chat-button"
          >
            New Chat
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chatsLoading && <p>Loading chats...</p>}
          {chatsError && <p>Error loading chats.</p>}
          {chatsData?.chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              style={{
                padding: '15px',
                cursor: 'pointer',
                backgroundColor: selectedChat === chat.id ? 'var(--chat-active)' : 'transparent',
                borderBottom: '1px solid var(--border-color)',
                fontWeight: selectedChat === chat.id ? 600 : 400,
                color: selectedChat === chat.id ? 'white' : 'var(--text-primary)',
                transition: 'background-color 0.2s, color 0.2s',
              }}
              onMouseOver={(e) => {
                if (selectedChat !== chat.id) {
                  e.currentTarget.style.backgroundColor = 'var(--chat-hover)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedChat !== chat.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              Chat from {new Date(chat.created_at).toLocaleString()}
            </div>
          ))}
        </div>
        <div className="chat-list-footer">
          <button 
            onClick={signOut} 
            className="sign-out-button"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Right Panel: Message View */}
      <div className={`message-view-panel${darkMode ? ' dark' : ' light'}`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '10px 20px 0 20px' }}>
          <button
            onClick={() => setDarkMode((d) => !d)}
            style={{
              background: darkMode ? '#222' : '#eee',
              color: darkMode ? '#fff' : '#333',
              border: '1px solid #888',
              borderRadius: '20px',
              padding: '5px 18px',
              cursor: 'pointer',
              fontWeight: 600,
              marginBottom: 8,
            }}
            aria-label="Toggle dark/light mode"
          >
            {darkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
        <div className="messages-scroll-area">
          {!selectedChat ? (
            <p>Select a chat or create a new one to start messaging.</p>
          ) : messagesLoading ? (
            <p>Loading messages...</p>
          ) : (
            <React.Fragment>
              {messagesData?.messages.map((msg) => (
                <div key={msg.id} style={{ marginBottom: '10px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  <div
                    className={msg.role === 'user' ? 'message-bubble user' : 'message-bubble bot'}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {/* Sending indicator */}
              {isSending && (
                <div style={{ marginBottom: '10px', textAlign: 'right' }}>
                  <div className="message-bubble sending">Sending...</div>
                </div>
              )}
              {/* Bot typing indicator */}
              {isBotTyping && (
                <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                  <div className="message-bubble typing">Bot is typing...</div>
                </div>
              )}
            </React.Fragment>
          )}
        </div>
        {selectedChat && (
          <div className="message-input-area">
            <form onSubmit={handleSendMessage} style={{ display: 'flex' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <button type="submit" style={{ marginLeft: '10px', padding: '10px' }} disabled={isSending || isBotTyping}>
                Send
              </button>
            </form>
          </div>
        )}
      </div>
      <style>{`
        :root {
          --bg-primary: #18181b;
          --bg-secondary: #1e1e24;
          --text-primary: #f8f8f8;
          --text-secondary: #a1a1aa;
          --border-color: #333;
          --button-bg: #3b82f6;
          --button-hover: #2563eb;
          --button-text: #fff;
          --input-bg: #2d2d35;
          --input-text: #f8f8f8;
          --chat-hover: #2d2d35;
          --chat-active: #3b82f6;
        }
        
        .light {
          --bg-primary: #ffffff;
          --bg-secondary: #f3f4f6;
          --text-primary: #111827;
          --text-secondary: #4b5563;
          --border-color: #e5e7eb;
          --button-bg: #3b82f6;
          --button-hover: #2563eb;
          --button-text: #ffffff;
          --input-bg: #f9fafb;
          --input-text: #111827;
          --chat-hover: #e5e7eb;
          --chat-active: #dbeafe;
        }
        
        html, body, #root {
          height: 100%;
          margin: 0;
          padding: 0;
          width: 100vw;
          min-width: 0;
          box-sizing: border-box;
          background: var(--bg-primary);
          color: var(--text-primary);
          transition: background-color 0.2s, color 0.2s;
        }
        
        *, *::before, *::after {
          box-sizing: inherit;
        }
        
        .chat-app-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          min-width: 0;
          overflow: hidden;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .chat-list-panel {
          width: 300px;
          min-width: 200px;
          max-width: 350px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          min-height: 0;
          color: var(--text-primary);
        }
        
        .chat-list-header, .chat-list-footer {
          padding: 10px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }
        
        .chat-list-footer {
          border-top: 1px solid var(--border-color);
          border-bottom: none;
        }
        
        .new-chat-button, .sign-out-button {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 6px;
          background: var(--button-bg);
          color: var(--button-text);
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .new-chat-button:hover, .sign-out-button:hover {
          background: var(--button-hover);
        }
        .message-view-panel {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          min-height: 0;
          color: var(--text-primary);
          transition: background 0.2s, color 0.2s;
        }
        .message-view-panel.light {
          background: #fff;
          color: #222;
        }
        .chat-list-panel {
          color: #fff;
        }
        .chat-list-panel button, .chat-list-panel input {
          color: #222;
        }
        .messages-scroll-area {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          width: 100%;
          max-width: 100vw;
        }
        .message-bubble {
          display: inline-block;
          padding: 10px;
          border-radius: 10px;
          max-width: 100%;
          word-break: break-word;
          font-size: 1rem;
          box-sizing: border-box;
        }
        .message-bubble.user {
          background-color: #2563eb;
          color: white;
          margin-left: auto;
        }
        .message-bubble.bot {
          background-color: #23272f;
          color: #f4f4f4;
          margin-right: auto;
        }
        .message-bubble.sending {
          background-color: #3b82f6;
          color: #e0e0e0;
          font-style: italic;
          margin-left: auto;
        }
        .message-bubble.typing {
          background-color: #23272f;
          color: #bdbdbd;
          font-style: italic;
          margin-right: auto;
        }
        .message-input-area {
          padding: 20px;
          border-top: 1px solid var(--border-color);
          width: 100%;
          box-sizing: border-box;
          background: var(--bg-secondary);
        }
        
        .message-input-area input {
          background: var(--input-bg);
          color: var(--input-text);
          border: 1px solid var(--border-color);
        }
        
        .message-input-area button {
          background: var(--button-bg);
          color: var(--button-text);
          border: none;
        }
        
        .message-input-area button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .message-view-panel.light .message-bubble.user {
          background-color: #007bff;
          color: white;
        }
        .message-view-panel.light .message-bubble.bot {
          background-color: #f1f1f1;
          color: #222;
        }
        .message-view-panel.light .message-bubble.sending {
          background-color: #b3d7ff;
          color: #333;
        }
        .message-view-panel.light .message-bubble.typing {
          background-color: #f1f1f1;
          color: #555;
        }
        .message-view-panel.light .message-input-area {
          background: #fff;
        }
        @media (max-width: 700px) {
          .chat-list-panel {
            width: 80px;
            min-width: 60px;
            max-width: 120px;
            font-size: 0.85rem;
          }
          .messages-scroll-area {
            padding: 8px;
          }
          .message-input-area {
            padding: 8px;
          }
          .message-bubble {
            font-size: 0.95rem;
          }
        }
        @media (max-width: 500px) {
          .chat-app-container {
            flex-direction: column;
          }
          .chat-list-panel {
            display: none;
          }
          .message-view-panel {
            width: 100vw;
          }
          .messages-scroll-area {
            padding: 4px;
          }
          .message-input-area {
            padding: 4px;
          }
          .message-bubble {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Chat;

