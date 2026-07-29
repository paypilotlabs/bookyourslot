import { ApiResponse } from "@calcom/platform-types";
import { Request } from "express";

export interface CalendarApp {
  save(state: string, code: string, origin: string): Promise<{ url: string }>;
  check(userId: number): Promise<ApiResponse>;
}

export interface CredentialSyncCalendarApp {
  save(userId: number, userEmail: string, username: string, password: string): Promise<{ status: string }>;
  check(userId: number): Promise<ApiResponse>;
}

export interface OAuthCalendarApp extends CalendarApp {
  connect(authorization: string, req: Request): Promise<ApiResponse<{ authUrl: string }>>;
}
