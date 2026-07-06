# Ticket Type Addons — Frontend Implementation Guide

## Overview

Event Organizers (EO) can now attach **optional addons** to each `TicketType`. Example: a "Long sleeve" addon for IDR 10.000 per unit. During checkout, each participant (ticket) can individually choose which addons they want.

**Key business rules:**
- 1 ticket = max 1 unit per addon (e.g., 1 long sleeve per participant)
- Addon is optional — empty array = no addons
- Addon price is in **IDR** (plain integer, not cents)
- Addons are pass-through: platform fee is calculated **only from base ticket price**

---

## EO Endpoints (JWT Required)

All endpoints require `Authorization: Bearer <token>` where token is the EO's JWT.

### 1. Create Addon

```
POST /api/v1/ticket-types/:ticketTypeId/addons
```

**Request Body:**
```json
{
  "name": "Long Sleeve",
  "description": "Kaos lengan panjang bahan dry-fit",
  "price": 10000,
  "max_quantity": 100,
  "image_url": "https://...",
  "sort_order": 1,
  "is_active": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Nama addon |
| `description` | string | optional | Deskripsi |
| `price` | integer | ✅ | Harga dalam IDR (contoh: 10000 = Rp 10.000) |
| `max_quantity` | integer | optional | Stok maksimal (null = unlimited) |
| `image_url` | string | optional | URL gambar addon |
| `sort_order` | integer | optional | Urutan tampilan |
| `is_active` | boolean | optional | Default true |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ticket_type_id": "uuid",
    "name": "Long Sleeve",
    "description": "Kaos lengan panjang bahan dry-fit",
    "price": 10000,
    "max_quantity": 100,
    "quantity_sold": 0,
    "is_active": true,
    "sort_order": 1,
    "image_url": "https://...",
    "created_at": "2026-07-02T19:00:00.000Z",
    "updated_at": "2026-07-02T19:00:00.000Z"
  },
  "message": "Addon created successfully"
}
```

---

### 2. List Addons (by Ticket Type)

```
GET /api/v1/ticket-types/:ticketTypeId/addons
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ticket_type_id": "uuid",
      "name": "Long Sleeve",
      "price": 10000,
      "max_quantity": 100,
      "quantity_sold": 5,
      "is_active": true,
      "sort_order": 1,
      "image_url": null,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "count": 1
}
```

---

### 3. Get Single Addon

```
GET /api/v1/ticket-types/:ticketTypeId/addons/:addonId
```

---

### 4. Update Addon

```
PATCH /api/v1/ticket-types/:ticketTypeId/addons/:addonId
```

**Request Body:** (partial update — kirim field yang ingin diubah)
```json
{
  "price": 15000,
  "max_quantity": 200
}
```

---

### 5. Delete Addon

```
DELETE /api/v1/ticket-types/:ticketTypeId/addons/:addonId
```

**Note:** Returns 400 if there are existing ticket selections referencing this addon. Use `is_active: false` instead for soft-disable.

**Response:**
```json
{
  "success": true,
  "message": "Addon deleted successfully"
}
```

---

## Public Endpoints (No Auth)

### 6. Get Event Tickets (includes addons)

```
GET /api/v1/events/:eventId/tickets
```

**Response — now includes `addons[]` in each ticket type:**
```json
{
  "event": { "id": "uuid", "name": "Marathon 2026" },
  "addition": { "id": "uuid", "name": "10K Run", "race_date": "2026-08-15" },
  "tickets": [
    {
      "id": "uuid",
      "addition_id": "uuid",
      "name": "Reguler",
      "description": "Tiket reguler 10K",
      "price_cents": 10000000,
      "quantity": 500,
      "quantity_sold": 120,
      "min_per_order": 1,
      "max_per_order": 10,
      "is_active": true,
      "sort_order": 0,
      "addons": [
        {
          "id": "uuid",
          "name": "Long Sleeve",
          "description": "Kaos lengan panjang dry-fit",
          "price": 10000,
          "max_quantity": 100,
          "quantity_sold": 5,
          "is_active": true,
          "image_url": null,
          "sort_order": 1
        }
      ]
    }
  ]
}
```

---

### 7. Get All Active Events (public landing page)

```
GET /api/v1/events/public/all
```

