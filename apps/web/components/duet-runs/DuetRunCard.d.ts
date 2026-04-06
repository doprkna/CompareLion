interface DuetRunCardProps {
    duetRun: {
        id: string;
        missionKey: string;
        title: string;
        description: string;
        type: 'reflect' | 'collect' | 'challenge';
        durationSec: number;
        startedAt: string;
        remainingSec: number;
        partner: {
            id: string;
            name: string;
            image: string | null;
        };
        myProgress: number;
        partnerProgress: number;
        bothCompleted: boolean;
    };
    onProgress?: (duetRunId: string, progress: number) => Promise<void>;
    onComplete?: (duetRunId: string) => Promise<void>;
    updating?: boolean;
}
export declare function DuetRunCard({ duetRun, onProgress, onComplete, updating }: DuetRunCardProps): import("react").JSX.Element;
export {};
