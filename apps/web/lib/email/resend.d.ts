export declare function sendEmail({ to, subject, text, }: {
    to: string;
    subject: string;
    text: string;
}): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
}>;
export declare function sendEmailVerification({ to, verificationUrl, }: {
    to: string;
    verificationUrl: string;
}): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
}>;
export declare function sendPasswordReset({ to, resetUrl, }: {
    to: string;
    resetUrl: string;
}): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
}>;
