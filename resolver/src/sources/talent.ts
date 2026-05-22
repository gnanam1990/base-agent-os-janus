interface TalentProfile {
  talent_score: number;
  builder_score: number;
  connected_chains: string[];
  github_login: string | null;
}

export async function talentByAddress(address: string): Promise<TalentProfile | null> {
  try {
    const apiKey = process.env.TALENT_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://api.talentprotocol.com/api/v1/talents/${address}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) return null;

    const data = await response.json() as any;
    const profile = data.profile || data;

    return {
      talent_score: profile.score || 0,
      builder_score: profile.builderScore || 0,
      connected_chains: profile.connectedChains || [],
      github_login: profile.githubLogin || profile.github_username || null,
    };
  } catch {
    return null;
  }
}
