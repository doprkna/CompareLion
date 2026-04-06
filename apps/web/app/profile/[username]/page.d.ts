interface ProfilePageProps {
    params: {
        username: string;
    };
}
export default function PublicProfilePage({ params }: ProfilePageProps): Promise<import("react").JSX.Element>;
export declare function generateMetadata({ params }: ProfilePageProps): Promise<{
    title: string;
    description: string;
}>;
export {};
