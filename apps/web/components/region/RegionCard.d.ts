import { Region } from '@parel/core/hooks/useRegions';
interface RegionCardProps {
    region: Region;
    isActive?: boolean;
    onTravel?: () => void;
    onUnlock?: () => void;
    traveling?: boolean;
    unlocking?: boolean;
}
export declare function RegionCard({ region, isActive, onTravel, onUnlock, traveling, unlocking, }: RegionCardProps): import("react").JSX.Element;
export {};
