/**
 * Session Management Types
 */

export interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface SessionsResponse {
  status: number;
  message: string;
  data: {
    sessions: Session[];
    count: number;
  };
}

export interface RevokeAllSessionsResponse {
  status: number;
  message: string;
  data: {
    sessionsRevoked: number;
  };
}
