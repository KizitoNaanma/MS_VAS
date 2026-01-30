export interface PublicRequest extends Request {
  apiKey: string;
}

export interface RoleRequest extends PublicRequest {
  currentRoleCodes: string[];
}

export interface ProtectedRequest extends RoleRequest {
  user: Record<string, any>;
  accessToken: string;
}