Same structure as above — `ticket_types[].addons[]` is now included.

---

## Purchase Flow

### 8. Create Registration (+ addons)

```
POST /api/v1/registrations/purchase
```

**Request Body:**
```json
{
  "event_id": "uuid-event",
  "addition_id": "uuid-addition",
  "ticket_type_id": "uuid-ticket-type",
  "first_name": "Andi",
  "last_name": "Pratama",
  "email": "andi@example.com",
  "phone": "081234567890",
  "id_number": "1234567890123456",
  "quantity": 3,
  "tickets": [
    {
      "bib_name": "Andi Pratama",
      "shirt_size": "M",
      "addons": [{ "addon_id": "uuid-longsleeve" }]
    },
    {
      "bib_name": "Budi Santoso",
      "shirt_size": "L",
      "addons": []
    },
    {
      "bib_name": "Citra Dewi",
      "shirt_size": "S",
      "addons": [{ "addon_id": "uuid-longsleeve" }]
    }
  ],
  "promo_code": "HEMAT10",
  "tnc_accepted": true,
  "payment_method": "BRIVA"
}
```

**Note about `addons`:**
- Array of `{ addon_id: string }`. Max 1 entry per addon_id per ticket.
- Empty `addons: []` = no addons for that participant
- Omit field entirely = same as empty array

**Validation rules (returned as 400 Bad Request):**
1. `addon_id` must belong to the selected `ticket_type_id`
2. Addon must be `is_active = true`
3. If `max_quantity` is set, must still have stock remaining
4. Duplicate `addon_id` for the same ticket → rejected
5. Addon stock is decremented at purchase time

**Response:**
```json
{
  "registration": {
    "id": "uuid",
    "event_id": "uuid-event",
    "ticket_type_id": "uuid-ticket-type",
    "email": "andi@example.com",
    "quantity": 3,
    "price_per_ticket_cents": 10000000,
    "discount_amount_cents": 0,
    "platform_fee_cents": 750000,
    "total_amount_cents": 30200000,
    "status": "pending_payment",
    "payment_url": "https://tripay.co.id/checkout/..."
  },
  "tickets": [
    { "id": "uuid-ticket-1", "participant_first_name": "Andi", "t_shirt_size": "M", ... },
    { "id": "uuid-ticket-2", "participant_first_name": "Budi", "t_shirt_size": "L", ... },
    { "id": "uuid-ticket-3", "participant_first_name": "Citra", "t_shirt_size": "S", ... }
  ],
  "ticket_addons": [
    { "id": "uuid-ta-1", "ticket_id": "uuid-ticket-1", "ticket_type_addon_id": "uuid-longsleeve", "price_per_unit": 10000 },
    { "id": "uuid-ta-2", "ticket_id": "uuid-ticket-3", "ticket_type_addon_id": "uuid-longsleeve", "price_per_unit": 10000 }
  ],
  "total_price": 30200000,
  "platform_fee": 750000,
  "discount_applied": false,
  "addons_total_idr": 20000,
  "payment_url": "https://tripay.co.id/checkout/..."
}
```

**Price calculation example:**

| Item | Qty | Unit Price | Subtotal |
|------|-----|-----------|----------|
| Reguler Ticket (10K) | 3 | Rp 100.000 | Rp 300.000 |
| Long Sleeve (Andi) | 1 | Rp 10.000 | Rp 10.000 |
| Long Sleeve (Citra) | 1 | Rp 10.000 | Rp 10.000 |
| **Total (cents)** | | | **32.000.000** |

> Addon prices are stored in **IDR**. Internally, `total_amount_cents` is functionally treated as IDR — so addon price is added directly without conversion.

---

## UI Implementation Guide

### Step 1: Fetch Addons

When loading the registration page for a ticket type, the addons are included in the ticket type data:

```ts
// GET /api/v1/events/:eventId/tickets
const response = await api.get(`events/${eventId}/tickets`);
const addons = response.tickets[0].addons;
// [{ id, name, price, max_quantity, quantity_sold, image_url }]
```

### Step 2: Display Addon Picker Per Ticket

For each participant (ticket) in the registration form, render a checkbox/toggle for each available addon:

