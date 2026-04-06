interface XpBarProps {
    variant?: 'header' | 'dropdown';
    userId?: string;
}
/** Same source as Profile: GET /api/progression/stats (getUserStats + levelCurve). */
export declare function XpBar({ variant }: XpBarProps): import("react").JSX.Element | null;
export default XpBar;
