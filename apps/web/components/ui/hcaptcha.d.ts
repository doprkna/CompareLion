interface HCaptchaProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: (error: any) => void;
    onExpire?: () => void;
    theme?: 'light' | 'dark';
    size?: 'compact' | 'normal';
    className?: string;
}
export interface HCaptchaRef {
    reset: () => void;
    execute: () => void;
}
export declare const HCaptchaWidget: import("react").ForwardRefExoticComponent<HCaptchaProps & import("react").RefAttributes<HCaptchaRef>>;
export {};
