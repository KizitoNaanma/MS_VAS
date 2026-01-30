export const ClientEvents = {
  // Message Events
  CREATE_MESSAGE: 'createMessage',
  START_TYPING: 'startTyping',
  STOP_TYPING: 'stopTyping',

  // Conversation Events
  JOIN_CONVERSATION: 'joinConversation',
  LEAVE_CONVERSATION: 'leaveConversation',

  // Group Events
  JOIN_GROUP: 'joinGroup',
  LEAVE_GROUP: 'leaveGroup',

  // Video Call Events
  INITIATE_VIDEO_CALL: 'initiateVideoCall',
  ACCEPT_VIDEO_CALL: 'acceptVideoCall',
  REJECT_VIDEO_CALL: 'rejectVideoCall',
  HANGUP_VIDEO_CALL: 'hangupVideoCall',

  // Voice Call Events
  INITIATE_VOICE_CALL: 'initiateVoiceCall',
  ACCEPT_VOICE_CALL: 'acceptVoiceCall',
  REJECT_VOICE_CALL: 'rejectVoiceCall',
  HANGUP_VOICE_CALL: 'hangupVoiceCall',

  // Friend Events
  FETCH_ONLINE_FRIENDS: 'fetchOnlineFriends',
  FETCH_ONLINE_GROUP_USERS: 'fetchOnlineGroupUsers',
} as const;

export type ClientEventType = (typeof ClientEvents)[keyof typeof ClientEvents];
