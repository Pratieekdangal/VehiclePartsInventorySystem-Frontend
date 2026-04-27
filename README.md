# Vehicle Parts System — Frontend

React 19 + Vite + Tailwind 3 client for the **Vehicle Parts System** (VPS) — a vehicle parts retail and service-center management platform for a Kathmandu-based garage.

CS6004NT Application Development · Coursework 2 · London Metropolitan University / Itahari International College.

Pairs with the [VehiclePartsInventorySystem-Backend](https://github.com/Pratieekdangal/VehiclePartsInventorySystem-Backend) repo.

---

## Stack

- **React 19** + **Vite** + **Tailwind CSS 3**
- **React Router v7** with role-based route guards
- **React Query** for server state · **Zustand** for auth + cart
- **Axios** with JWT bearer interceptor
- **lucide-react** icons · **Recharts** charts · **react-hot-toast**
- Built against the **VPS Design System** (Manrope/Inter/JetBrains Mono, Steel-Blue + Workshop-Amber palette, signature loyalty celebration moment)

---

## Group task division (CS6004NT 2025/26)

| Member | Features |
|---|---|
| **Pratik Dangal** (Leader) | F1, F4, F6, F15, F16 |
| Ribesh Raut | F3, F5, F7, F11 |
| Prajwal Niroula | F8, F9, F10 |
| Shreya Basnet | F2, F12, F13, F14 |

See git log for per-feature commit attribution.

---

## Running locally

```bash
npm install
npm run dev    # → http://localhost:5173
```

Backend is expected at `http://localhost:5000` — override with `VITE_API_URL` in `.env`.

Demo accounts (seeded by the backend on first boot):

- Admin · `admin@vps.local` / `Admin@123`
- Staff · `hari@vps.local` / `Staff@123` (or any staff created by the admin)
- Customer · register fresh from `/register`

---

## Signature moment — F16 Loyalty Discount

When a Staff user is on **New sale** and the running subtotal crosses **Rs. 5,000**, the right-hand summary swaps from a "Add Rs. X more to unlock 10%" hint into a celebratory amber card with a 🎉 orb (continuous glow), pop-scale mount animation, and an amber-tinted total. See `src/components/ui/LoyaltyCard.jsx` and `src/pages/staff/NewSale.jsx`.
