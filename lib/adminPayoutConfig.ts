export interface AdminPayoutSettings {
  upiId: string;
  payeeName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: "CURRENT" | "SAVINGS";
  branch: string;
  customQrUrl?: string;
  updatedAt?: string;
}

export const DEFAULT_ADMIN_PAYOUT_SETTINGS: AdminPayoutSettings = {
  upiId: "finsocap@icici",
  payeeName: "FinSoCap Financial Services Pvt Ltd",
  bankName: "ICICI Bank",
  accountNumber: "000405001234",
  ifscCode: "ICIC0000004",
  accountType: "CURRENT",
  branch: "Connaught Place, New Delhi",
  updatedAt: new Date().toISOString(),
};

const STORAGE_KEY = "finsocap_admin_payout_settings_v1";

export function getAdminPayoutSettings(): AdminPayoutSettings {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PAYOUT_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_ADMIN_PAYOUT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return DEFAULT_ADMIN_PAYOUT_SETTINGS;
}

export function saveAdminPayoutSettings(settings: AdminPayoutSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...settings,
        updatedAt: new Date().toISOString(),
      })
    );
    window.dispatchEvent(new CustomEvent("finsocap-payout-settings-updated"));
  } catch (e) {}
}

