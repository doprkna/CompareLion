import { LoreEntry } from '@parel/core/hooks/useLore';
interface LoreListProps {
    entries: LoreEntry[];
    loading?: boolean;
    emptyMessage?: string;
}
export declare function LoreList({ entries, loading, emptyMessage }: LoreListProps): import("react").JSX.Element;
export {};
