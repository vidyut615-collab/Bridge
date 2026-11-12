"use server";

import { authenticateCredentials, clearSessionCookie, createSessionToken, getCurrentUser, setSessionCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    const user = await authenticateCredentials(email, password);
    if (!user) {
      return { error: "Invalid email or password." };
    }

    const token = await createSessionToken(user);
    await setSessionCookie(token);

    return { success: true, user };
  } catch (err: unknown) {
    console.error("Login Server Action Error:", err);
    const message = err instanceof Error ? err.message : "Authentication service error";
    return { error: `Sign-in failed: ${message}` };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function getSessionAction() {
  return await getCurrentUser();
}
