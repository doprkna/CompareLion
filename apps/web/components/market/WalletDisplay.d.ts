import { WalletBalance } from '@parel/core/hooks/useMarket';
interface WalletDisplayProps {
    wallets: WalletBalance[];
    loading?: boolean;
}
export declare function WalletDisplay({ wallets, loading }: WalletDisplayProps): import("react").JSX.Element;
export {};
