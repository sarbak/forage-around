import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { NewEmailSignup, saveEmailSignup } from "./emailSignup";

// Anon key is public by design; row-level security guards the table.
const URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
const ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const communityEnabled = !!(URL && ANON);
const supabase = communityEnabled
  ? createClient(URL as string, ANON as string, { auth: { persistSession: false } })
  : null;

export type Submission = {
  id: string;
  created_at: string;
  kind: "observation" | "new_tree";
  ff_location_id?: string | null;
  species?: string | null;
  lat?: number | null;
  lng?: number | null;
  note?: string | null;
  plan?: string | null;
  photo_url?: string | null;
  author_name?: string | null;
};

export type NewSubmission = {
  kind: "observation" | "new_tree";
  ff_location_id?: string | null;
  species?: string | null;
  lat?: number | null;
  lng?: number | null;
  note?: string | null;
  plan?: string | null;
  photo_url?: string | null;
  author_name?: string | null;
  contribute_to_ff?: boolean;
};

export async function getRecentSubmissions(limit = 12): Promise<Submission[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as Submission[];
}

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.includes(",") ? b64.split(",")[1] : b64; // strip data: prefix
  const bin =
    typeof atob === "function"
      ? atob(clean)
      : // minimal fallback if atob is unavailable
        (() => {
          const T = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
          let s = "";
          const c = clean.replace(/=+$/, "");
          let bits = 0,
            val = 0;
          for (const ch of c) {
            const idx = T.indexOf(ch);
            if (idx < 0) continue;
            val = (val << 6) | idx;
            bits += 6;
            if (bits >= 8) {
              bits -= 8;
              s += String.fromCharCode((val >> bits) & 0xff);
            }
          }
          return s;
        })();
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Upload a picked photo (base64) to the public submission-photos bucket.
export async function uploadPhoto(base64: string, mime = "image/jpeg"): Promise<string | null> {
  if (!supabase) return null;
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  const name = `${Date.now()}-${Math.floor(Math.random() * 1e9)}.${ext}`;
  const { error } = await supabase.storage
    .from("submission-photos")
    .upload(name, base64ToBytes(base64), { contentType: mime, upsert: false });
  if (error) return null;
  return supabase.storage.from("submission-photos").getPublicUrl(name).data.publicUrl;
}

// Insert a submission. Always lands as 'pending' (held for review).
export async function submit(payload: NewSubmission): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("submissions").insert([{ ...payload, status: "pending" }]);
  return !error;
}

export async function submitEmailSignup(payload: NewEmailSignup): Promise<boolean> {
  if (!supabase) return false;
  return saveEmailSignup(payload, async (row) => {
    const { error } = await supabase.from("email_signups").insert([row]);
    return !error;
  });
}
