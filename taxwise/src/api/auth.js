import client from './client';

export async function registerRequest(payload) {
  const { data } = await client.post('/auth/register', payload);
  return data.data;
}

export async function loginRequest(payload) {
  const { data } = await client.post('/auth/login', payload);
  return data.data;
}

export async function getProfile() {
  const { data } = await client.get('/users/me');
  return data.data;
}

export async function updateProfile(payload) {
  const { data } = await client.put('/users/me', payload);
  return data.data;
}

export async function changePassword(payload) {
  const { data } = await client.put('/users/me/password', payload);
  return data.data;
}
