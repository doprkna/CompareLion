interface ResultCardProps {
    result: {
        id: string;
        score: number;
        resultText: string;
        userA: any;
        userB: any;
        test: any;
        createdAt: string;
        shared?: boolean;
    };
    onShare?: () => void;
}
export declare function SynchResultCard({ result, onShare }: ResultCardProps): import("react").JSX.Element;
export {};
