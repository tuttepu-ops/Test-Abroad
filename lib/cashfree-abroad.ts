import "server-only";
const base = process.env.CASHFREE_ENV === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
export async function cashfree(path: string, options: RequestInit = {}) {
 const id = process.env.CASHFREE_CLIENT_ID; const secret = process.env.CASHFREE_CLIENT_SECRET;
 if (!id || !secret) throw new Error("Cashfree merchant keys not configured");
 const response = await fetch(base + path, { ...options, cache: "no-store", headers: { "x-client-id":id,"x-client-secret":secret,"x-api-version":process.env.CASHFREE_API_VERSION || "2025-01-01", "Content-Type":"application/json", ...options.headers }});
 const result = await response.json();
 if (!response.ok) throw new Error(result.message || `Cashfree returned ${response.status}`);
 return result;
}
