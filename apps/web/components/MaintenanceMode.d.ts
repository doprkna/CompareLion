interface MaintenanceModeProps {
    message?: string;
    estimatedTime?: string;
}
export declare function MaintenanceMode({ message, estimatedTime, }: MaintenanceModeProps): import("react").JSX.Element;
/**
 * Check if maintenance mode is enabled
 */
export declare function isMaintenanceMode(): boolean;
/**
 * Get maintenance message from env
 */
export declare function getMaintenanceConfig(): {
    enabled: boolean;
    message: string | undefined;
    estimatedTime: string | undefined;
};
export {};
