interface GitHubProfile {
  public_repos: number;
  followers: number;
  created_at: string;
}

export async function githubByLogin(login: string): Promise<GitHubProfile | null> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(
      `https://api.github.com/users/${login}`,
      {
        headers,
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) return null;

    const data = await response.json() as any;
    return {
      public_repos: data.public_repos || 0,
      followers: data.followers || 0,
      created_at: data.created_at || '',
    };
  } catch {
    return null;
  }
}
