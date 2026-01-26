export interface FlowRewardData {
    [key: string]: any;
}
export interface FlowRewardScreenProps {
    open: boolean;
    onClose: () => void;
    data: FlowRewardData;
}
export declare function FlowRewardScreen(props: FlowRewardScreenProps): null;
