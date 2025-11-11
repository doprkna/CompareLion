import PlaceholderPage from "@/components/PlaceholderPage";
import { isAdminView } from "@/lib/utils/isAdminView";

export default function Page() {
  if (!isAdminView()) return null;
  return <PlaceholderPage name="Regional Events" />;
}
