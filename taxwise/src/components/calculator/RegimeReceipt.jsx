import { BadgeCheck, Save } from 'lucide-react';
import { formatINR, formatPercent } from '../../utils/format';
import './RegimeReceipt.css';

function Line({ label, value, hint, strong, muted }) {
  if (value === undefined || value === null) return null;
  return (
    <div className={`receipt-line ${strong ? 'is-strong' : ''} ${muted ? 'is-muted' : ''}`}>
      <span className="receipt-line-label">
        {label}
        {hint && <span className="receipt-line-hint"> · {hint}</span>}
      </span>
      <span className="figure receipt-line-value">{formatINR(value)}</span>
    </div>
  );
}

export default function RegimeReceipt({ result, regimeName, isWinner, canSave, onSave, saving, savedLabel }) {
  if (!result) return null;

  return (
    <div className={`card regime-receipt ${isWinner ? 'is-winner' : ''}`}>
      <div className="regime-receipt-head">
        <span className={`stamp ${isWinner ? 'stamp-emerald' : 'stamp-navy'}`}>{regimeName}</span>
        {isWinner && (
          <span className="regime-receipt-winner-tag">
            <BadgeCheck size={14} strokeWidth={2.25} />
            Lower liability
          </span>
        )}
      </div>

      <div className="regime-receipt-headline">
        <span className="text-faint" style={{ fontSize: '0.8125rem' }}>
          Total tax liability
        </span>
        <span className="figure regime-receipt-total">{formatINR(result.totalTaxLiability)}</span>
        <span className="text-faint" style={{ fontSize: '0.8125rem' }}>
          Effective rate {formatPercent(result.effectiveTaxRatePercent)}
        </span>
      </div>

      <hr className="divider" />

      <div className="receipt-lines">
        <Line label="Gross income" value={result.grossIncome} strong />
        <Line label="Standard deduction" value={result.standardDeduction && -result.standardDeduction} />
        {Number(result.hraExemption) > 0 && <Line label="HRA exemption" value={-result.hraExemption} />}
        <Line label="Total deductions" value={result.totalDeductions && -result.totalDeductions} muted />
        <Line label="Taxable income" value={result.taxableIncome} strong />
      </div>

      <hr className="divider" />

      <div className="receipt-lines">
        <Line label="Tax before cess" value={result.taxBeforeCess} />
        {Number(result.rebate87A) > 0 && <Line label="Rebate u/s 87A" value={-result.rebate87A} />}
        {Number(result.surcharge) > 0 && <Line label="Surcharge" value={result.surcharge} />}
        <Line label="Health & education cess" value={result.cess} />
        <Line label="Total tax liability" value={result.totalTaxLiability} strong />
      </div>

      <hr className="divider" />

      <div className="receipt-lines">
        <Line label="Net take-home (annual)" value={result.netTakeHomeAnnual} strong />
        <Line label="Net take-home (monthly)" value={result.netTakeHomeMonthly} />
      </div>

      {canSave && (
        <button
          type="button"
          className="btn btn-outline btn-sm regime-receipt-save"
          onClick={onSave}
          disabled={saving || Boolean(savedLabel)}
        >
          <Save size={15} strokeWidth={2.25} />
          {savedLabel ? `Saved as "${savedLabel}"` : saving ? 'Saving…' : `Save this ${regimeName.toLowerCase()} estimate`}
        </button>
      )}
    </div>
  );
}
