export interface LifeRewardData {
    [key: string]: any;
}
export interface LifeRewardScreenProps {
    open: boolean;
    onClose: () => void;
    data: LifeRewardData;
}
export declare function LifeRewardScreen(props: LifeRewardScreenProps): null;
