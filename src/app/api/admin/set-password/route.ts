import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/** TEMP: Quick GET to prove the route is registered */
export async function GET() {
  return NextResponse.json(
    { ok: true, route: "/api/admin/set-password" },
    { status: 200 }
  );
}

/**
 * POST /api/admin/set-password
 * Headers: x-admin-token: <ADMIN_TOKEN>
 * Body: { userId?: string, email?: string, password: string, confirmEmail?: boolean }
 */
export async function POST(req: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  const header = req.headers.get("x-admin-token");
  if (!adminToken || header !== adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, email, password, confirmEmail = true } = await req.json();

  if (!password || (!userId && !email)) {
    return NextResponse.json(
      { error: "Provide password and either userId or email." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdmin();

  let targetId = userId as string | undefined;
  if (!targetId && email) {
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (error) {
      return NextResponse.json(
        { error: `Lookup failed: ${error.message}` },
        { status: 500 }
      );
    }
    const match = data.users.find(
      (u) => (u.email ?? "").toLowerCase() === String(email).toLowerCase()
    );
    if (!match) {
      return NextResponse.json(
        { error: `No user found with email ${email}` },
        { status: 404 }
      );
    }
    targetId = match.id;
  }

  const { data: updated, error: updateErr } =
    await admin.auth.admin.updateUserById(targetId!, {
      password,
      ...(confirmEmail ? { email_confirm: true } : {}),
    });

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    id: updated.user?.id,
    email: updated.user?.email,
    message: "Password set. User can sign in with email + password.",
  });
}
