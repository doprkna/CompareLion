type Reflection = {
    id?: string;
    userId?: string;
    content?: string | null;
    summary?: string | null;
    sentiment?: string | null;
    createdAt?: string;
    user?: {
        id: string;
        name: string | null;
        username: string | null;
    };
};
interface Props {
    data: Reflection[] | {
        count: number;
    } | null;
}
export declare function GroupReflectionList({ data }: Props): import("react").JSX.Element | null;
export {};
