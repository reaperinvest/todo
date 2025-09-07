# Todo Monorepo (Frontend + Backend)

โปรเจกต์นี้เป็น Monorepo แบ่งออกเป็น 2 ส่วนโดยใช้ npm workspaces:

- `frontend/`: แอป Todo ด้วย TypeScript + React + TailwindCSS (ไม่ใช้ bundler หนัก)
  - โหลด React 18 ผ่าน CDN ใน `frontend/src/index.html`
  - โค้ดหลักอยู่ที่ `frontend/src/react-app.ts` และโฟลเดอร์ `frontend/src/components/`
  - คอมไพล์ TypeScript ไปที่ `frontend/public/build/` และหน้า HTML โหลด `../public/build/react-app.js`
- `backend/`: เซิร์ฟเวอร์ Node HTTP แบบ minimal ให้ REST API สำหรับ Todo

## เริ่มต้นใช้งาน (Quick start)

ทำงานจากโฟลเดอร์รากของ repo:

- โหมดพัฒนา Frontend (watch Tailwind + TypeScript):

  ```bash
  npm run dev:frontend
  ```

  แล้วเปิด `frontend/src/index.html` ในเบราว์เซอร์ (หรือเสิร์ฟโฟลเดอร์ด้วย static server)
  หมายเหตุ: ให้แน่ใจว่าไฟล์ `frontend/public/build/react-app.js` ถูกสร้างโดย watcher แล้ว

### รายละเอียด Frontend (React + TypeScript)

- หน้าหลักโหลด React 18 จาก CDN และ mount แอปจาก `frontend/public/build/react-app.js` (ซอร์ส: `frontend/src/react-app.ts`)
- ไม่ต้องใช้ bundler หากภายหลังต้องการย้ายไป Vite/Next ก็ย้ายคอมโพเนนต์ได้ง่าย

- สร้างไฟล์ Frontend ครั้งเดียว:

  ```bash
  npm run build:frontend
  ```

- รัน Backend dev server:

  ```bash
  npm run dev:backend
  ```

  API จะรันที่ `http://localhost:4000` โดยมีเส้นทางตัวอย่าง:

  - `GET    /api/todos`
  - `POST   /api/todos`        (body: `{ text, priority }`)
  - `PATCH  /api/todos/:id`    (body: partial `{ text?, completed?, priority? }`)
  - `DELETE /api/todos/:id`
  - `DELETE /api/todos?only=completed`

## หมายเหตุ

- ฝั่ง frontend มีชั้น repository (`frontend/src/data/repository.ts`) ค่าเริ่มต้นใช้ `localStorage` และสามารถสลับไปใช้ API ได้โดยไม่ต้องแก้ UI
- Tailwind จะสร้างไฟล์ที่ `frontend/public/styles.css` ควรรัน dev/build ก่อนเปิดหน้า HTML
- TypeScript จะคอมไพล์ไปที่ `frontend/public/build/` ในโหมด dev จะ watch และเขียนไฟล์ให้อัตโนมัติ

## สลับ Frontend ไปใช้ Backend API

โดยปกติ frontend ใช้ `localStorage` ถ้าต้องการสลับไปใช้ HTTP API:

1) สตาร์ท backend: `npm run dev:backend`
2) เปิด DevTools Console ในเบราว์เซอร์แล้วสั่ง:

```js
localStorage.setItem('data-source', 'api');
localStorage.setItem('api-base', 'http://localhost:4000');
location.reload();
```

สลับกลับมา local mode:

```js
localStorage.setItem('data-source', 'local');
location.reload();
```

UI มีสถานะโหลดและ error handling พื้นฐานให้แล้ว

## ชุดคำสั่งที่ใช้บ่อย (Scripts)

ใช้จากโฟลเดอร์รากของ repo:

- `npm run dev:frontend` — รัน Tailwind (watch) + TypeScript (watch) ที่ `frontend/`
- `npm run build:frontend` — สร้าง CSS + TypeScript ครั้งเดียว
- `npm run dev:backend` — สตาร์ท API (โหมดพัฒนา)
- `npm run start:backend` — สตาร์ท API (โหมดใกล้ production)

ภายใน `frontend/` (หากอยากใช้สคริปต์ภายในโฟลเดอร์นั้น):

- `npm run dev` — เทียบเท่า `dev:frontend`
- `npm run build` — เทียบเท่า `build:frontend`
- `npm run type-check` — ตรวจ TypeScript อย่างเดียว

## ฐานข้อมูล (PostgreSQL)

- Backend รองรับ PostgreSQL เพื่อเก็บข้อมูลถาวร
- ตั้งค่าด้วยตัวแปรแวดล้อม (เลือกอย่างใดอย่างหนึ่ง):
  - `DATABASE_URL` (เช่น `postgres://user:pass@localhost:5432/todo`)
  - หรือระบุแยก `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` (ถ้าต้องการ SSL: `PGSSL=1`)
- เมื่อรันเซิร์ฟเวอร์ครั้งแรก ระบบจะสร้างตาราง `todos` ให้อัตโนมัติหากยังไม่มี
- คำสั่ง migration แบบครั้งเดียว: `npm -w backend run migrate`

ตัวอย่าง (Windows PowerShell):

```powershell
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/todo"; npm -w backend run dev
```

ตัวอย่าง (bash):

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/todo npm -w backend run dev
```

### การใช้ไฟล์ .env (แนะนำ)

- คัดลอก `backend/.env.example` เป็น `backend/.env` แล้วแก้ไขค่าจริงของคุณ
- Backend โหลด `.env` อัตโนมัติผ่าน dotenv จึงสามารถรันได้ทันทีด้วย:

```bash
npm -w backend run dev
```

หมายเหตุ: ถ้ารหัสผ่านมีอักขระพิเศษ (@, #, ?, / ฯลฯ) ให้เขียนแบบ URL-encode ใน `DATABASE_URL` เช่น @ → %40, # → %23

## แนวทางการมีส่วนร่วม (Contributing)

- เอกสาร: เมื่อมีการเปลี่ยนแปลงฟังก์ชัน โครงสร้าง สคริปต์ ขั้นตอนใช้งาน หรือเอ็นพอยต์ โปรดอัปเดตทั้ง `README.md` และ `README-TH.md` ให้สอดคล้องกันเสมอ
- การตรวจเอกสารก่อน commit (Husky): มี hook ตรวจว่าเมื่อมีการแก้โค้ด/คอนฟิก แต่ไม่อัปเดต README ทั้งสองไฟล์ การ commit จะล้มเหลว ให้รัน `npm install` หนึ่งครั้งหลังโคลนเพื่อเปิดใช้งาน hook

“- งานบำรุงรักษา: อัปเดต lockfile (YYYY-MM-DD)”