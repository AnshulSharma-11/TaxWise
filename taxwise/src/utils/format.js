const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrFormatterPrecise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export function formatINR(value, { precise = false } = {}) {
  const num = Number(value ?? 0);
  return precise ? inrFormatterPrecise.format(num) : inrFormatter.format(num);
}

export function formatCompactINR(value) {
  const num = Number(value ?? 0);
  const abs = Math.abs(num);
  if (abs >= 1_00_00_000) return `₹${(num / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `₹${(num / 1_00_000).toFixed(2)} L`;
  if (abs >= 1_000) return `₹${(num / 1_000).toFixed(1)} K`;
  return formatINR(num);
}

export function formatPercent(value, digits = 1) {
  return `${Number(value ?? 0).toFixed(digits)}%`;
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