```tsx
interface AddonPickerProps {
  addons: Addon[];
  ticketIndex: number;
  selectedAddons: Set<string>;
  onToggle: (ticketIndex: number, addonId: string) => void;
}

function AddonPicker({ addons, ticketIndex, selectedAddons, onToggle }: AddonPickerProps) {
  return (
    <div className="space-y-2">
      {addons.map((addon) => {
        const isSelected = selectedAddons.has(addon.id);
        const isSoldOut = addon.max_quantity !== null && addon.quantity_sold >= addon.max_quantity;
        return (
          <label key={addon.id} className="flex items-center gap-3 p-2 border rounded">
            <input
              type="checkbox"
              checked={isSelected}
              disabled={isSoldOut}
              onChange={() => onToggle(ticketIndex, addon.id)}
            />
            <div>
              <span className="font-medium">{addon.name}</span>
              <span className="text-gray-500 ml-2">
                + Rp {addon.price.toLocaleString('id-ID')}
              </span>
              {isSoldOut && <span className="text-red-500 ml-2">(Habis)</span>}
            </div>
          </label>
        );
      })}
    </div>
  );
}
```

### Step 3: Build Request Payload

```ts
interface TicketAddonInput {
  addon_id: string;
}

interface TicketInput {
  bib_name: string;
  shirt_size: string;
  addons?: TicketAddonInput[];
}

// Map selected addons per ticket:
const tickets: TicketInput[] = participants.map((p) => ({
  bib_name: p.name,
  shirt_size: p.shirtSize,
  addons: Array.from(p.selectedAddonIds).map((id) => ({ addon_id: id })),
}));
```

### Step 4: Calculate Price Preview (Frontend)

```ts
function calculatePricePreview(
  ticketPriceCents: number,
  quantity: number,
  addonsPerTicket: { addonId: string; priceIdr: number }[][],
  promoCode?: string | null,
): { subtotal: number; addonsTotal: number; grandTotal: number } {
  const subtotal = ticketPriceCents * quantity; // "cents" = functionally IDR
  const addonsTotal = addonsPerTicket.flat().reduce((sum, a) => sum + a.priceIdr, 0);
  const grandTotal = subtotal + addonsTotal;
  return { subtotal, addonsTotal, grandTotal };
}
```

---

## Email Confirmation

The registration confirmation email now shows:

- **Addon column** in the participant table (per ticket)
- **Subtotal breakdown**: Ticket subtotal + Addon total = Total Pembayaran

---

## Data Model (for reference)

```prisma
model TicketTypeAddon {
  id              String   @id @default(uuid())
  ticket_type_id  String
  name            String   @db.VarChar(255)
  description     String?  @db.Text
  price           Int               // IDR, not cents. Example: 10000 = Rp 10.000
  max_quantity    Int?              // null = unlimited stock
  quantity_sold   Int      @default(0)
  is_active       Boolean  @default(true)
  sort_order      Int      @default(0)
  image_url       String?  @db.VarChar(500)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}

model TicketAddon {
  id                    String   @id @default(uuid())
  ticket_id             String
  ticket_type_addon_id  String
  price_per_unit        Int               // Snapshot price in IDR at purchase time
  created_at            DateTime @default(now())
}
```

---

## Common Pitfalls

1. **Cents vs IDR**: Although the schema uses `_cents` naming (e.g. `total_amount_cents`), these values are functionally stored as **IDR** (sent to Tripay as rupiah). Addon `price` is also in **IDR** — no conversion needed when adding to totals.
2. **Per-ticket limit**: Each ticket can only have 1 unit per addon. If the UI allows adding a second long sleeve for the same participant, the API will reject it.
3. **Stock race**: Multiple users buying simultaneously could overshoot `max_quantity`. Handle "out of stock" errors gracefully on the UI (show a message).
4. **Delete is blocked**: If EO tries to delete an addon that already has ticket selections, the API returns 400. Tell EO to use `is_active: false` instead.
5. **Price changes are not retroactive**: `price_per_unit` is snapshotted at purchase time. Changing `price` on the addon definition doesn't affect existing purchases.

---

## Ticket Type Variants

Each `TicketType` now has a `variant` field that controls behavior:

