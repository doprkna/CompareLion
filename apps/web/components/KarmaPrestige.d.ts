/**
 * KarmaPrestige Component
 *
 * Displays karma and prestige scores for user identity.
 * Karma = moral flavor (what you do/did/would do)
 * Prestige = capability/status (what you can do/represent)
 */
interface KarmaPrestigeProps {
    karma: number;
    prestige: number;
    className?: string;
    variant?: 'full' | 'compact';
}
export default function KarmaPrestige({ karma, prestige, className, variant }: KarmaPrestigeProps): import("react").JSX.Element;
export {};
