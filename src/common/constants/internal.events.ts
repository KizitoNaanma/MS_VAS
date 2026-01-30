export const InternalEvents = {
  // Message Events
  MESSAGE: {
    CREATED: 'message.created',
    UPDATED: 'message.updated',
    DELETED: 'message.deleted',
  },

  // Group Events
  GROUP: {
    CREATED: 'group.created',
    UPDATED: 'group.updated',
    DELETED: 'group.deleted',
    MEMBER_JOINED: 'group.member.joined',
    MEMBER_LEFT: 'group.member.left',
    MEMBER_REMOVED: 'group.member.removed',
    OWNER_CHANGED: 'group.owner.changed',
  },

  // Call Events
  CALL: {
    VIDEO_STARTED: 'call.video.started',
    VIDEO_ENDED: 'call.video.ended',
    VOICE_STARTED: 'call.voice.started',
    VOICE_ENDED: 'call.voice.ended',
  },

  // User Events
  USER: {
    CONNECTED: 'user.connected',
    DISCONNECTED: 'user.disconnected',
    STATUS_CHANGED: 'user.status.changed',
  },
} as const;

export type InternalEventType =
  (typeof InternalEvents)[keyof typeof InternalEvents];