| Variant | Enum Value | Behavior |
|---------|-----------|----------|
| Standard (default) | `standard` | Regular ticket — no special logic |
| Student | `student` | Same as standard, but frontend shows "Student ID Number" label instead of "ID Number" |
| Community | `community` | Bulk-bonus logic: for every N paid tickets, Y free tickets are added |

### Creating / Updating a Ticket Type with Variant

```json
POST /api/v1/ticket-types
{
  "name": "Mahasiswa 10K",
  "price_cents": 5000000,
  "quantity": 100,
  "variant": "student"
}
```

For community variant, bonus fields are required:

```json
POST /api/v1/ticket-types
{
  "name": "Group Run 10K",
  "price_cents": 5000000,
  "quantity": 100,
  "variant": "community",
  "bonus_threshold": 10,
  "bonus_quantity": 1
}
```

Bonus calculation: `free tickets = floor(paidQuantity / bonus_threshold) * bonus_quantity`

Example with threshold=10, bonus=1:
- User buys `quantity=10` → 10 paid + 1 free = **11 tickets total**
- User buys `quantity=5` → 5 paid + 0 free = **5 tickets total**
- User buys `quantity=20` → 20 paid + 2 free = **22 tickets total**

---

### Student Variant — Frontend Behavior

No backend change to DB columns. The `id_number` field on `Registration` stays the same name. The frontend should:

1. Read `ticket_type.variant` from the ticket type data
2. If `variant === 'student'`, render the input label as **"Student ID Number"** instead of "ID Number"
3. If `variant !== 'student'`, render as normal ("ID Number")

No changes needed to the API payload — the DTO field remains `id_number`.

---

### Community Variant — Purchase Flow

When buying a community ticket, the `quantity` in the request body represents **paid tickets only**. Free (bonus) tickets are added automatically.

**Important:** The `tickets` array must include entries for **all** tickets (paid + free). Each entry needs `bib_name`, `shirt_size`, and optional `addons`.

Example: `ticket_type.variant = 'community'`, `bonus_threshold = 10`, `bonus_quantity = 1`

```json
{
  "ticket_type_id": "uuid-community-tt",
  "quantity": 10,
  "tickets": [
    { "bib_name": "A", "shirt_size": "M" },
    { "bib_name": "B", "shirt_size": "L" },
    { "bib_name": "C", "shirt_size": "S" },
    { "bib_name": "D", "shirt_size": "M" },
    { "bib_name": "E", "shirt_size": "L" },
    { "bib_name": "F", "shirt_size": "S" },
    { "bib_name": "G", "shirt_size": "M" },
    { "bib_name": "H", "shirt_size": "L" },
    { "bib_name": "I", "shirt_size": "S" },
    { "bib_name": "J", "shirt_size": "M" },
    { "bib_name": "K (free)", "shirt_size": "XL" }
  ],
  ...
}
```

- `quantity = 10` (paid)
- System adds 1 free ticket → total `tickets.length` must be **11**
- `total_price = 10 × price_cents`
- The free ticket has `is_bonus: true` in the response
- The registration `quantity` in the response will show `11` (total)
- `bonus_quantity: 1` will be on the registration object

**Response snippet:**
```json
{
  "registration": {
    "quantity": 11,
    "bonus_quantity": 1,
    "total_amount_cents": 50000000
  },
  "tickets": [
    { "id": "...", "is_bonus": false, ... },
    ...
    { "id": "...", "is_bonus": true, ... }
  ]
}
```

**Validation errors (400):**
- If `tickets.length` does not match `quantity + bonusQuantity` → error with expected count
- If community variant has invalid `bonus_threshold`/`bonus_quantity` config

---

### Frontend Price Preview for Community Tickets

```ts
function calculateCommunityPricePreview(
  ticketPriceCents: number,
  paidQuantity: number,
  bonusThreshold: number,
  bonusQuantity: number,
) {
  const free = Math.floor(paidQuantity / bonusThreshold) * bonusQuantity;
  const total = paidQuantity + free;
  const subtotal = ticketPriceCents * paidQuantity;
  return { paid: paidQuantity, free, total, subtotal };
}
```

---

## Frontend Implementation Guide: Ticket Type Variants

### 1. EO Dashboard — Create Ticket Type Form

