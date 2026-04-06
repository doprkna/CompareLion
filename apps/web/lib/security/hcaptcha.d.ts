export interface HCaptchaResponse {
    success: boolean;
    error_codes?: string[];
}
export declare function verifyHCaptcha(token: string, secret: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function isHCaptchaRequired(req: Request): boolean;
