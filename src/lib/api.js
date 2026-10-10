// Order API client (server/index.js). Errors carry the server's message, ready to show.
async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body && JSON.stringify(body),
    });
  } catch {
    throw new Error('Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Что-то пошло не так. Попробуйте ещё раз.'), { status: res.status, field: data.field });
  return data;
}

export const createOrder = (order) => request('POST', '/orders', order);
export const getOrder = (id) => request('GET', `/orders/${encodeURIComponent(id)}`);
export const retryPayment = (id) => request('POST', `/orders/${encodeURIComponent(id)}/pay`);
