import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'];

export function emptyVehicle() {
  return {
    year: '',
    make: '',
    model: '',
    trim: '',
    vin: '',
    licensePlate: '',
    color: '',
    tireSize: '',
    drivetrain: 'FWD',
    inServiceDate: '',
    currentMileage: '',
    notes: '',
  };
}

export default function VehicleForm({ initial, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [values, setValues] = useState(() => ({ ...emptyVehicle(), ...(initial || {}) }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!values.make.trim() || !values.model.trim()) {
      setError('Make and model are required.');
      return;
    }

    const yearNum = Number(values.year);
    if (values.year && (Number.isNaN(yearNum) || yearNum < 1900 || yearNum > 2100)) {
      setError('Please enter a valid year between 1900 and 2100.');
      return;
    }

    const mileageNum = values.currentMileage === '' ? null : Number(values.currentMileage);
    if (mileageNum !== null && (Number.isNaN(mileageNum) || mileageNum < 0)) {
      setError('Mileage must be a non-negative number.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        year: values.year === '' ? null : yearNum,
        currentMileage: mileageNum,
        make: values.make.trim(),
        model: values.model.trim(),
        trim: values.trim.trim(),
        vin: values.vin.trim().toUpperCase(),
        licensePlate: values.licensePlate.trim().toUpperCase(),
        color: values.color.trim(),
        tireSize: values.tireSize.trim(),
        notes: values.notes.trim(),
      });
    } catch (err) {
      setError(err?.message || 'Failed to save vehicle.');
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <label className="label">Year</label>
          <input
            type="number"
            inputMode="numeric"
            min="1900"
            max="2100"
            className="input"
            value={values.year}
            onChange={(e) => update('year', e.target.value)}
            placeholder="2020"
          />
        </div>
        <div>
          <label className="label">Make *</label>
          <input
            className="input"
            value={values.make}
            onChange={(e) => update('make', e.target.value)}
            placeholder="Toyota"
            required
          />
        </div>
        <div>
          <label className="label">Model *</label>
          <input
            className="input"
            value={values.model}
            onChange={(e) => update('model', e.target.value)}
            placeholder="Camry"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="label">Trim</label>
          <input
            className="input"
            value={values.trim}
            onChange={(e) => update('trim', e.target.value)}
            placeholder="XSE"
          />
        </div>
        <div>
          <label className="label">Color</label>
          <input
            className="input"
            value={values.color}
            onChange={(e) => update('color', e.target.value)}
            placeholder="Midnight Blue"
          />
        </div>
        <div>
          <label className="label">Drivetrain</label>
          <select
            className="input"
            value={values.drivetrain}
            onChange={(e) => update('drivetrain', e.target.value)}
          >
            {DRIVETRAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label">VIN</label>
          <input
            className="input font-mono uppercase"
            maxLength={17}
            value={values.vin}
            onChange={(e) => update('vin', e.target.value)}
            placeholder="1HGCM82633A123456"
          />
        </div>
        <div>
          <label className="label">License Plate</label>
          <input
            className="input uppercase"
            value={values.licensePlate}
            onChange={(e) => update('licensePlate', e.target.value)}
            placeholder="ABC-1234"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="label">Tire Size</label>
          <input
            className="input"
            value={values.tireSize}
            onChange={(e) => update('tireSize', e.target.value)}
            placeholder="225/45R18"
          />
        </div>
        <div>
          <label className="label">In Service Date</label>
          <input
            type="date"
            className="input"
            value={values.inServiceDate}
            onChange={(e) => update('inServiceDate', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Current Mileage</label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            className="input"
            value={values.currentMileage}
            onChange={(e) => update('currentMileage', e.target.value)}
            placeholder="45000"
          />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          className="input min-h-[80px]"
          value={values.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Anything noteworthy about this vehicle..."
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
