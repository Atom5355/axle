import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import {
  ArrowLeft,
  Pencil,
  Plus,
  Trash2,
  Car,
  Gauge,
  Calendar,
  Hash,
  CircleDot,
  Wrench,
  Loader2,
} from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext.jsx';
import VehicleForm from '../components/VehicleForm.jsx';
import MaintenanceForm from '../components/MaintenanceForm.jsx';
import MaintenanceRecordItem from '../components/MaintenanceRecordItem.jsx';
import Modal from '../components/Modal.jsx';

export default function VehicleDetails() {
  const { vehicleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [editingVehicle, setEditingVehicle] = useState(false);
  const [addingRecord, setAddingRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    if (!user) return undefined;
    const vehicleRef = ref(db, `users/${user.uid}/vehicles/${vehicleId}`);
    const unsubV = onValue(
      vehicleRef,
      (snap) => {
        const value = snap.val();
        if (!value) {
          setNotFound(true);
          setVehicle(null);
        } else {
          setNotFound(false);
          setVehicle({ id: vehicleId, ...value });
        }
        setLoading(false);
      },
      () => setLoading(false)
    );

    const recordsRef = ref(db, `users/${user.uid}/maintenance/${vehicleId}`);
    const unsubR = onValue(recordsRef, (snap) => {
      const value = snap.val() || {};
      const list = Object.entries(value).map(([id, r]) => ({ id, ...r }));
      list.sort((a, b) => {
        if (a.date !== b.date) return (b.date || '').localeCompare(a.date || '');
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
      setRecords(list);
    });

    return () => {
      unsubV();
      unsubR();
    };
  }, [user, vehicleId]);

  const stats = useMemo(() => {
    const total = records.length;
    const totalCost = records.reduce((sum, r) => sum + (typeof r.cost === 'number' ? r.cost : 0), 0);
    const lastDate = records[0]?.date || null;
    const lastMileage = records.find((r) => typeof r.mileage === 'number')?.mileage ?? null;
    return { total, totalCost, lastDate, lastMileage };
  }, [records]);

  async function handleUpdateVehicle(data) {
    await update(ref(db, `users/${user.uid}/vehicles/${vehicleId}`), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    setEditingVehicle(false);
  }

  async function handleDeleteVehicle() {
    const ok = window.confirm(
      'Delete this vehicle and ALL its maintenance records? This cannot be undone.'
    );
    if (!ok) return;
    await remove(ref(db, `users/${user.uid}/vehicles/${vehicleId}`));
    await remove(ref(db, `users/${user.uid}/maintenance/${vehicleId}`));
    navigate('/', { replace: true });
  }

  async function handleAddRecord(data) {
    const recordsRef = ref(db, `users/${user.uid}/maintenance/${vehicleId}`);
    const newRef = push(recordsRef);
    await set(newRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // If new record mileage exceeds current vehicle mileage, update it.
    if (
      typeof data.mileage === 'number' &&
      (typeof vehicle?.currentMileage !== 'number' || data.mileage > vehicle.currentMileage)
    ) {
      await update(ref(db, `users/${user.uid}/vehicles/${vehicleId}`), {
        currentMileage: data.mileage,
        updatedAt: serverTimestamp(),
      });
    }

    setAddingRecord(false);
  }

  async function handleUpdateRecord(data) {
    if (!editingRecord) return;
    await update(
      ref(db, `users/${user.uid}/maintenance/${vehicleId}/${editingRecord.id}`),
      {
        ...data,
        updatedAt: serverTimestamp(),
      }
    );
    setEditingRecord(null);
  }

  async function handleDeleteRecord(record) {
    const ok = window.confirm(`Delete ${record.serviceType} record from ${record.date}?`);
    if (!ok) return;
    await remove(ref(db, `users/${user.uid}/maintenance/${vehicleId}/${record.id}`));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading vehicle...
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Vehicle not found</h2>
        <p className="mt-2 text-sm text-slate-500">
          It may have been deleted or you don&apos;t have access.
        </p>
        <Link to="/" className="btn-primary mt-5 inline-flex">
          <ArrowLeft className="h-4 w-4" />
          Back to Garage
        </Link>
      </div>
    );
  }

  const title = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'Vehicle';

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Garage
        </Link>
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Car className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                {vehicle.trim && <span className="badge">{vehicle.trim}</span>}
                {vehicle.drivetrain && <span className="badge">{vehicle.drivetrain}</span>}
              </div>
              <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                {vehicle.color && (
                  <DetailRow icon={<CircleDot className="h-4 w-4" />} label="Color" value={vehicle.color} />
                )}
                {vehicle.licensePlate && (
                  <DetailRow icon={<Hash className="h-4 w-4" />} label="Plate" value={vehicle.licensePlate} mono />
                )}
                {vehicle.vin && (
                  <DetailRow icon={<Hash className="h-4 w-4" />} label="VIN" value={vehicle.vin} mono />
                )}
                {vehicle.tireSize && (
                  <DetailRow icon={<CircleDot className="h-4 w-4" />} label="Tire" value={vehicle.tireSize} />
                )}
                {vehicle.inServiceDate && (
                  <DetailRow icon={<Calendar className="h-4 w-4" />} label="In Service" value={vehicle.inServiceDate} />
                )}
                {typeof vehicle.currentMileage === 'number' && (
                  <DetailRow
                    icon={<Gauge className="h-4 w-4" />}
                    label="Mileage"
                    value={`${vehicle.currentMileage.toLocaleString()} mi`}
                  />
                )}
              </div>
              {vehicle.notes && (
                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  {vehicle.notes}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => setEditingVehicle(true)} className="btn-secondary">
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button onClick={handleDeleteVehicle} className="btn-danger">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
          <StatTile label="Records" value={stats.total} />
          <StatTile
            label="Total Spent"
            value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              stats.totalCost
            )}
          />
          <StatTile label="Last Service" value={stats.lastDate || '—'} />
          <StatTile
            label="Last Logged Mileage"
            value={stats.lastMileage !== null ? `${stats.lastMileage.toLocaleString()} mi` : '—'}
          />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Maintenance Records</h2>
        <button onClick={() => setAddingRecord(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Record
        </button>
      </div>

      {records.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Wrench className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-slate-900">No records yet</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Log your first service to start building maintenance history for this vehicle.
          </p>
          <button onClick={() => setAddingRecord(true)} className="btn-primary mt-4">
            <Plus className="h-4 w-4" />
            Add First Record
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <MaintenanceRecordItem
              key={r.id}
              record={r}
              onEdit={setEditingRecord}
              onDelete={handleDeleteRecord}
            />
          ))}
        </div>
      )}

      <Modal
        open={editingVehicle}
        onClose={() => setEditingVehicle(false)}
        title="Edit Vehicle"
        size="lg"
      >
        <VehicleForm
          initial={vehicle}
          onSubmit={handleUpdateVehicle}
          onCancel={() => setEditingVehicle(false)}
          submitLabel="Save Changes"
        />
      </Modal>

      <Modal
        open={addingRecord}
        onClose={() => setAddingRecord(false)}
        title="Add Maintenance Record"
        size="lg"
      >
        <MaintenanceForm
          onSubmit={handleAddRecord}
          onCancel={() => setAddingRecord(false)}
          submitLabel="Add Record"
        />
      </Modal>

      <Modal
        open={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title="Edit Maintenance Record"
        size="lg"
      >
        {editingRecord && (
          <MaintenanceForm
            initial={editingRecord}
            onSubmit={handleUpdateRecord}
            onCancel={() => setEditingRecord(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  );
}

function DetailRow({ icon, label, value, mono }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`ml-1 font-medium text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}
