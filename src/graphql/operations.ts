import { gql } from '@apollo/client';

export const GET_CHATS = gql`
  query GetChats {
    chats {
      id
      created_at
    }
  }
`;

export const GET_MESSAGES = gql`
  subscription GetMessages($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: asc }) {
      id
      role
      content
      created_at
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation CreateChat($userId: uuid!) {
    insert_chats_one(object: { user_id: $userId }) {
      id
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: uuid!, $message: String!) {
    insert_messages_one(object: { chat_id: $chatId, role: "user", content: $message }) {
      id
    }
  }
`;

export const SEND_BOT_MESSAGE = gql`
  mutation SendBotMessage($chatId: uuid!, $message: String!) {
    sendMessage(chat_id: $chatId, message: $message) {
      id
      role
      content
    }
  }
`;
