import { supabase } from "./supabase";

export const log = async (type: "error" | "info", text: string) => {
  await supabase.from("logs").insert({
    text,
    type,
  });
};
