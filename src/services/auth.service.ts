import { BaseService } from "./base.service";
import { createClient } from "@/lib/supabase/client";
import type { ApiResponse } from "@/types/common.types";
import type { User } from "@supabase/supabase-js";

export class AuthService extends BaseService {
  private supabase = createClient();

  /**
   * Retrieves the current authenticated user session.
   */
  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    return this.handleOperation(async () => {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();

      if (error) throw error;
      return user;
    }, "Failed to retrieve current user");
  }

  /**
   * Signs in user with email and password.
   */
  async signInWithPassword(email: string, password: string): Promise<ApiResponse<User | null>> {
    return this.handleOperation(async () => {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data.user;
    }, "Failed to sign in");
  }

  /**
   * Signs up a new user with email and password.
   */
  async signUp(email: string, password: string, fullName?: string): Promise<ApiResponse<User | null>> {
    return this.handleOperation(async () => {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return data.user;
    }, "Failed to sign up");
  }

  /**
   * Signs out current user.
   */
  async signOut(): Promise<ApiResponse<void>> {
    return this.handleOperation(async () => {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    }, "Failed to sign out");
  }
}

export const authService = new AuthService();
