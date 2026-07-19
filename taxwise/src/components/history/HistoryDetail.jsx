import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import RegimeBadge from '../common/RegimeBadge';
import { formatDateTime, formatINR, formatPercent } from '../../utils/format';
import { generateCalculationPdf } from '../../utils/exportPdf';
import './HistoryDetail.css';

function Row({ label, value, hint, strong }) {
  if (value === undefined || value === null) return null;
  return (
    <div className={`hist-detail-row ${strong ? 'is-strong' : ''}`}>
      <span>
        {label}
        {hint && <span className="text-faint"> · {hint}</span>}
      </span>
      <span className="figure">{formatINR(value)}</span>
    </div>
  );
}

export default function HistoryDetail({ calc }) {
  if (!calc) return null;
  const otherLabel = calc.comparisonRegime === 'NEW' ? 'New Regime' : 'Old Regime';

  return (
    <div className="hist-detail">
      <div className="hist-detail-head">
        <div>
          <h4>{calc.label}</h4>
          <p className="text-faint">
            FY {calc.financialYear} · Saved {formatDateTime(calc.createdAt)}
          </p>
        </div>
        <RegimeBadge regime={calc.regime} />
      </div>

      <div className="hist-detail-section">
        <Row label="Gross income" value={calc.grossIncome} strong />
        <Row label="Standard deduction" value={-calc.standardDeduction} />
        {Number(calc.hraExemption) > 0 && <Row label="HRA exemption" value={-calc.hraExemption} />}
        <Row label="Total deductions" value={-calc.totalDeductions} />
        <Row label="Taxable income" value={calc.taxableIncome} strong />
      </div>

      <div className="hist-detail-section">
        <Row label="Tax before cess" value={calc.taxBeforeCess} />
        {Number(calc.rebate87A) > 0 && <Row label="Rebate u/s 87A" value={-calc.rebate87A} />}
        {Number(calc.surcharge) > 0 && <Row label="Surcharge" value={calc.surcharge} />}
        <Row label="Health & education cess" value={calc.cess} />
        <Row label="Total tax liability" value={calc.totalTaxLiability} strong />
      </div>

      <div className="hist-detail-section">
        <Row label="Net take-home (annual)" value={calc.netTakeHomeAnnual} strong />
        <Row label="Net take-home (monthly)" value={calc.netTakeHomeMonthly} />
        <div className="hist-detail-row">
          <span>Effective tax rate</span>
          <span className="figure">{formatPercent(calc.effectiveTaxRatePercent)}</span>
        </div>
      </div>

      {calc.comparisonRegimeTax !== undefined && (
        <div className="hist-detail-compare">
          <span>{otherLabel} would have cost</span>
          <span className="figure">{formatINR(calc.comparisonRegimeTax)}</span>
          {calc.potentialSavings !== undefined && (
            <span className="text-emerald">
              ({calc.betterRegime === calc.regime ? 'this was' : otherLabel + ' would have been'} cheaper by{' '}
              {formatINR(calc.potentialSavings)})
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        className="btn btn-outline btn-block"
        onClick={() => generateCalculationPdf(calc).catch((err) => toast.error(err.message || 'Could not generate the PDF.'))}
      >
        <Download size={16} strokeWidth={2.25} />
        Download PDF summary
      </button>
    </div>
  );
}
