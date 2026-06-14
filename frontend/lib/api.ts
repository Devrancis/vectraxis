const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchMatrix() {
  const res = await fetch(`${API_URL}/api/matrix`);
  if (!res.ok) throw new Error("Failed to fetch Attack Matrix");
  return res.json();
}

export async function fetchActors(industry?: string, country?: string) {
  const params = new URLSearchParams();
  if (industry) params.append("industry", industry);
  if (country) params.append("country", country);
  
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/api/actors${queryString}`);
  
  if (!res.ok) throw new Error("Failed to fetch Actors");
  return res.json();
}

export async function fetchActorDetail(actorId: string) {
  const res = await fetch(`${API_URL}/api/actors/${actorId}`);
  if (!res.ok) throw new Error("Failed to fetch Actor profile");
  return res.json();
}

export async function fetchComparison(actor1: string, actor2: string) {
  const res = await fetch(`${API_URL}/api/compare?actor1=${actor1}&actor2=${actor2}`);
  if (!res.ok) throw new Error("Failed to fetch Comparison");
  return res.json();
}