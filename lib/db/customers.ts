import { EMPTY_CUSTOMER_STATS } from "@/lib/admin/fallbacks";
import { guardedSupabaseRead } from "@/lib/db/read-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type CustomerRecord = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateCustomerInput = {
  fullName: string;
  email: string;
  phone?: string;
  shippingAddress?: string;
};

/**
 * One row per person, matched on email.
 *
 * Checkout used to insert unconditionally, so every order minted a fresh
 * customer. Albert Krane came back on 27 Aug, 29 Aug and 1 Sep for the same
 * engine and appeared as three unrelated customers; Joseph Silliman's three
 * attempts in the same minute made three more. Repeat buyers -- the ones worth
 * chasing -- were invisible in the data unless someone grouped by email by hand.
 *
 * Details are refreshed from the newest checkout, because a returning customer
 * who has moved must not be shipped to their old address. That is only safe
 * because the order now records its own shipment_destination at creation (see
 * createOrderRecord), so updating the customer no longer rewrites where past
 * orders went.
 *
 * There is no unique index on email, so two simultaneous checkouts from the
 * same address could still both insert. That is a narrow race, it produces the
 * old behaviour rather than a failure, and closing it properly needs a
 * migration that de-duplicates the existing rows first.
 */
export async function upsertCustomerByEmail(
  input: CreateCustomerInput
): Promise<CustomerRecord> {
  const supabase = getSupabaseAdmin();
  const email = input.email.trim().toLowerCase();

  const { data: existing, error: lookupError } = await supabase
    .from("customers")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // A failed lookup must not fail the sale. Fall through to the insert and
  // accept a duplicate row rather than losing the order.
  if (!lookupError && existing) {
    const current = existing as CustomerRecord;
    const { data: updated, error: updateError } = await supabase
      .from("customers")
      .update({
        full_name: input.fullName || current.full_name,
        phone: input.phone ?? current.phone,
        shipping_address: input.shippingAddress ?? current.shipping_address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id)
      .select("*")
      .single();

    if (!updateError && updated) return updated as CustomerRecord;
    return current; // update failed; the existing row is still the right one
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      full_name: input.fullName,
      email,
      phone: input.phone ?? null,
      shipping_address: input.shippingAddress ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as CustomerRecord;
}

/** @deprecated Use upsertCustomerByEmail. Kept so nothing silently regresses. */
export async function createCustomer(
  input: CreateCustomerInput
): Promise<CustomerRecord> {
  return upsertCustomerByEmail(input);
}

export async function getCustomerById(id: string): Promise<CustomerRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as CustomerRecord | null;
}

export async function listCustomers(limit = 100): Promise<CustomerRecord[]> {
  return guardedSupabaseRead("listCustomers", [], async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as CustomerRecord[];
  });
}

export async function getCustomerStats() {
  return guardedSupabaseRead("getCustomerStats", EMPTY_CUSTOMER_STATS, async () => {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentCount, error: recentError } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo);

    if (recentError) throw recentError;

    return {
      totalCustomers: count ?? 0,
      newCustomers30d: recentCount ?? 0,
    };
  });
}
