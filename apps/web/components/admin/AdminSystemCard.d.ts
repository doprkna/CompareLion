/**
 * AdminSystemCard Component
 *
 * Displays a card for a system in the Admin Dev Lab
 * v0.30.0 - Admin God View
 */
interface AdminSystemCardProps {
    name: string;
    route: string;
    modelCount: number;
    status: 'active' | 'empty' | 'error';
}
export declare function AdminSystemCard({ name, route, modelCount, status }: AdminSystemCardProps): import("react").JSX.Element;
export {};
