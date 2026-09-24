import { BaseService } from "./base.service";
import { createClient } from "@/utils/supabase/client";
import type { ApiResponse } from "@/types/common.types";
import type { Database } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export class AuthService extends BaseService {
  private get supabase() {
    return createClient();
  }

  /**
   * Retrieves the current authenticated user from Supabase.
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
   * Retrieves the current user's database profile (with role, name, phone, etc.).
   */
  async getCurrentProfile(): Promise<ApiResponse<Profile | null>> {
    return this.handleOperation(async () => {
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser();

      if (userError || !user) return null;

      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    }, "Failed to retrieve user profile");
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
   * Signs up a new customer user with email, password, and full name.
   */
  async signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<ApiResponse<{ user: User | null; session: unknown }>> {
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
      return { user: data.user, session: data.session };
    }, "Failed to sign up");
  }

  /**
   * Requests a password recovery email.
   */
  async resetPassword(email: string, redirectTo?: string): Promise<ApiResponse<void>> {
    return this.handleOperation(async () => {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          redirectTo ||
          (typeof window !== "undefined"
            ? `${window.location.origin}/reset-password`
            : undefined),
      });

      if (error) throw error;
    }, "Failed to send password reset email");
  }

  /**
   * Updates user password (e.g. after password reset link clicked).
   */
  async updatePassword(password: string): Promise<ApiResponse<User | null>> {
    return this.handleOperation(async () => {
      const { data, error } = await this.supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      return data.user;
    }, "Failed to update password");
  }

  /**
   * Updates profile information for the authenticated user.
   */
  async updateProfile(updates: ProfileUpdate): Promise<ApiResponse<Profile>> {
    return this.handleOperation(async () => {
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser();

      if (userError || !user) throw new Error("Authentication required");

      const { data, error } = await this.supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }, "Failed to update profile");
  }

  /**
   * Signs out the current user session.
   */
  async signOut(): Promise<ApiResponse<void>> {
    return this.handleOperation(async () => {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    }, "Failed to sign out");
  }
}

export const authService = new AuthService();
