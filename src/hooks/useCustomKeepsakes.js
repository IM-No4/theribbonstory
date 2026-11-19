import { useConfigStore } from "../store/configStore";

/** True unless the admin has switched custom keepsakes off */
export const useCustomKeepsakes = () =>
  useConfigStore((s) => s.config.customKeepsakesEnabled !== false);
