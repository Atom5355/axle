import { useEffect, useMemo, useState } from 'react';
import { onValue, push, ref, remove, serverTimestamp, set } from 'firebase/database';
import { Plus, Car, Search, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext.jsx';
import VehicleCard from '../components/VehicleCard.jsx';
import VehicleForm from '../components/VehicleForm.jsx';
import Modal from '../components/Modal.jsx';

export default function Garage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!user) return undefined;
    const vehiclesRef = ref(db, `users/${user.uid}/vehicles`);
    const unsub = onValue(
      vehiclesRef,
      (snap) => {
        const value = snap.val() || {};
        const list = Object.entries(value).map(([id, v]) => ({ id, ...v }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setVehicles(list);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) => {
      const hay = [v.year, v.make, v.model, v.trim, v.licensePlate, v.vin, v.color]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [vehicles, query]);

  async function handleAdd(data) {
    const vehiclesRef = ref(db, `users/${user.uid}/vehicles`);
    const newRef = push(vehiclesRef);
    await set(newRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setShowAdd(false);
  }

  async function handleDelete(vehicle) {
    const ok = window.confirm(
      `Delete ${[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'this vehicle'} and all its maintenance records?`
    );
    if (!ok) return;
    await remove(ref(db, `users/${user.uid}/vehicles/${vehicle.id}`));
    await remove(ref(db, `users/${user.uid}/maintenance/${vehicle.id}`));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Garage</h1>
          <p className="text-sm text-slate-500">Manage vehicles and their maintenance history.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-8"
              placeholder="Search vehicles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading vehicles...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={() => setShowAdd(true)} hasVehicles={vehicles.length > 0} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <div key={v.id} className="group relative">
              <VehicleCard vehicle={v} />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(v);
                }}
                className="absolute right-2 top-2 hidden rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-red-600 shadow ring-1 ring-red-200 hover:bg-red-50 group-hover:block"
                aria-label="Delete vehicle"
                title="Delete vehicle"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Vehicle"
        size="lg"
      >
        <VehicleForm
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          submitLabel="Add Vehicle"
        />
      </Modal>
    </div>
  );
}

function EmptyState({ onAdd, hasVehicles }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Car className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        {hasVehicles ? 'No matching vehicles' : 'Your garage is empty'}
      </h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {hasVehicles
          ? 'Try a different search term, or add a new vehicle.'
          : 'Add your first vehicle to start logging maintenance and stay on top of service.'}
      </p>
      <button onClick={onAdd} className="btn-primary mt-5">
        <Plus className="h-4 w-4" />
        Add Vehicle
      </button>
    </div>
  );
}
