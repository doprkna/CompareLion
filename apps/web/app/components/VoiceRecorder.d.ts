/**
 * Voice Recorder Component
 * Record voice replies using MediaRecorder API
 * v0.37.9 - Voice Replies
 */
interface VoiceRecorderProps {
    questionId: string;
    onUploadComplete?: (audioUrl: string) => void;
    onCancel?: () => void;
    className?: string;
}
export declare function VoiceRecorder({ questionId, onUploadComplete, onCancel, className }: VoiceRecorderProps): import("react").JSX.Element;
export {};
