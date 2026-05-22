interface FarcasterUser {
  fid: number;
  username: string;
  verifications: string[];
}

export async function farcasterByAddress(address: string): Promise<FarcasterUser | null> {
  try {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
      {
        headers: { api_key: apiKey },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) return null;

    const data = await response.json() as Record<string, any[]>;
    const users = data[address.toLowerCase()] || data[address] || [];

    if (users.length === 0) return null;

    const user = users[0];
    return {
      fid: user.fid,
      username: user.username,
      verifications: user.verifications || [],
    };
  } catch {
    return null;
  }
}
