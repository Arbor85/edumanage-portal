const PLATFORM_BASE_URL =
  import.meta.env.VITE_PLATFORM_PORTAL_BASE_URL || 'https://portal.platform.softwareone.com/public/v1';
const PLATFORM_TOKEN = import.meta.env.VITE_PLATFORM_PORTAL_TOKEN || '';

const ORDER_SELECT = '+audit';
const ORDER_FILTER = 'group.buyers';
const ORDER_SORT = '-audit.created.at';
const SUBSCRIPTION_DETAILS_SELECT =
  'agreement,lines,lines.item.terms,lines.item.unit,lines.item.quantityNotApplicable,agreement.listing.priceList,licensee,buyer,seller,audit,split.allocations,product.settings.splitBilling,product.settings.subscriptionCessation,agreement.subscriptions,agreement.parameters,agreement.lines';
const AUTHORIZATION_DETAILS_SELECT = 'owner.address';

export type PlatformRequestOptions = {
  signal?: AbortSignal;
};

export type SubscriptionOrdersOptions = PlatformRequestOptions & {
  offset?: number;
  limit?: number;
};

const getAuthHeaders = () => {
  if (!PLATFORM_TOKEN) {
    console.warn('Platform portal token is missing. Set VITE_PLATFORM_PORTAL_TOKEN in .env.');
  }
  return {
    Authorization: `Bearer ${PLATFORM_TOKEN}`
  };
};

const fetchPlatformJson = async <T>(url: string, options: PlatformRequestOptions = {}) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    signal: options.signal
  });

  if (!response.ok) {
    throw new Error('Platform portal request failed.');
  }

  return (await response.json()) as T;
};

export const getSubscriptionOrders = async <T>(
  subscriptionId: string,
  { offset = 0, limit = 10, signal }: SubscriptionOrdersOptions = {}
): Promise<T> => {
  const anyFilter = `any(subscriptions,id=${encodeURIComponent(subscriptionId)})`;
  const query = [
    `select=${ORDER_SELECT}`,
    `filter(${ORDER_FILTER})`,
    `order=${encodeURIComponent(ORDER_SORT)}`,
    `offset=${offset}`,
    `limit=${limit}`
  ].join('&');
  const url = `${PLATFORM_BASE_URL}/commerce/orders?${anyFilter}&${query}`;
  return fetchPlatformJson<T>(url, { signal });
};

export const getSubscriptionDetails = async <T>(
  subscriptionId: string,
  { signal }: PlatformRequestOptions = {}
): Promise<T> => {
  const params = new URLSearchParams({
    select: SUBSCRIPTION_DETAILS_SELECT
  });
  const url = `${PLATFORM_BASE_URL}/commerce/subscriptions/${encodeURIComponent(subscriptionId)}?${params.toString()}`;
  return fetchPlatformJson<T>(url, { signal });
};

export const getAuthorizationDetails = async <T>(
  authorizationId: string,
  { signal }: PlatformRequestOptions = {}
): Promise<T> => {
  const params = new URLSearchParams({
    select: AUTHORIZATION_DETAILS_SELECT
  });
  const url = `${PLATFORM_BASE_URL}/catalog/authorizations/${encodeURIComponent(authorizationId)}?${params.toString()}`;
  return fetchPlatformJson<T>(url, { signal });
};
