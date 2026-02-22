import { getEmeraldAccessToken } from './emeraldService';

const PARTNER_CENTER_BASE_URL = import.meta.env.VITE_PARTNER_CENTER_BASE_URL || 'https://api.partnercenter.microsoft.com';

export type PartnerCenterRequestOptions = {
  signal?: AbortSignal;
};

export type PartnerCenterSubscriptionParams = PartnerCenterRequestOptions & {
  cspAgreementId: string;
  microsoftTenantId: string;
  subscriptionId: string;
};

export type PartnerCenterAuditLogParams = PartnerCenterRequestOptions & {
  cspAgreementId: string;
  microsoftTenantId: string;
  startDate: string;
  endDate: string;
};

const fetchPartnerCenterJson = async <T>(url: string, token: string, options: PartnerCenterRequestOptions = {}) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    },
    signal: options.signal
  });

  if (!response.ok) {
    throw new Error('Partner Center request failed.');
  }

  return (await response.json()) as T;
};

export const getPartnerCenterSubscription = async <T>({
  cspAgreementId,
  microsoftTenantId,
  subscriptionId,
  signal
}: PartnerCenterSubscriptionParams): Promise<T> => {
  const token = await getEmeraldAccessToken(cspAgreementId, { signal });
  const url = `${PARTNER_CENTER_BASE_URL}/v1/customers/${encodeURIComponent(microsoftTenantId)}/subscriptions/${encodeURIComponent(subscriptionId)}`;
  return fetchPartnerCenterJson<T>(url, token, { signal });
};

export const getPartnerCenterSubscriptionDetails = getPartnerCenterSubscription;

export const getPartnerCenterActivityLog = async <T>({
  cspAgreementId,
  microsoftTenantId,
  startDate,
  endDate,
  signal
}: PartnerCenterAuditLogParams): Promise<T> => {
  const token = await getEmeraldAccessToken(cspAgreementId, { signal });
  const filterValue = JSON.stringify({ Field: 'CustomerId', Value: microsoftTenantId, Operator: 'equals' });
  const params = new URLSearchParams({
    startDate,
    endDate,
    filter: filterValue
  });
  const url = `${PARTNER_CENTER_BASE_URL}/v1/auditrecords?${params.toString()}`;
  return fetchPartnerCenterJson<T>(url, token, { signal });
};
