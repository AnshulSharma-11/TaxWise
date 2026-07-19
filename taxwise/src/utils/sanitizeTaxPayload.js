const NUMERIC_FIELDS = [
  'age',
  'annualGrossIncome',
  'basicSalary',
  'hraReceived',
  'rentPaid',
  'deduction80C',
  'deduction80D',
  'deduction80CCD1B',
  'homeLoanInterest24B',
  'otherDeductions',
];

/** Strips NaN values (from empty number inputs) and normalizes payload for the API. */
export function sanitizeTaxPayload(values) {
  const clean = { ...values };
  NUMERIC_FIELDS.forEach((field) => {
    if (clean[field] === undefined || clean[field] === null || Number.isNaN(clean[field])) {
      delete clean[field];
    }
  });
  clean.metroCity = Boolean(clean.metroCity);
  return clean;
}

export function isPayloadReady(values) {
  return Boolean(values.financialYear) && Number(values.annualGrossIncome) > 0;
}