**State shape:**
```ts
interface CreateTicketTypeForm {
  name: string;
  description?: string;
  price_cents: number;
  quantity: number;
  min_per_order: number;   // default 1
  max_per_order?: number;
  variant: 'standard' | 'student' | 'community';
  bonus_threshold?: number;
  bonus_quantity?: number;
  sale_start?: string;     // ISO date
  sale_end?: string;
}
```

**Logic:**
- Render a variant selector (radio / segmented control): Standard | Student | Community
- When `variant !== 'community'`: hide `bonus_threshold` and `bonus_quantity` fields entirely — do not send them
- When `variant === 'community'`: show `bonus_threshold` (input number, min=2) and `bonus_quantity` (input number, min=1)
- Client-side validation before POST:
  - `bonus_quantity` must be < `bonus_threshold`
  - Both must be > 0
- On submit — POST `/api/v1/ticket-types` with all fields (or PATCH `/api/v1/ticket-types/:id`)

**Edge cases:**
- User switches from community back to standard → clear bonus fields
- Price and quantity fields remain the same regardless of variant

---

### 2. EO Dashboard — Edit Ticket Type Form

**State shape:** same as create, pre-filled from existing ticket type via GET `/api/v1/ticket-types/:id`.

**Variant transitions:**
| From → To | Behavior |
|-----------|---------|
| standard → student | Safe. Just adds variant flag. |
| standard → community | Must now fill bonus_threshold + bonus_quantity. |
| student → standard | Safe. Just removes variant flag. |
| student → community | Must now fill bonus_threshold + bonus_quantity. |
| community → standard | bonus_threshold + bonus_quantity cleared on backend. |
| community → student | Same as above. |

**Important warning:** When changing variant to/from community (especially changing bonus fields), show a toast/modal:
> "Perubahan bonus hanya berlaku untuk pembelian baru. Registration yang sudah ada tidak akan di-recalculate."

**Logic:**
- Load existing ticket type. Prefill all fields.
- If existing `bonus_threshold`/`bonus_quantity` has values (variant is community), show them in the form.
- If user removes variant from community and has existing registrations, warn: "Ticket type already has registrations. Bonus fields can still be removed, but existing registrations are not recalculated."

---

### 3. Public Event Listing — Variant Badge

When rendering ticket types on the event landing page, display a badge/indicator per variant:

```ts
const variantConfig: Record<string, { label: string; icon: string; color: string }> = {
  standard:  { label: '',              icon: '',               color: '' },
  student:   { label: 'Mahasiswa',     icon: '🎓',             color: 'blue' },
  community: { label: 'Grup / Borongan', icon: '👥',           color: 'green' },
};
```

**Logic:**
- `variant === 'standard'`: render nothing extra beside the ticket name
- `variant === 'student'`: show a badge "Mahasiswa" with an academic-themed color
- `variant === 'community'`: compute a short summary text, e.g. `"Beli ${bonus_threshold} gratis ${bonus_quantity}"` and render as a badge

**Example render output:**
```
┌─────────────────────────────┐
│ Tiket Reguler 10K           │
│ Rp 100.000                  │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Tiket Mahasiswa 10K  [🎓 Mahasiswa]  │
│ Rp 75.000                  │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Tiket Grup 10K       [👥 Beli 10 gratis 1]  │
│ Rp 100.000                 │
└─────────────────────────────┘
```

---

### 4. Public Checkout — Community Quantity Selector

**Special behavior for community variant only:**

When user selects a community ticket type and picks a quantity, calculate and display the bonus inline:

```ts
function getBonusPreview(
  paidQuantity: number,
  bonusThreshold: number,
  bonusQuantity: number,
): { free: number; total: number } {
  const free = Math.floor(paidQuantity / bonusThreshold) * bonusQuantity;
  return { free, total: paidQuantity + free };
}
```

**UI flow:**
1. User picks community ticket → quantity input renders normally
2. As user types/changes `quantity` (representing **paid tickets**), compute `free = floor(qty / threshold) * bonus`
3. If `free > 0`, render a live preview below the input:
   > "Kamu akan mendapatkan **{free} tiket gratis**. Total tiket yang akan dibuat: **{total}**."
