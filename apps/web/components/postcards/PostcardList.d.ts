interface PostcardListProps {
    postcards: any[];
    type: 'inbox' | 'sent';
    loading?: boolean;
    onOpen: (postcard: any) => void;
    onRead?: (postcardId: string) => void;
    reading?: boolean;
}
export declare function PostcardList({ postcards, type, loading, onOpen, onRead, reading, }: PostcardListProps): import("react").JSX.Element;
export {};
