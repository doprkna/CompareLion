/**
 * Ambient Environment Manager
 * Provides dynamic background, particles, and ambient audio for each game mode
 * v0.26.14 - Dynamic Environment & Ambient System
 */
import { AmbientMode } from '@parel/core/config';
interface AmbientManagerProps {
    mode: AmbientMode;
    className?: string;
}
export declare function AmbientManager({ mode, className }: AmbientManagerProps): import("react").JSX.Element;
export {};
