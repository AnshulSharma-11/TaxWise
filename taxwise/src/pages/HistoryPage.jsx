import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Download, Eye, FileSpreadsheet, Plus, Trash2 } from 'lucide-react';
import RegimeBadge from '../components/common/RegimeBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import HistoryDetail from '../components/history/HistoryDetail';
import { deleteTaxCalculation, getTaxCalculation, getTaxHistory } from '../api/tax';
import { formatDate, formatINR } from '../utils/format';
import { exportHistoryToExcel } from '../utils/exportExcel';
import { generateCalculationPdf } from '../utils/exportPdf';
import './HistoryPage.css';

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const { data: history, isLoading } = useQuery({
    queryKey: ['tax-history'],
    queryFn: getTaxHistory,
  });

  const { data: selectedDetail } = useQuery({
    queryKey: ['tax-calculation', selectedId],
    queryFn: () => getTaxCalculation(selectedId),
    enabled: Boolean(selectedId),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTaxCalculation,
    onSuccess: () => {
      toast.success('Calculation deleted.');
      queryClient.invalidateQueries({ queryKey: ['tax-history'] });
      queryClient.invalidateQueries({ queryKey: ['tax-dashboard'] });
    },
    onError: (err) => toast.error(err.message || 'Could not delete this calculation.'),
  });

  function handleDelete(id, label) {
    if (window.confirm(`Delete "${label}"? This can't be undone.`)) {
      deleteMutation.mutate(id);
    }
  }

  async function handleDownloadPdf(id) {
    try {
      setDownloadingId(id);
      const detail = await getTaxCalculation(id);
      await generateCalculationPdf(detail);
    } catch (err) {
      toast.error(err.message || 'Could not generate the PDF.');
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleExportExcel() {
    if (!history?.length) return;
    try {
      await exportHistoryToExcel(history);
      toast.success('Excel file downloaded.');
    } catch (err) {
      toast.error(err.message || 'Could not export to Excel.');
    }
  }

  return (
    <div className="container hist-page">
      <div className="hist-page-head">
        <div>
          <span className="eyebrow">Your ledger</span>
          <h1>Calculation history</h1>
          <p className="text-soft">Every estimate you've saved, in one place.</p>
        </div>
        <div className="row gap-2">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportExcel}
            disabled={!history?.length}
          >
            <FileSpreadsheet size={16} strokeWidth={2.25} />
            Export all to Excel
          </button>
          <NavLink to="/calculator" className="btn btn-primary">
            <Plus size={16} strokeWidth={2.25} />
            New calculation
          </NavLink>
        </div>
      </div>

      {isLoading && <LoadingSpinner label="Loading your history…" />}

      {!isLoading && !history?.length && (
        <div className="card card-pad hist-empty">
          <h3>Nothing saved yet</h3>
          <p className="text-soft">Run a calculation and save it to start building your history.</p>
          <NavLink to="/calculator" className="btn btn-primary">
            Go to calculator
          </NavLink>
        </div>
      )}

      {!isLoading && Boolean(history?.length) && (
        <div className="card hist-table-card">
          <div className="hist-table-scroll">
            <table className="hist-table ledger-lines">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>FY</th>
                  <th>Regime</th>
                  <th className="align-right">Gross income</th>
                  <th className="align-right">Taxable income</th>
                  <th className="align-right">Total tax</th>
                  <th>Saved</th>
                  <th className="align-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((calc) => (
                  <tr key={calc.id}>
                    <td className="hist-table-label">{calc.label}</td>
                    <td>{calc.financialYear}</td>
                    <td>
                      <RegimeBadge regime={calc.regime} />
                    </td>
                    <td className="figure align-right">{formatINR(calc.grossIncome)}</td>
                    <td className="figure align-right">{formatINR(calc.taxableIncome)}</td>
                    <td className="figure align-right hist-table-tax">{formatINR(calc.totalTaxLiability)}</td>
                    <td className="text-faint">{formatDate(calc.createdAt)}</td>
                    <td>
                      <div className="hist-row-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedId(calc.id)}
                          aria-label="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDownloadPdf(calc.id)}
                          disabled={downloadingId === calc.id}
                          aria-label="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(calc.id, calc.label)}
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedId && (
        <Modal title="Calculation details" onClose={() => setSelectedId(null)}>
          {selectedDetail ? <HistoryDetail calc={selectedDetail} /> : <LoadingSpinner label="Loading details…" />}
        </Modal>
      )}
    </div>
  );
}
