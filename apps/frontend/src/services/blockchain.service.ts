const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}

/**
 * Get latest blockchain value from backend API
 */
export async function getBlockchainValue() {
  const res = await fetch(`${BACKEND_URL}/blockchain/value`, {
    method: "GET",
    cache: "no-store", // selalu ambil data terbaru
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to fetch blockchain value" }));
    throw new Error(error.message || "Failed to fetch blockchain value");
  }

  return res.json();
}

/**
 * Get blockchain events from backend API
 */
export async function getBlockchainEvents(params?: {
  fromBlock?: string;
  toBlock?: string;
  limit?: number;
  offset?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.fromBlock) queryParams.append("fromBlock", params.fromBlock);
  if (params?.toBlock) queryParams.append("toBlock", params.toBlock);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());

  const url = `${BACKEND_URL}/blockchain/events${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to fetch blockchain events" }));
    throw new Error(error.message || "Failed to fetch blockchain events");
  }

  return res.json();
}
