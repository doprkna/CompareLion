interface Props {
    id: string;
    name: string;
    description?: string | null;
    visibility: 'private' | 'public';
    transparency: 'summary' | 'full' | 'hidden';
    role?: string;
}
export declare function GroupCard({ id, name, description, visibility, transparency, role }: Props): import("react").JSX.Element;
export {};
