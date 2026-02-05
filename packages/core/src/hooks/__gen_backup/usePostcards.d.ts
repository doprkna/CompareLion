export declare function usePostcards(type?: 'inbox' | 'sent'): {
    postcards: any[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useSendPostcard(): {
    send: (receiverId: string, message: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
export declare function useReadPostcard(): {
    read: (postcardId: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
