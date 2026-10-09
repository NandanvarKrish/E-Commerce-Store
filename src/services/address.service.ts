import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/database.types";

export type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];
export type AddressInsert = Database["public"]["Tables"]["addresses"]["Insert"];
export type AddressUpdate = Database["public"]["Tables"]["addresses"]["Update"];

const LOCAL_STORAGE_KEY = "aura_earth_guest_addresses";

export class AddressService {
  private client = createClient();

  /**
   * Helper to retrieve guest addresses from localStorage
   */
  private getLocalAddresses(): AddressRow[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Helper to save guest addresses to localStorage
   */
  private setLocalAddresses(addresses: AddressRow[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(addresses));
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Fetch all saved addresses for the current user (or guest local storage)
   */
  async getAddresses(): Promise<AddressRow[]> {
    try {
      const {
        data: { user },
      } = await this.client.auth.getUser();

      if (!user) {
        return this.getLocalAddresses();
      }

      const { data, error } = await this.client
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error || !data) {
        // Fallback to local addresses if offline
        const local = this.getLocalAddresses();
        return local.length > 0 ? local : [];
      }

      return data;
    } catch {
      return this.getLocalAddresses();
    }
  }

  /**
   * Add a new address
   */
  async createAddress(
    address: Omit<AddressInsert, "id" | "user_id" | "created_at" | "updated_at"> & {
      is_default?: boolean;
    }
  ): Promise<AddressRow> {
    const {
      data: { user },
    } = await this.client.auth.getUser();

    // If user is guest or auth fails, save to localStorage
    if (!user) {
      const local = this.getLocalAddresses();
      if (address.is_default) {
        local.forEach((a) => (a.is_default = false));
      }
      const newAddress: AddressRow = {
        id: "addr-local-" + Date.now(),
        user_id: "guest",
        address_type: address.address_type || "shipping",
        full_name: address.full_name,
        company: address.company || null,
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country || "US",
        phone: address.phone || null,
        is_default: address.is_default ?? local.length === 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      local.unshift(newAddress);
      this.setLocalAddresses(local);
      return newAddress;
    }

    // If setting as default, clear existing default addresses
    if (address.is_default) {
      await (this.client.from("addresses") as any)
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("address_type", address.address_type || "shipping");
    }

    const { data, error } = await (this.client.from("addresses") as any)
      .insert({
        user_id: user.id,
        address_type: address.address_type || "shipping",
        full_name: address.full_name,
        company: address.company || null,
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country || "US",
        phone: address.phone || null,
        is_default: address.is_default ?? false,
      })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to create address");
    }

    return data;
  }

  /**
   * Update an existing address
   */
  async updateAddress(
    id: string,
    updates: Partial<Omit<AddressUpdate, "id" | "user_id">>
  ): Promise<AddressRow> {
    const {
      data: { user },
    } = await this.client.auth.getUser();

    if (!user || id.startsWith("addr-local-")) {
      const local = this.getLocalAddresses();
      const index = local.findIndex((a) => a.id === id);
      if (index === -1) throw new Error("Address not found");

      if (updates.is_default) {
        local.forEach((a) => (a.is_default = false));
      }

      const updated = {
        ...local[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      local[index] = updated;
      this.setLocalAddresses(local);
      return updated;
    }

    if (updates.is_default) {
      await (this.client.from("addresses") as any)
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { data, error } = await (this.client.from("addresses") as any)
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to update address");
    }

    return data;
  }

  /**
   * Delete an address
   */
  async deleteAddress(id: string): Promise<void> {
    const {
      data: { user },
    } = await this.client.auth.getUser();

    if (!user || id.startsWith("addr-local-")) {
      const local = this.getLocalAddresses().filter((a) => a.id !== id);
      this.setLocalAddresses(local);
      return;
    }

    const { error } = await this.client
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }
  }

  /**
   * Mark an address as the default
   */
  async setDefaultAddress(id: string): Promise<AddressRow> {
    return this.updateAddress(id, { is_default: true });
  }
}

export const addressService = new AddressService();
