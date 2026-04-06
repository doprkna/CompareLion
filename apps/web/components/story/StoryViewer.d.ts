/**
 * Story Viewer Component
 * Swipe/carousel mode story viewer
 * v0.40.11 - Story Viewer 2.0 (Swipe / Carousel Mode)
 */
interface StoryPanel {
    imageUrl: string;
    caption: string;
    vibeTag: string;
    microStory: string;
    role?: string | null;
}
interface StoryViewerProps {
    panels: StoryPanel[];
    title?: string | null;
    autoplay?: boolean;
    onClose?: () => void;
}
export declare function StoryViewer({ panels, title, autoplay: initialAutoplay, onClose }: StoryViewerProps): import("react").JSX.Element;
export {};
