// src/app/api/admin/create-user/route.ts
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/admin/create-user
 * Headers: x-admin-token: <ADMIN_TOKEN>
 * Body: { email, password, displayName?, username? }
 */
export async function POST(req: Request) {
  const token = process.env.ADMIN_TOKEN;
  const header = req.headers.get("x-admin-token");
  if (!token || header !== token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, password, displayName, username } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdmin();

  // 1) Create auth user (mark email as confirmed for local testing convenience)
  const { data: created, error: createErr } = await admin.auth.admin.createUser(
    {
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName ?? null,
        username: username ?? null,
      },
    }
  );
  if (createErr || !created?.user) {
    return NextResponse.json(
      { error: createErr?.message ?? "createUser failed" },
      { status: 400 }
    );
  }

  const userId = created.user.id;

  // 2) Upsert profile row (enforces your unique username index)
  if (displayName || username) {
    const { error: upsertErr } = await admin
      .from("profiles")
      .upsert({
        id: userId,
        display_name: displayName ?? null,
        username: username ?? null,
      })
      .eq("id", userId);

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 400 });
    }
  }

  return NextResponse.json(
    {
      id: userId,
      email,
      displayName: displayName ?? null,
      username: username ?? null,
    },
    { status: 201 }
  );
}
