export interface ConversationPreview {
  other_id: string;
  last_message: string | null;
  last_time: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content?: string | null;
  media_url?: string | null;
  created_at: string;
}
