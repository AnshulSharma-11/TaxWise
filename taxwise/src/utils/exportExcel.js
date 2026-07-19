import { formatDateTime } from './format';

export async function exportHistoryToExcel(historyList) {
  const XLSX = await import('xlsx');
  const rows = historyList.map((calc) => ({
    Label: calc.label || '',
    'Financial Year': calc.financialYear,
    Regime: calc.regime === 'NEW' ? 'New Regime' : 'Old Regime',
    'Gross Income (\u20b9)': Number(calc.grossIncome ?? 0),
    'Taxable Income (\u20b9)': Number(calc.taxableIncome ?? 0),
    'Total Tax Liability (\u20b9)': Number(calc.totalTaxLiability ?? 0),
    'Saved On': formatDateTime(calc.createdAt),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 28 },
    { wch: 14 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tax History');
  XLSX.writeFile(workbook, `taxwise-history-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
