interface MessageInputProps {
    onSend: (content: string) => void | Promise<void>;
    placeholder?: string;
    maxLength?: number;
}
export declare function MessageInput({ onSend, placeholder, maxLength, }: MessageInputProps): import("react").JSX.Element;
export {};
