const encoder = new TextEncoder();
export const AUTH_COOKIE_NAME = "cba_session";
export const AUTH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export function authCookieOptions(production = process.env.NODE_ENV === "production") { return { httpOnly:true, sameSite:"lax" as const, secure:production, path:"/", maxAge:AUTH_MAX_AGE_SECONDS }; }
export function clearAuthCookieOptions(production = process.env.NODE_ENV === "production") { return { ...authCookieOptions(production), maxAge:0, expires:new Date(0) }; }
export function safeEqual(left:string,right:string) { const a=encoder.encode(left),b=encoder.encode(right);let mismatch=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)mismatch|=(a[i]??0)^(b[i]??0);return mismatch===0; }
function base64Url(bytes:Uint8Array){let binary="";for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary).replaceAll("+","-").replaceAll("/","_").replace(/=+$/,"");}
async function sign(value:string,secret:string){const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode(value))));}
export async function createSessionToken(secret:string,now=Date.now()){const expires=String(Math.floor(now/1000)+AUTH_MAX_AGE_SECONDS);return `${expires}.${await sign(expires,secret)}`;}
export async function verifySessionToken(token:string|undefined,secret:string|undefined,now=Date.now()){if(!token||!secret)return false;const[expires,signature,extra]=token.split(".");if(!expires||!signature||extra||!/^\d+$/.test(expires)||Number(expires)<=Math.floor(now/1000))return false;return safeEqual(signature,await sign(expires,secret));}
export function sanitizeNextPath(value:FormDataEntryValue|string|null|undefined){const path=typeof value==="string"?value:"";return path.startsWith("/")&&!path.startsWith("//")&&!path.startsWith("/login")?path:"/";}
export function isProtectedPath(pathname:string){return pathname==="/"||["/history","/standings","/head-to-head","/records","/owners","/graveyard","/analytics","/recaps"].some(route=>pathname===route||pathname.startsWith(`${route}/`));}
