export interface ConversationResponse {
    id: string;
    response: string;
    modelUsed: string | null;
    toneLevel: number;
    createdAt: string;
}
export declare function useReflectionConverse(): {
    converse: (reflectionId: string, prompt: string) => Promise<ConversationResponse>;
    loading: any;
    error: any;
};
export declare function useReflectionConversation(reflectionId: string | null): {
    conversation: any;
    loading: any;
    error: any;
    reload: () => Promise<void>;
};
