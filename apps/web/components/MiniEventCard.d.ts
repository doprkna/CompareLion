type MiniEvent = {
    id: string;
    title: string;
    description?: string | null;
    rewardText?: string | null;
    tags?: string[] | null;
    region: string;
};
export declare function MiniEventCard({ event }: {
    event: MiniEvent;
}): import("react").JSX.Element;
export {};
