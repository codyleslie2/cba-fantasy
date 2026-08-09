"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME,authCookieOptions,clearAuthCookieOptions,createSessionToken,safeEqual,sanitizeNextPath } from "@/lib/site-auth";
export async function loginAction(formData:FormData){const next=sanitizeNextPath(formData.get("next"));const supplied=String(formData.get("password")??"");const password=process.env.CBA_SITE_PASSWORD;const secret=process.env.CBA_AUTH_SECRET;if(!password||!secret)redirect(`/login?error=config&next=${encodeURIComponent(next)}`);if(!safeEqual(supplied,password))redirect(`/login?error=incorrect&next=${encodeURIComponent(next)}`);(await cookies()).set(AUTH_COOKIE_NAME,await createSessionToken(secret),authCookieOptions());redirect(next);}
export async function logoutAction(){(await cookies()).set(AUTH_COOKIE_NAME,"",clearAuthCookieOptions());redirect("/login");}
