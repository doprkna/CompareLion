export interface ConversationResponse {
    id: string;
    response: string;
    modelUsed: string | null;
    toneLevel: number;
    createdAt: string;
}
export declare function useReflectionConverse(): {
    converse: (reflectionId: string, prompt: string) => Promise<ConversationResponse>;
    loading: boolean;
    error: string | null;
};
export declare function useReflectionConversation(reflectionId: string | null): {
    conversation: ConversationResponse | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
