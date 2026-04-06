export interface NewsletterProvider {
    subscribe(email: string, name?: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    unsubscribe(email: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export declare class MailerLiteProvider implements NewsletterProvider {
    private apiKey;
    private baseUrl;
    constructor(apiKey: string);
    subscribe(email: string, name?: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    unsubscribe(email: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export declare class ConvertKitProvider implements NewsletterProvider {
    private apiKey;
    private baseUrl;
    constructor(apiKey: string);
    subscribe(email: string, name?: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    unsubscribe(email: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export declare function createNewsletterProvider(): NewsletterProvider | null;
