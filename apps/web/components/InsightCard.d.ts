interface InsightCardProps {
    insight: {
        id: string;
        title: string;
        description: string;
        emoji: string;
        color: string;
        generatedAt: string;
    };
}
export default function InsightCard({ insight }: InsightCardProps): import("react").JSX.Element;
export {};
