# RKCartune — Second-Hand Car Dealership (MEAN Stack)

A full rebuild of the original PHP "Car Showroom Management System" as a production-shaped MEAN stack app for **RKCartune**, a second-hand car dealership. Same functionality — browse/search cars, register/login, role-based access, "Check Availability" bookings, admin management — with a new tuner-garage visual identity.

## Design system
- **Palette:** `asphalt #0E0F11` (bg), `panel #17181B` (cards), `line #2A2B2F` (borders), `tuner-orange #FF5A1F` (primary accent — replaces the PHP site's Ferrari red), `nitro-lime #C9FF3D` (price/success highlights only).
- **Type:** Bebas Neue (headlines — condensed, decal-like), Inter (body), IBM Plex Mono (spec chips, prices — reads like inspection-tag data).
- **Signature elements:** a diagonal "PRE-OWNED" ribbon on every car card, and "inspection tag" mono chips for year/fuel/transmission/km, reinforcing the used-car marketplace feel.

## How this maps to the original PHP site
| PHP file | MEAN equivalent |
|---|---|
| `index.php` (browse + search) | `HomeComponent` + `GET /api/cars` |
| `header.php` (session-based nav) | `HeaderComponent` + `AuthService.currentUser$` |
| `footer.php` | `FooterComponent` |
| `login.php` | `LoginComponent` + `POST /api/auth/login` |
| `register.php` (password/phone validation) | `RegisterComponent` + `POST /api/auth/register` — same regex rules, enforced both client- and server-side |
| `logout.php` | `AuthService.logout()` (clears JWT) |
| `user/book_car.php` ("Check Availability") | `BookingModalComponent` + `POST /api/bookings` |
| `user/car_details.php` | `CarDetailComponent` + `GET /api/cars/:id` |
| `user/dashboard.php`, `user/my_bookings.php` | `UserDashboardComponent`, `MyBookingsComponent` |
| `admin/dashboard.php`, `admin/manage_bookings.php` | `AdminDashboardComponent`, `ManageCarsComponent`, `ManageBookingsComponent` |

The original PHP files for the admin/user subfolders weren't part of what you shared, so those pages are freshly designed against the same data model (Car, User, Booking) rather than ported line-by-line — let me know if the PHP versions had specific behavior I should match.

## Project structure
```
rkcartune/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js          # JWT protect() + adminOnly()
│   ├── models/{User,Car,Booking}.js
│   ├── routes/{authRoutes,carRoutes,bookingRoutes}.js
│   ├── utils/generateToken.js
│   ├── server.js
│   ├── seed.js                     # sample cars + admin/test accounts
│   └── .env.example
└── frontend/
    └── src/app/
        ├── core/{models,services,guards,interceptors}/
        └── components/
            ├── header/ footer/ home/ login/ register/
            ├── car-detail/ booking-modal/
            ├── user/{user-dashboard,my-bookings}/
            └── admin/{admin-dashboard,manage-cars,manage-bookings}/
```

## Dealer photo uploads (multi-image gallery)
Each car now has an `images: string[]` array instead of a single `imageUrl`. In the admin **Manage Inventory** form, the dealer can build a car's photo gallery two ways, mixed freely:
- **Upload from device** — select one or more files (JPG/PNG/WEBP/GIF, up to 5MB each, 10 per request); they're stored on the server under `backend/uploads/` and served at `/uploads/<filename>`.
- **Paste a link** — for photos already hosted elsewhere (e.g. a manufacturer site or existing listing).

The first image in the array is used as the card thumbnail and is marked "Cover" in the admin gallery preview. The car detail page shows a full gallery with a thumbnail strip to switch the main image. `CarService.resolveImageUrl()` transparently handles both absolute URLs and server-relative upload paths, so the frontend doesn't need to know which kind it's looking at.

**Production note:** the `uploads/` folder is local disk storage — fine for development or a single-server deployment, but if you deploy to a platform with an ephemeral filesystem (e.g. most PaaS free tiers), uploaded files will be lost on redeploy/restart. For production, swap `middleware/upload.js`'s disk storage for a cloud storage adapter (S3, Cloudinary, etc.) — the route contract (`POST /api/cars/upload` → array of URLs) stays the same either way.


```bash
cd backend
npm install
cp .env.example .env      # set a real JWT_SECRET
npm run seed                # loads 6 sample cars + admin/test accounts
npm run dev                  # http://localhost:5000
```
**Seeded logins:**
- Admin — `admin@rkcartune.com` / `Admin@123`
- Buyer — `buyer@example.com` / `Buyer@123`

### API reference
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account (same password/phone rules as the PHP form) |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | user | Restore session |
| GET | `/api/cars` | — | List/search/filter cars |
| GET | `/api/cars/brands` | — | Distinct brand list for filter chips |
| GET | `/api/cars/:id` | — | Single car |
| POST/PUT/DELETE | `/api/cars/:id` | admin | Manage inventory |
| POST | `/api/bookings` | user | Request a viewing ("Check Availability") |
| GET | `/api/bookings/mine` | user | My bookings |
| GET | `/api/bookings` | admin | All bookings |
| PUT | `/api/bookings/:id/status` | admin | Confirm/cancel a booking |
| DELETE | `/api/bookings/:id` | owner/admin | Cancel a booking |

## Frontend setup
```bash
cd frontend
npm install
npm start                   # http://localhost:4200
```

## Auth flow
JWT is issued on login/register, stored in `localStorage`, and attached automatically to every request via `authInterceptor`. `AuthService.currentUser$` drives the role-aware nav (mirrors the PHP `$_SESSION['role']` check in `header.php`). `authGuard` blocks logged-out users from booking/dashboard routes; `adminGuard` restricts `/admin/*` to admin accounts — both redirect to `/login` (or `/`) rather than erroring.

## Edge cases handled
- Empty search results / API unreachable → dedicated empty and error states, not a blank screen.
- Booking a car that's already sold → rejected server-side with a clear message.
- Invalid Mongo id on `GET /api/cars/:id` → `400`, not a crash.
- Duplicate email on register → `409` with a clear message, matching the "Registration failed" pattern from the PHP version.
- Password hash never returned in any API response (`User.toJSON()` strips it) — the original PHP stored and compared passwords in plaintext; this version hashes with bcrypt.

## Note on the original PHP code
A few things in the PHP you shared were worth fixing rather than porting as-is, since they're real security gaps: raw string interpolation into SQL queries (SQL injection risk) and plaintext password storage/comparison. The MEAN version uses Mongoose's parameterized queries and bcrypt hashing instead. Functionality is unchanged — logins, searches, and bookings behave the same way from the user's perspective.
