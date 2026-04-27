import { create } from 'zustand';

// Sale-creation cart. Selectors compute subtotal / discount / total so the
// sticky summary and the loyalty celebration card share one source of truth.

const LOYALTY_THRESHOLD = 5000;
const LOYALTY_RATE = 0.1;
const VAT_RATE = 0.13;

export const useCart = create((set, get) => ({
  customer: null,         // { id, fullName, phoneNumber, ... }
  vehicle: null,          // { id, vehicleNumber, make, model, year }
  paymentMethod: 'cash',
  amountPaid: 0,
  dueDate: '',
  notes: '',
  lines: [],              // [{ partId, name, partCode, sellingPrice, stockQuantity, quantity }]

  setCustomer: (customer) => set({ customer, vehicle: null }),
  setVehicle: (vehicle) => set({ vehicle }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setAmountPaid: (amountPaid) => set({ amountPaid }),
  setDueDate: (dueDate) => set({ dueDate }),
  setNotes: (notes) => set({ notes }),

  addPart: (part) =>
    set((state) => {
      const existing = state.lines.find((l) => l.partId === part.id);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.partId === part.id
              ? { ...l, quantity: Math.min(l.quantity + 1, part.stockQuantity) }
              : l,
          ),
        };
      }
      return {
        lines: [
          ...state.lines,
          {
            partId: part.id,
            name: part.name,
            partCode: part.partCode,
            sellingPrice: part.sellingPrice,
            stockQuantity: part.stockQuantity,
            quantity: 1,
          },
        ],
      };
    }),

  updateQty: (partId, delta) =>
    set((state) => ({
      lines: state.lines
        .map((l) =>
          l.partId === partId
            ? {
                ...l,
                quantity: Math.max(
                  0,
                  Math.min(l.quantity + delta, l.stockQuantity),
                ),
              }
            : l,
        )
        .filter((l) => l.quantity > 0),
    })),

  setQty: (partId, qty) =>
    set((state) => ({
      lines: state.lines.map((l) =>
        l.partId === partId
          ? { ...l, quantity: Math.max(0, Math.min(qty, l.stockQuantity)) }
          : l,
      ),
    })),

  removeLine: (partId) =>
    set((state) => ({ lines: state.lines.filter((l) => l.partId !== partId) })),

  reset: () =>
    set({
      customer: null,
      vehicle: null,
      paymentMethod: 'cash',
      amountPaid: 0,
      dueDate: '',
      notes: '',
      lines: [],
    }),
}));

// --- selectors -------------------------------------------------------------
// Keep computation close to state so any consumer (summary card, loyalty card,
// "create invoice" button) gets identical numbers. Re-exported as plain
// functions so they can be called outside a React render too.

export const cartSubtotal = (state) =>
  state.lines.reduce((sum, l) => sum + l.sellingPrice * l.quantity, 0);

export const cartLoyalty = (state) => {
  const subtotal = cartSubtotal(state);
  const eligible = subtotal > LOYALTY_THRESHOLD;
  return {
    eligible,
    threshold: LOYALTY_THRESHOLD,
    rate: LOYALTY_RATE,
    discount: eligible ? subtotal * LOYALTY_RATE : 0,
    remainingToUnlock: eligible ? 0 : LOYALTY_THRESHOLD + 1 - subtotal,
  };
};

export const cartTotals = (state) => {
  const subtotal = cartSubtotal(state);
  const { eligible, discount } = cartLoyalty(state);
  const taxable = subtotal - discount;
  const vat = taxable * VAT_RATE;
  const total = taxable + vat;
  return { subtotal, discount, eligible, vat, total };
};
