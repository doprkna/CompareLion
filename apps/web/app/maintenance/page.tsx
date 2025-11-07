import { MaintenanceMode, getMaintenanceConfig } from '@/components/MaintenanceMode';

export default function MaintenancePage() {
  const config = getMaintenanceConfig();
  
  return (
    <MaintenanceMode
      message={config.message}
      estimatedTime={config.estimatedTime}
    />
  );
}