4. The free count updates in real-time as quantity changes
5. The "Total Pembayaran" preview should show: `(quantity × price_cents)` — only paid tickets counted

**Example: threshold=10, bonus=1, price=100000**

| User enters (paid) | Preview shows | Total charged |
|---|---|---|
| 5 | "5 tiket, 0 gratis, total 5" | Rp 500.000 |
| 10 | "10 tiket, 1 gratis, total 11" | Rp 1.000.000 |
| 15 | "15 tiket, 1 gratis, total 16" | Rp 1.500.000 |
| 20 | "20 tiket, 2 gratis, total 22" | Rp 2.000.000 |

---

### 5. Public Checkout — Dynamic Tickets Form

After quantity is set, render the participant input form. For community tickets, the number of rows is different from `quantity`:

**Logic:**
```ts
const free = Math.floor(quantity / ticketType.bonus_threshold) * ticketType.bonus_quantity;
const totalRows = quantity + free;

// Render totalRows worth of participant input forms
// Rows 0..quantity-1 are "paid" rows
// Rows quantity..totalRows-1 are "free" rows
```

**Rendering rules:**
- All rows require: `bib_name` (string, required), `shirt_size` (string, required), `addons` (optional array)
- Rows with `index >= quantity` (free tickets) should be visually distinct:
  - Show a small badge "Free" or "Bonus" near the row number
  - Subtle background color change (e.g., `bg-gray-50` or similar)
  - The badge or label: "Tiket Gratis #{index - quantity + 1}"
- All rows, including free ones, can still have addons (the user pays for addons on any ticket)

**Example rendering (quantity=5, free=1, total=6):**

```
Peserta 1 [Bayar]       → bib_name: [____] shirt_size: [▼]  addons: [☐ Long Sleeve]
Peserta 2 [Bayar]       → bib_name: [____] shirt_size: [▼]  addons: [☐ Long Sleeve]
Peserta 3 [Bayar]       → bib_name: [____] shirt_size: [▼]  addons: [☐ Long Sleeve]
Peserta 4 [Bayar]       → bib_name: [____] shirt_size: [▼]  addons: [☐ Long Sleeve]
Peserta 5 [Bayar]       → bib_name: [____] shirt_size: [▼]  addons: [☐ Long Sleeve]
Peserta 6 [🎁 Gratis]   → bib_name: [____] shirt_size: [▼]  addons: [☐ Long Sleeve]
```

**Client-side validation:**
- `tickets.length` must equal `quantity + free` (total rows)
- If user removes a row, add it back — server will reject with a clear message if count is wrong

---

### 6. Public Checkout — Price Breakdown Component

For community tickets, render the price breakdown carefully to avoid confusion:

```
[Harga Tiket Grup 10K]
  5 × Rp 100.000           Rp 500.000
  + 1 tiket gratis         Rp 0

  Subtotal tiket           Rp 500.000
  (+ addons jika ada)      Rp XX.XXX
  ─────────────────────────────────
  Total Pembayaran         Rp 500.000   ← equals what's charged
```

**Rules:**
- Never display `quantity + free × price` as that would misleadingly show a higher total
- The free tickets are clearly shown as free (Rp 0)
- The final total matches `total_amount_cents` from the response (which is `paidQuantity × price_cents` minus discount + addons)

---

### 7. Order Summary / Email — Free Ticket Badge

When rendering the order summary (thank-you page, "My Tickets" page, or confirmation email):

```ts
tickets.forEach((ticket) => {
  if (ticket.is_bonus) {
    renderBadge('🎁 Gratis', { color: 'green', subtle: true });
  }
});
```

- Tickets with `is_bonus: true` should display a small "Free" or "Bonus" badge
- The badge should be less prominent than paid tickets (gray text, subtle background)
- In the ticket list, free tickets are listed alongside paid tickets — they are real tickets with QR codes, bib names, etc.

**Data source:**
- `GET /api/v1/registrations/:id` response includes `tickets[].is_bonus`
- `Registration.bonus_quantity` tells you how many tickets are free

---

### 8. TypeScript Types (for Frontend Project)

