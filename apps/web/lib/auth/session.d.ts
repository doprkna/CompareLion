export interface SessionPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export declare function createSession(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string>;
export declare function verifySession(token: string): Promise<SessionPayload | null>;
export declare function setSessionCookie(token: string): Promise<void>;
export declare function clearSessionCookie(): Promise<void>;
export declare function getSessionFromCookie(): Promise<SessionPayload | null>;
