"use server";

import { randomInt } from "crypto";
import { createClient } from "@/lib/supabase/server";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I, easier to type
const CODE_LENGTH = 6;
const TTL_MINUTES = 10;

export type LinkCodeState = {
  code: string | null;
  expiresAt: string | null;
  error: string | null;
};

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return code;
}

export async function generateLinkCode(): Promise<LinkCodeState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { code: null, expiresAt: null, error: "Sessão expirada." };

  const code = generateCode();
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60_000).toISOString();

  const { error } = await supabase
    .from("link_codes")
    .insert({ code, user_id: user.id, expires_at: expiresAt });
  if (error) return { code: null, expiresAt: null, error: error.message };

  return { code, expiresAt, error: null };
}
