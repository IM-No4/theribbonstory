import { useEffect } from "react";
import { useConfigStore } from "../store/configStore";

/**
 * Delivery charges managed in the admin panel (served with /config).
 * Returns null if they couldn't be loaded; callers must not assume any amount.
 * Re-reads them on mount so cart and checkout show what the server will charge.
 */
export function useDeliveryCharges() {
  const charges = useConfigStore((s) => s.config.shipping || null);
  const fetchConfig = useConfigStore((s) => s.fetchConfig);
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);
  return charges;
}
