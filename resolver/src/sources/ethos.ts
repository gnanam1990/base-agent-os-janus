interface EthosProfile {
  ethos_score: number;
  verified_socials: string[];
}

export async function ethosByAddress(address: string): Promise<EthosProfile | null> {
  try {
    const apiKey = process.env.ETHOS_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://api.ethos.network/v1/profile/${address}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) return null;

    const data = await response.json() as any;
    return {
      ethos_score: data.score || 0,
      verified_socials: data.verifiedSocials || [],
    };
  } catch {
    return null;
  }
}
