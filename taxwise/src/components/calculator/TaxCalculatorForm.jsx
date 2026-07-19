import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Banknote, Home, Landmark, Sparkles } from 'lucide-react';
import { getSupportedFinancialYears } from '../../api/tax';
import './TaxCalculatorForm.css';

const DEFAULT_VALUES = {
  financialYear: '2025-26',
  age: '',
  annualGrossIncome: '',
  basicSalary: '',
  hraReceived: '',
  rentPaid: '',
  metroCity: false,
  deduction80C: '',
  deduction80D: '',
  deduction80CCD1B: '',
  homeLoanInterest24B: '',
  otherDeductions: '',
};

export default function TaxCalculatorForm({ onValuesChange, initialValues }) {
  const { data: financialYears } = useQuery({
    queryKey: ['financial-years'],
    queryFn: getSupportedFinancialYears,
    staleTime: Infinity,
  });

  const { register, watch, setValue } = useForm({
    defaultValues: { ...DEFAULT_VALUES, ...initialValues },
  });

  useEffect(() => {
    const subscription = watch((values) => onValuesChange(values));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  // Fire once on mount so the parent has the defaults immediately.
  useEffect(() => {
    onValuesChange(watch());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (financialYears?.length && !financialYears.includes(watch('financialYear'))) {
      setValue('financialYear', financialYears[financialYears.length - 1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialYears]);

  return (
    <form className="calc-form" onSubmit={(e) => e.preventDefault()}>
      <section className="calc-section">
        <header className="calc-section-head">
          <span className="calc-section-icon">
            <Landmark size={16} strokeWidth={2.25} />
          </span>
          <div>
            <h3>Income &amp; year</h3>
            <p className="text-faint">The basics we need for every regime.</p>
          </div>
        </header>

        <div className="calc-grid">
          <div className="field">
            <label className="label" htmlFor="financialYear">
              Financial year
            </label>
            <select id="financialYear" className="select" {...register('financialYear')}>
              {(financialYears || ['2024-25', '2025-26']).map((fy) => (
                <option key={fy} value={fy}>
                  FY {fy}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="age">
              Age <span className="optional">(optional)</span>
            </label>
            <input
              id="age"
              type="number"
              min="0"
              max="120"
              placeholder="30"
              className="input"
              {...register('age', { valueAsNumber: true })}
            />
          </div>

          <div className="field calc-grid-span-2">
            <label className="label" htmlFor="annualGrossIncome">
              Annual gross salary
            </label>
            <div className="input-prefix-group">
              <span className="prefix">₹</span>
              <input
                id="annualGrossIncome"
                type="number"
                min="0"
                step="1000"
                placeholder="12,00,000"
                className="input"
                {...register('annualGrossIncome', { valueAsNumber: true })}
              />
            </div>
            <span className="field-hint">Before any deductions — CTC minus employer PF/NPS is a good estimate.</span>
          </div>
        </div>
      </section>

      <section className="calc-section">
        <header className="calc-section-head">
          <span className="calc-section-icon">
            <Home size={16} strokeWidth={2.25} />
          </span>
          <div>
            <h3>HRA details</h3>
            <p className="text-faint">Only used to compute the old-regime exemption.</p>
          </div>
        </header>

        <div className="calc-grid">
          <div className="field">
            <label className="label" htmlFor="basicSalary">
              Basic salary (annual)
            </label>
            <div className="input-prefix-group">
              <span className="prefix">₹</span>
              <input
                id="basicSalary"
                type="number"
                min="0"
                step="1000"
                placeholder="6,00,000"
                className="input"
                {...register('basicSalary', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="hraReceived">
              HRA received (annual)
            </label>
            <div className="input-prefix-group">
              <span className="prefix">₹</span>
              <input
                id="hraReceived"
                type="number"
                min="0"
                step="1000"
                placeholder="2,40,000"
                className="input"
                {...register('hraReceived', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="rentPaid">
              Rent paid (annual)
            </label>
            <div className="input-prefix-group">
              <span className="prefix">₹</span>
              <input
                id="rentPaid"
                type="number"
                min="0"
                step="1000"
                placeholder="3,00,000"
                className="input"
                {...register('rentPaid', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="field calc-checkbox-field">
            <label className="checkbox-row">
              <input type="checkbox" {...register('metroCity')} />
              I live in a metro city (Delhi, Mumbai, Kolkata or Chennai)
            </label>
          </div>
        </div>
      </section>

      <section className="calc-section">
        <header className="calc-section-head">
          <span className="calc-section-icon">
            <Banknote size={16} strokeWidth={2.25} />
          </span>
          <div>
            <h3>Deductions</h3>
            <p className="text-faint">Old regime only — the new regime uses just the standard deduction.</p>
          </div>
        </header>

        <div className="calc-grid">
          <div className="field">
            <label className="label" htmlFor="deduction80C">
              Section 80C <span className="optional">(PF, ELSS, life insurance…)</span>
            </label>
            <div className="input-prefix-group">
              <span className="prefix">₹</span>
              <input
                id="deduction80C"
                type="number"
                min="0"
                step="1000"
                placeholder="Up to 1,50,000"
                className="input"
                {...register('deduction80C', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="deduction80D">
              Section 80D <span className="optional">(health insurance)</span>
            </label>
            <div className="input-prefix-group">
              <span className="prefix">₹</span>
              <input
                id="deduction80D"
                type="number"
                min="0"
                step="500"
                placeholder="Up to 25,000 / 50,000"
                className="input"
                {...register('deduction80D', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="deduction80CCD1B">
              Section 80CCD(1B) <span className="optional">(NPS)</span>
            </label>
            <div className="input-prefix-group">
              <span className="prefix">₹</span>
              <input
                id="deduction80CCD1B"
                type="number"
                min="0"
                step="1000"
                placeholder="Up to 50,000"
                className="input"
                {...register('deduction80CCD1B', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="homeLoanInterest24B">
              Home loan interest <span className="optional">(Sec 24b)</span>
            </label>
            <div className="input-prefix-group">
              <span className="prefix">₹</span>
              <input
                id="homeLoanInterest24B"
                type="number"
                min="0"
                step="1000"
                placeholder="Up to 2,00,000"
                className="input"
                {...register('homeLoanInterest24B', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="field calc-grid-span-2">
            <label className="label" htmlFor="otherDeductions">
              Other deductions <span className="optional">(80E, 80G, 80TTA…)</span>
            </label>
            <div className="input-prefix-group">
              <span className="prefix">₹</span>
              <input
                id="otherDeductions"
                type="number"
                min="0"
                step="500"
                placeholder="0"
                className="input"
                {...register('otherDeductions', { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>
      </section>

      <p className="calc-live-note">
        <Sparkles size={14} />
        Results update automatically as you type.
      </p>
    </form>
  );
}
