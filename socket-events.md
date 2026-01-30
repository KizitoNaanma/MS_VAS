## WebSocket Integration

### Connection Setup

```typescript
import { io } from 'socket.io-client';

const socket = io('http://your-api-url', {
  withCredentials: true,
});

socket.on('connected', () => {
  console.log('Connected to WebSocket server');
});
```

### Join Group Room

After joining a group via HTTP, connect to the group's WebSocket room to receive real-time updates.

**Emit Event:**

```typescript
socket.emit('joinGroup', {
  groupId: string,
});
```

**Listen Events:**

```typescript
// Success event when another member joins
socket.on(
  'groupMemberAdded',
  (payload: {
    message: string; // e.g., "User John Doe joined the group"
  }) => {
    // Handle new member joined
  },
);

// Error event if join fails
socket.on('error', (payload: { event: string; message: string }) => {
  // Handle error (e.g., not a group member)
});
```

### Receive Group Messages

Listen for new messages in the group.

```typescript
socket.on(
  'groupMessageReceived',
  (payload: { message: SimpleMessageEntity }) => {
    // Handle new message
    // message includes: content, sender, timestamp, attachments, etc.
  },
);
```

### Typing Indicators

Emit and listen for typing status in a group chat:

**Emit Event:**

```typescript
// Emit when user starts typing
socket.emit('startTyping', {
  groupId: string,
});
```

**Listen Event:**

```typescript
// Listen for other users typing
socket.on(
  'peerStartedTyping',
  (payload: {
    message: string; // e.g., "John Doe is typing..."
  }) => {
    // Handle typing indicator
    // e.g., show "{user} is typing..." message
  },
);
```

# WebSocket Integration Guide for Group Chat (React & Next.js)

This guide outlines how to implement real-time group chat functionality in a React/Next.js application.

## Socket Context Setup

First, create a WebSocket context to manage the socket connection:

```typescript:src/contexts/SocketContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL!, {
      withCredentials: true
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connected', () => {
      console.log('Connected to WebSocket server');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
```

## Group Chat Hook

Create a custom hook to manage group chat functionality:

```typescript:src/hooks/useGroupChat.ts
import { useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface Message {
  id: string;
  content: string;
  groupId: string;
  sender: {
    id: string;
    fullName: string;
  };
  attachments?: {
    url: string;
    type: string;
  }[];
  createdAt: string;
}

interface UseGroupChatProps {
  groupId: string;
  onNewMessage?: (message: Message) => void;
  onMemberJoined?: (message: string) => void;
  onTypingStarted?: (message: string) => void;
  onError?: (error: { event: string; message: string }) => void;
}

export const useGroupChat = ({
  groupId,
  onNewMessage,
  onMemberJoined,
  onTypingStarted,
  onError
}: UseGroupChatProps) => {
  const { socket } = useSocket();

  const joinGroup = useCallback(() => {
    if (socket) {
      socket.emit('joinGroup', { groupId });
    }
  }, [socket, groupId]);

  const startTyping = useCallback(() => {
    if (socket) {
      socket.emit('startTyping', { groupId });
    }
  }, [socket, groupId]);

  useEffect(() => {
    if (!socket) return;

    // Join group room
    joinGroup();

    // Listen for new messages
    socket.on('groupMessageReceived', (payload: { message: Message }) => {
      onNewMessage?.(payload.message);
    });

    // Listen for new members
    socket.on('groupMemberAdded', (payload: { message: string }) => {
      onMemberJoined?.(payload.message);
    });

    // Listen for typing indicators
    socket.on('peerStartedTyping', (payload: { message: string }) => {
      onTypingStarted?.(payload.message);
    });

    // Handle errors
    socket.on('error', (error: { event: string; message: string }) => {
      onError?.(error);
    });

    // Cleanup listeners
    return () => {
      socket.off('groupMessageReceived');
      socket.off('groupMemberAdded');
      socket.off('peerStartedTyping');
      socket.off('error');
    };
  }, [socket, groupId, onNewMessage, onMemberJoined, onTypingStarted, onError]);

  return { joinGroup, startTyping };
};
```

Example usage in a component:

```typescript:src/components/GroupChat.tsx
export const GroupChat: React.FC<GroupChatProps> = ({ groupId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string>('');

  const { joinGroup, startTyping } = useGroupChat({
    groupId,
    onNewMessage: (message) => {
      setMessages((prev) => [...prev, message]);
      setTypingUsers(''); // Clear typing indicator when message received
    },
    onMemberJoined: (message) => {
      toast.success(message);
    },
    onTypingStarted: (message) => {
      setTypingUsers(message);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Handle input changes
  const handleInputChange = () => {
    startTyping(); // Emit typing event
  };

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          <strong>{message.sender.fullName}:</strong> {message.content}
        </div>
      ))}

      {/* Typing indicator */}
      {typingUsers && (
        <div className="typing-indicator">
          {typingUsers}
        </div>
      )}

      {/* Chat input */}
      <input
        type="text"
        onChange={handleInputChange}
        placeholder="Type a message..."
      />
    </div>
  );
};
```

## App Setup

Wrap your app with the SocketProvider:

```typescript:src/pages/_app.tsx
import { SocketProvider } from '@/contexts/SocketContext';

function MyApp({ Component, pageProps }) {
  return (
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  );
}

export default MyApp;
```

## Best Practices for React/Next.js

1. Always clean up WebSocket listeners in useEffect cleanup functions
2. Use the Context API for socket management to avoid multiple connections
3. Implement proper loading and error states using React state
4. Use TypeScript for better type safety
5. Handle component unmounting gracefully
6. Consider implementing reconnection logic with exponential backoff
7. Use environment variables for WebSocket URLs
8. Implement proper error boundaries for WebSocket-related errors
