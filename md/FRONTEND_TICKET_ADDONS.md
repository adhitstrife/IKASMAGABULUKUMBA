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

> Addon prices are stored in **IDR** (not cents). Conversion to cents (`price * 100`) happens when combined with total.

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
): { subtotalIdr: number; addonsTotalIdr: number; totalCents: number } {
  const baseTotalIdr = ticketPriceCents * quantity / 100;
  const addonsTotalIdr = addonsPerTicket.flat().reduce((sum, a) => sum + a.priceIdr, 0);
  const totalCents = (baseTotalIdr * 100) + (addonsTotalIdr * 100);
  return {
    subtotalIdr: baseTotalIdr,
    addonsTotalIdr,
    totalCents,
  };
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

1. **Cents vs IDR**: Ticket prices are in **cents** (`price_cents`). Addon prices are in **plain IDR** (`price`). Always multiply addon price by 100 when combining with cents-based totals.
2. **Per-ticket limit**: Each ticket can only have 1 unit per addon. If the UI allows adding a second long sleeve for the same participant, the API will reject it.
3. **Stock race**: Multiple users buying simultaneously could overshoot `max_quantity`. Handle "out of stock" errors gracefully on the UI (show a message).
4. **Delete is blocked**: If EO tries to delete an addon that already has ticket selections, the API returns 400. Tell EO to use `is_active: false` instead.
5. **Price changes are not retroactive**: `price_per_unit` is snapshotted at purchase time. Changing `price` on the addon definition doesn't affect existing purchases.
