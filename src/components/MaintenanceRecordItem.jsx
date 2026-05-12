import { Pencil, Trash2, Wrench, Gauge, Calendar, DollarSign, MapPin } from 'lucide-react';

function formatCurrency(value) {
  if (typeof value !== 'number') return null;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export default function MaintenanceRecordItem({ record, onEdit, onDelete }) {
  const cost = formatCurrency(record.cost);
  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Wrench className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900">{record.serviceType}</h4>
            {record.description && (
              <span className="truncate text-sm text-slate-600">— {record.description}</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {record.date}
            </span>
            {typeof record.mileage === 'number' && (
              <span className="inline-flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5" />
                {record.mileage.toLocaleString()} mi
              </span>
            )}
            {cost && (
              <span className="inline-flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                {cost}
              </span>
            )}
            {record.shop && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {record.shop}
              </span>
            )}
          </div>
          {record.notes && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{record.notes}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={() => onEdit(record)} className="btn-secondary">
          <Pencil className="h-4 w-4" />
          Edit
        </button>
        <button onClick={() => onDelete(record)} className="btn-danger">
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
