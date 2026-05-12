import { Link } from 'react-router-dom';
import { Car, Gauge, Calendar, ChevronRight } from 'lucide-react';

export default function VehicleCard({ vehicle }) {
  const title = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'Unnamed Vehicle';
  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="card group flex items-center gap-4 p-4 transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Car className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-semibold text-slate-900">{title}</h3>
          {vehicle.drivetrain && <span className="badge">{vehicle.drivetrain}</span>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          {vehicle.licensePlate && (
            <span className="font-mono">{vehicle.licensePlate}</span>
          )}
          {typeof vehicle.currentMileage === 'number' && (
            <span className="inline-flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              {vehicle.currentMileage.toLocaleString()} mi
            </span>
          )}
          {vehicle.inServiceDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              In service {vehicle.inServiceDate}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
    </Link>
  );
}
