import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '~/store/auth.store';
import type { components, paths } from './api.schema';

const baseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
	const refreshToken = getRefreshToken();
	if (!refreshToken) return null;
	const response = await fetch(`${baseUrl}/api/auth/refresh`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ refresh_token: refreshToken })
	});
	if (!response.ok) {
		if (response.status === 401) clearTokens();
		return null;
	}
	const tokens: components['schemas']['TokenResponse'] = await response.json();
	setTokens({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
	return tokens.access_token;
}

async function authenticatedFetch(request: Request): Promise<Response> {
	const original = request.clone();
	const token = getAccessToken();
	if (token) request.headers.set('Authorization', `Bearer ${token}`);
	let response = await fetch(request);
	const path = new URL(original.url).pathname;
	if (response.status === 401 && token && !['/api/auth/login', '/api/auth/register', '/api/auth/refresh'].includes(path)) {
		refreshing ??= refreshAccessToken().finally(() => { refreshing = null; });
		const newToken = await refreshing;
		if (newToken) {
			original.headers.set('Authorization', `Bearer ${newToken}`);
			response = await fetch(original);
		}
	}
	if (!response.ok) {
		throw Object.assign(new Error(`API ${response.status}`), { response });
	}
	return response;
}

export const apiClient = createFetchClient<paths>({ baseUrl, fetch: authenticatedFetch });
const $api = createClient(apiClient);
export default $api;
