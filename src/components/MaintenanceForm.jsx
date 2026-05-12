import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const SERVICE_TYPES = [
  'Oil Change',
  'Tire Rotation',
  'Tire Replacement',
  'Brake Service',
  'Air Filter',
  'Cabin Filter',
  'Battery Replacement',
  'Coolant Flush',
  'Transmission Fluid',
  'Spark Plugs',
  'Alignment',
  'Inspection',
  'Other',
];

export function emptyRecord() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    mileage: '',
    serviceType: 'Oil Change',
    description: '',
    cost: '',
    shop: '',
    notes: '',
  };
}

export default function MaintenanceForm({ initial, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [values, setValues] = useState(() => ({ ...emptyRecord(), ...(initial || {}) }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!values.date) {
      setError('Date is required.');
      return;
    }
    if (!values.serviceType) {
      setError('Service type is required.');
      return;
    }

    const mileage = values.mileage === '' ? null : Number(values.mileage);
    if (mileage !== null && (Number.isNaN(mileage) || mileage < 0)) {
      setError('Mileage must be a non-negative number.');
      return;
    }
    const cost = values.cost === '' ? null : Number(values.cost);
    if (cost !== null && (Number.isNaN(cost) || cost < 0)) {
      setError('Cost must be a non-negative number.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        mileage,
        cost,
        description: values.description.trim(),
        shop: values.shop.trim(),
        notes: values.notes.trim(),
      });
    } catch (err) {
      setError(err?.message || 'Failed to save record.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="label">Date *</label>
          <input
            type="date"
            className="input"
            value={values.date}
            onChange={(e) => update('date', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Mileage</label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            className="input"
            value={values.mileage}
            onChange={(e) => update('mileage', e.target.value)}
            placeholder="45000"
          />
        </div>
        <div>
          <label className="label">Service Type *</label>
          <select
            className="input"
            value={values.serviceType}
            onChange={(e) => update('serviceType', e.target.value)}
            required
          >
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <input
          className="input"
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Synthetic 5W-30, replaced filter"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Cost (USD)</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            className="input"
            value={values.cost}
            onChange={(e) => update('cost', e.target.value)}
            placeholder="79.99"
          />
        </div>
        <div>
          <label className="label">Shop / Performed By</label>
          <input
            className="input"
            value={values.shop}
            onChange={(e) => update('shop', e.target.value)}
            placeholder="Quick Lube #42"
          />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          className="input min-h-[80px]"
          value={values.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Anything else worth remembering..."
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
