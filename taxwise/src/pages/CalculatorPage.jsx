import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, LogIn, TrendingDown } from 'lucide-react';
import TaxCalculatorForm from '../components/calculator/TaxCalculatorForm';
import RegimeReceipt from '../components/calculator/RegimeReceipt';
import ComparisonChart from '../components/calculator/ComparisonChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { calculateTax, saveTaxCalculation } from '../api/tax';
import { sanitizeTaxPayload, isPayloadReady } from '../utils/sanitizeTaxPayload';
import { formatINR } from '../utils/format';
import useDebouncedValue from '../hooks/useDebouncedValue';
import './CalculatorPage.css';

export default function CalculatorPage() {
  const { isAuthenticated } = useAuth();
  const [formValues, setFormValues] = useState({});
  const [savedLabels, setSavedLabels] = useState({ OLD: null, NEW: null });

  const debounced = useDebouncedValue(formValues, 450);
  const ready = isPayloadReady(debounced);
  const payload = useMemo(() => sanitizeTaxPayload(debounced), [debounced]);

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ['tax-calculate', payload],
    queryFn: async () => {
      const [oldResult, newResult] = await Promise.all([
        calculateTax({ ...payload, regime: 'OLD' }),
        calculateTax({ ...payload, regime: 'NEW' }),
      ]);
      return { OLD: oldResult, NEW: newResult };
    },
    enabled: ready,
    placeholderData: (previous) => previous,
  });

  const saveMutation = useMutation({
    mutationFn: ({ regime, label }) => saveTaxCalculation({ ...payload, regime, label }),
    onSuccess: (saved, variables) => {
      toast.success('Calculation saved to your history.');
      setSavedLabels((prev) => ({ ...prev, [variables.regime]: saved.label }));
    },
    onError: (err) => toast.error(err.message || 'Could not save this calculation.'),
  });

  function handleValuesChange(values) {
    setFormValues(values);
    setSavedLabels({ OLD: null, NEW: null });
  }

  function handleSave(regime) {
    saveMutation.mutate({ regime, label: undefined });
  }

  const winnerRegime =
    data && data.OLD && data.NEW
      ? data.OLD.totalTaxLiability <= data.NEW.totalTaxLiability
        ? 'OLD'
        : 'NEW'
      : null;

  const savings = data && data.OLD && data.NEW ? Math.abs(data.OLD.totalTaxLiability - data.NEW.totalTaxLiability) : 0;

  return (
    <div className="container calc-page">
      <div className="calc-page-head">
        <span className="eyebrow">Old vs. new regime</span>
        <h1>Tax calculator</h1>
        <p className="text-soft">
          Fill in your income and deductions once — TaxWise works out both regimes side by side.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="calc-guest-banner">
          <span>
            <LogIn size={16} strokeWidth={2.25} /> Log in to save this calculation and build a history.
          </span>
          <NavLink to="/register" className="btn btn-navy btn-sm">
            Get started <ArrowRight size={15} />
          </NavLink>
        </div>
      )}

      <div className="calc-layout">
        <div className="card card-pad calc-form-col">
          <TaxCalculatorForm onValuesChange={handleValuesChange} />
        </div>

        <div className="calc-results-col">
          {!ready && (
            <div className="card card-pad calc-empty-state">
              <TrendingDown size={28} strokeWidth={1.75} />
              <h3>Enter your annual gross income to see a comparison</h3>
              <p className="text-soft">Both regimes will be calculated the moment you add a number.</p>
            </div>
          )}

          {ready && isError && (
            <div className="card card-pad calc-empty-state">
              <p className="text-danger">{error?.message || 'Could not calculate tax. Please check your inputs.'}</p>
            </div>
          )}

          {ready && data && (
            <>
              {isFetching && <div className="calc-refresh-hint">Recalculating…</div>}

              <div className={`calc-savings-banner ${winnerRegime === 'NEW' ? 'is-new' : 'is-old'}`}>
                <span className="stamp stamp-emerald">
                  {winnerRegime === 'NEW' ? 'New regime' : 'Old regime'} saves you more
                </span>
                <span className="figure calc-savings-amount">{formatINR(savings)}</span>
                <span className="text-faint">lower total tax liability per year</span>
              </div>

              <ComparisonChart oldResult={data.OLD} newResult={data.NEW} />

              <div className="calc-receipts">
                <RegimeReceipt
                  result={data.OLD}
                  regimeName="Old Regime"
                  isWinner={winnerRegime === 'OLD'}
                  canSave={isAuthenticated}
                  onSave={() => handleSave('OLD')}
                  saving={saveMutation.isPending && saveMutation.variables?.regime === 'OLD'}
                  savedLabel={savedLabels.OLD}
                />
                <RegimeReceipt
                  result={data.NEW}
                  regimeName="New Regime"
                  isWinner={winnerRegime === 'NEW'}
                  canSave={isAuthenticated}
                  onSave={() => handleSave('NEW')}
                  saving={saveMutation.isPending && saveMutation.variables?.regime === 'NEW'}
                  savedLabel={savedLabels.NEW}
                />
              </div>
            </>
          )}

          {ready && !data && isFetching && <LoadingSpinner label="Running the numbers…" />}
        </div>
      </div>
    </div>
  );
}
