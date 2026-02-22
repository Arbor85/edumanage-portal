const EMERALD_BASE_URL = import.meta.env.VITE_EMERALD_BASE_URL || '';

export type EmeraldRequestOptions = {
  signal?: AbortSignal;
};

type EmeraldAccessTokenResponse = {
  accessToken?: string;
  body?: {
    accessToken?: string;
  };
};

export const getEmeraldAccessToken = async (
  cspAgreementId: string,
  { signal }: EmeraldRequestOptions = {}
): Promise<string> => {
  if (!EMERALD_BASE_URL) {
    console.warn('Emerald base URL is missing. Set VITE_EMERALD_BASE_URL in .env.');
  }

  const url = `${EMERALD_BASE_URL}/v3/microsoftCspAgreements/${encodeURIComponent(cspAgreementId)}/AccessToken?applicationName=PyraCloud`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    },
    signal
  });

  if (!response.ok) {
    throw new Error('Failed to get Emerald access token.');
  }

  const payload = (await response.json()) as EmeraldAccessTokenResponse;
  const token = payload.accessToken || payload.body?.accessToken;

  if (!token) {
    throw new Error('Emerald access token missing in response.');
  }

  return token;
};