```ts
enum TicketTypeVariant {
  standard = 'standard',
  student = 'student',
  community = 'community',
}

interface TicketType {
  id: string;
  addition_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  normal_price: number | null;
  quantity: number;
  quantity_sold: number;
  quantity_reserved: number | null;
  min_per_order: number;
  max_per_order: number | null;
  is_active: boolean;
  variant: TicketTypeVariant;
  bonus_threshold: number | null;   // only for community
  bonus_quantity: number | null;    // only for community
  sale_start: string | null;
  sale_end: string | null;
  sort_order: number;
  addons: TicketTypeAddon[];
}

interface Ticket {
  id: string;
  registration_id: string;
  participant_first_name: string | null;
  participant_last_name: string | null;
  participant_email: string | null;
  t_shirt_size: string | null;
  is_bonus: boolean;                // true if free community-bonus ticket
  qr_code_url: string | null;
  status: string;
}

interface Registration {
  id: string;
  event_id: string;
  ticket_type_id: string;
  quantity: number;                  // total tickets (paid + free)
  price_per_ticket_cents: number;    // raw price, not effective
  total_amount_cents: number;        // what was paid (paid × price)
  bonus_quantity: number | null;     // null for non-community
  status: string;
  tickets: Ticket[];
}
```

---

### 9. Response Field Reference — New Variant Fields

**TicketType response** (GET /ticket-types, GET /events/:id/tickets, etc.):

| Field | Type | Description | Always present |
|-------|------|-------------|:---:|
| `variant` | `"standard"\|"student"\|"community"` | Identifies ticket type category | ✅ |
| `bonus_threshold` | `int \| null` | N — every N paid tickets triggers bonus (community only) | ❌ only when community |
| `bonus_quantity` | `int \| null` | Y — number of free tickets awarded per threshold (community only) | ❌ only when community |

**Registration response** (POST /registrations/purchase, GET /registrations/:id):

| Field | Type | Description | Always present |
|-------|------|-------------|:---:|
| `quantity` | `int` | Total tickets issued (paid + free) | ✅ |
| `bonus_quantity` | `int \| null` | How many were free bonus tickets (null for non-community) | ❌ only when community |
| `total_amount_cents` | `int` | Amount charged (paid × price, minus discount, plus addons) | ✅ |

**Ticket response** (nested inside Registration):

| Field | Type | Description | Always present |
|-------|------|-------------|:---:|
| `is_bonus` | `boolean` | True if this ticket was a free community bonus | ✅ always, default false |

---

### 10. QA Checklist

Test each scenario against the frontend implementation:

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Standard ticket purchase | Create standard ticket type, buy via checkout | Normal flow, no bonus, no label change |
| 2 | Student label swap | Create student ticket type, open checkout form | Input label reads "Student ID Number" instead of "ID Number" |
| 3 | Community: exact threshold | Qty=10, threshold=10, bonus=1 | 1 free, 11 tickets total, charged for 10 |
| 4 | Community: below threshold | Qty=5, threshold=10, bonus=1 | 0 free, 5 tickets total, charged for 5 |
| 5 | Community: multiple bonuses | Qty=20, threshold=10, bonus=1 | 2 free, 22 tickets total, charged for 20 |
| 6 | Community: tickets.length mismatch | Submit tickets array with wrong length | Server 400 "expected N tickets, got M" |
| 7 | Community: out of stock | Buy more than available (including free) after stock limit | Server 400 "only X tickets available" |
| 8 | Student variant: student label only | User buys student ticket, view order summary | Label was correct during input; response data unchanged |
| 9 | Edit: variant transition | EO changes community → standard, or bonus fields | Warning shown; existing registrations preserved |
| 10 | Edit: add bonus to existing standard | EO changes standard → community, sets bonus fields | Warning shown; future purchases only |
| 11 | Bulk import: community variant | Import XLSX with community ticket type | No bonus applied. Import treats it as regular ticket type |
| 12 | Listing: variant badges | Open event landing page with multiple variants | Each ticket type shows correct badge (student, community, or none) |
| 13 | Listing: community bonus text | View community ticket type on landing page | Text shows "Beli {threshold} gratis {bonus}" |
| 14 | Price preview: community live update | Change qty in checkout for community ticket | Free count and total update instantly without page reload |
| 15 | Free ticket: addon selection | Select addon for a free (community bonus) ticket | Addon is charged; ticket is still free (no ticket price) |
