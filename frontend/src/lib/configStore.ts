export type ClinicianRole = "emergency_physician" | "gp" | "specialist" | "pharmacist" | "nurse" | "ward_doctor" | "admin" | "privacy_officer";

export interface AppConfig {
  dataSource: "mock" | "live";
  fhirBaseUrl: string;
  gpConnectEndpoint: string;
  apiKey: string;
  groqApiKey: string;
  currentClinicianId: string;
  currentClinicianName: string;
  currentClinicianRole: ClinicianRole;
  tier3Authorized?: boolean;
}

let appConfig: AppConfig = {
  dataSource: "mock",
  fhirBaseUrl: "",
  gpConnectEndpoint: "",
  apiKey: "",
  groqApiKey: process.env.GROQ_API_KEY || "",
  currentClinicianId: "clin-henderson-001",
  currentClinicianName: "Dr. Henderson",
  currentClinicianRole: "specialist",
  tier3Authorized: false,
};

export function getConfig(): AppConfig {
  return { ...appConfig };
}

export function updateConfig(partial: Partial<AppConfig>): AppConfig {
  appConfig = { ...appConfig, ...partial };
  return { ...appConfig };
}
