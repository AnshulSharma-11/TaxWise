import client from './client';

export async function calculateTax(payload) {
  const { data } = await client.post('/tax/calculate', payload);
  return data.data;
}

export async function saveTaxCalculation(payload) {
  const { data } = await client.post('/tax/history', payload);
  return data.data;
}

export async function getTaxHistory() {
  const { data } = await client.get('/tax/history');
  return data.data;
}

export async function getTaxCalculation(id) {
  const { data } = await client.get(`/tax/history/${id}`);
  return data.data;
}

export async function deleteTaxCalculation(id) {
  const { data } = await client.delete(`/tax/history/${id}`);
  return data.data;
}

export async function getDashboard() {
  const { data } = await client.get('/tax/dashboard');
  return data.data;
}

export async function getSlabInfo(financialYear) {
  const { data } = await client.get(`/tax/slabs/${financialYear}`);
  return data.data;
}

export async function getSupportedFinancialYears() {
  const { data } = await client.get('/tax/financial-years');
  return data.data;
}
