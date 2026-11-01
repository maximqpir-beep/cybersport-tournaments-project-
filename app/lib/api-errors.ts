export async function readApiErrorMessage(response: Response): Promise<string> {
	try {
		const data = await response.clone().json();
		return data.error?.message || data.detail || `Ошибка ${response.status}`;
	} catch {
		return `Ошибка ${response.status}`;
	}
}
