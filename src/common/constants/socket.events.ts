export const ServerEvents = {
  // Connection Events
  CONNECTION_ESTABLISHED: 'connectionEstablished',
  PEER_UNAVAILABLE: 'peerUnavailable',

  // Message Events
  MESSAGE_RECEIVED: 'messageReceived',
  MESSAGE_DELETED: 'messageDeleted',
  MESSAGE_UPDATED: 'messageUpdated',
  CONVERSATION_CREATED: 'conversationCreated',
  PEER_STARTED_TYPING: 'peerStartedTyping',
  PEER_STOPPED_TYPING: 'peerStoppedTyping',

  // Group Events
  GROUP_MESSAGE_RECEIVED: 'groupMessageReceived',
  GROUP_MESSAGE_UPDATED: 'groupMessageUpdated',
  GROUP_CREATED: 'groupCreated',
  GROUP_REMOVED: 'groupRemoved',
  GROUP_OWNER_CHANGED: 'groupOwnerChanged',
  GROUP_MEMBER_ADDED: 'groupMemberAdded',
  GROUP_MEMBER_REMOVED: 'groupMemberRemoved',
  GROUP_MEMBER_LEFT: 'groupMemberLeft',
  GROUP_ONLINE_STATUS_UPDATED: 'groupOnlineStatusUpdated',

  // Call Events
  VIDEO_CALL_RECEIVED: 'videoCallReceived',
  VIDEO_CALL_ACCEPTED: 'videoCallAccepted',
  VIDEO_CALL_ENDED: 'videoCallEnded',
  VOICE_CALL_RECEIVED: 'voiceCallReceived',
  VOICE_CALL_ACCEPTED: 'voiceCallAccepted',
  VOICE_CALL_ENDED: 'voiceCallEnded',

  // Friend Events
  ONLINE_FRIENDS_RECEIVED: 'onlineFriendsReceived',

  // Error
  ERROR: 'error',
} as const;

export type ServerEventType = (typeof ServerEvents)[keyof typeof ServerEvents];
