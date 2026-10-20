import { apiClient } from "@/app/core/http/api-client";
import { setAccessToken } from "@/app/core/http/token-store";
import {
  mapLoginInputToDto,
  mapLoginResponseDtoToModel,
  type LoginResponseDto,
} from "./auth.dto";
import type { ApiResponseEnvelope } from "../dto/api-response.dto";
import type { AuthTokensModel } from "@/app/models/user.model";

export interface LoginMutationInput {
  email: string;
  password: string;
}

export async function loginMutation(input: LoginMutationInput): Promise<AuthTokensModel> {
  const payload = mapLoginInputToDto(input);
  const response = await apiClient.post<ApiResponseEnvelope<LoginResponseDto>>("/auth/login", payload);
  const data = response.data?.data;
  const model = mapLoginResponseDtoToModel(data);
  setAccessToken(model.accessToken);
  localStorage.setItem("user", JSON.stringify(model.user));
  return model;
}
