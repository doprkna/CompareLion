interface SubmitFormProps {
    onSubmit: (data: {
        title: string;
        type: 'question' | 'mission' | 'item' | 'other';
        content: string;
        rewardXP?: number;
        rewardKarma?: number;
    }) => Promise<void>;
    loading?: boolean;
}
export declare function CommunitySubmitForm({ onSubmit, loading }: SubmitFormProps): import("react").JSX.Element;
export {};
