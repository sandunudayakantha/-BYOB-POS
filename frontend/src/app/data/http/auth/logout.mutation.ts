import { apiClient } from "@/app/core/http/api-client";
import { clearAccessToken } from "@/app/core/http/token-store";

export async function logoutMutation(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearAccessToken();
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
  }
}
