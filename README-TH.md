# Todo Monorepo (Frontend + Backend) — ภาษาไทย
เริ่มต้น
โปรเจกต์นี้เป็นโมโนรีโปที่แยกเป็น 2 แอป:

- `frontend/`: แอป Todo เขียนด้วย TypeScript + React และใช้ TailwindCSS (ไม่พึ่งบันเดิลเลอร์หนักๆ)
  - React 18 โหลดผ่าน CDN ใน `frontend/src/index.html`
  - ซอร์ส TypeScript อยู่ที่ `frontend/src/react-app.ts` และโฟลเดอร์ `frontend/src/components/`
  - TypeScript คอมไพล์ไปที่ `frontend/public/build/` และหน้า HTML โหลดสคริปต์ `../public/build/react-app.js`
- `backend/`: เซิร์ฟเวอร์ Node HTTP แบบมินิมอล ให้ Todo API (ยังไม่มีฐานข้อมูล)

## เริ่มต้นอย่างรวดเร็ว

รันจากโฟลเดอร์รูทของรีโป:

1) ติดตั้งแพ็กเกจทั้งหมด (ใช้ npm workspaces)

```bash
npm install
```

2) พัฒนา Frontend (watch ทั้ง Tailwind + TypeScript):

```bash
npm run dev:frontend
```

เปิดไฟล์ `frontend/src/index.html` ในเบราว์เซอร์ของคุณ (หรือเสิร์ฟโฟลเดอร์ด้วย static server ที่คุณถนัด)
หมายเหตุ: ให้แน่ใจว่าสคริปต์ watch ได้สร้างไฟล์ `frontend/public/build/react-app.js` แล้ว (สคริปต์ dev จะดูแลให้)

3) พัฒนา Backend:

```bash
npm run dev:backend
```

API จะรันที่ `http://localhost:4000`

## สคริปต์ที่มีให้ใช้

รันจากรูท (ควบคุม workspace):

- `npm run dev:frontend` — รัน Tailwind (watch) + TypeScript (watch) ในโฟลเดอร์ `frontend/`
- `npm run build:frontend` — สร้างไฟล์ CSS + TypeScript ครั้งเดียว
- `npm run dev:backend` — เริ่มต้นเซิร์ฟเวอร์ API ตัวอย่าง
- `npm run start:backend` — เริ่มต้นแบ็กเอนด์โหมด production-like (เหมือน `dev` ในโปรเจกต์นี้)

ภายในโฟลเดอร์ `frontend/` (ถ้าต้องการรันเฉพาะส่วนหน้า):

- `npm run dev` — เหมือน `dev:frontend` ที่รูท
- `npm run build` — เหมือน `build:frontend` ที่รูท
- `npm run type-check` — เช็กชนิดข้อมูล TypeScript อย่างเดียว

## โครงสร้าง Frontend แบบย่อ

- หน้า HTML หลัก: `frontend/src/index.html`
- แอป React (ไม่มี JSX ใช้ `React.createElement`): `frontend/src/react-app.ts`
- คอมโพเนนต์: `frontend/src/components/` (เช่น `Header.ts`, `Dashboard.ts`, `SearchBar.ts`, `TodoItem.ts`, `TodoList.ts`)
- ชั้นข้อมูล (Repository): `frontend/src/data/repository.ts` เลือกแหล่งข้อมูลได้ระหว่าง `localStorage` หรือ HTTP API
- สไตล์: Tailwind เริ่มจาก `frontend/src/styles/main.css` และ build ไป `frontend/public/styles.css`

## API แบ็กเอนด์ (สรุป)

ฐานข้อมูลเป็น in-memory (ข้อมูลหายเมื่อรีสตาร์ต) เส้นทางที่มี:

- `GET    /api/todos` — ดึงรายการทั้งหมด
- `POST   /api/todos` — สร้างงานใหม่ (บอดี: `{ text, priority }` โดย `priority` เป็น `low|medium|high`)
- `PATCH  /api/todos/:id` — อัปเดตบางส่วน (บอดี: `{ text?, completed?, priority? }`)
- `DELETE /api/todos/:id` — ลบงานตามไอดี
- `DELETE /api/todos?only=completed` — ลบเฉพาะงานที่ทำเสร็จแล้ว

ตัวอย่างเรียกสร้างงานด้วย cURL:

```bash
curl -X POST http://localhost:4000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "Buy milk", "priority": "medium"}'
```

## การสลับแหล่งข้อมูล (Frontend)

โดยค่าเริ่มต้น Frontend จะใช้ `localStorage`. หากต้องการสลับไปใช้ HTTP API:

1) เริ่มต้นเซิร์ฟเวอร์แบ็กเอนด์: `npm run dev:backend`
2) เปิด DevTools Console ในเบราว์เซอร์ แล้วรัน:

```js
localStorage.setItem('data-source', 'api');
localStorage.setItem('api-base', 'http://localhost:4000');
location.reload();
```

สลับกลับมาโหมด local:

```js
localStorage.setItem('data-source', 'local');
location.reload();
```

UI รองรับสถานะกำลังโหลดและแสดงข้อผิดพลาดจาก API แล้วในระดับพื้นฐาน

## หมายเหตุและเคล็ดลับ

- Tailwind จะ build ออกไปที่ `frontend/public/styles.css` และ TypeScript จะ build ไป `frontend/public/build/` ดังนั้นควรรัน `dev` หรือ `build` ให้เสร็จก่อนเปิดหน้า HTML
- หากเปิดไฟล์ `frontend/src/index.html` ตรงๆ แล้วสไตล์ไม่ขึ้นหรือสคริปต์ไม่ทำงาน ให้ตรวจสอบว่าไฟล์ `public/styles.css` และ `public/build/react-app.js` ถูกสร้างแล้ว หรือพิจารณาเสิร์ฟผ่าน static server (เช่น `npx http-server frontend`)
- ชั้น Repository (`frontend/src/data/repository.ts`) ทำให้สามารถย้ายไปใช้แบ็กเอนด์จริงในภายหลังโดยไม่ต้องแก้ UI มาก — เพียงคงสัญญา API ให้เหมือนเดิม

## แนวทางต่อยอด

- เชื่อมต่อฐานข้อมูลจริงให้กับแบ็กเอนด์ (เช่น SQLite/Postgres) และเพิ่มการตรวจสอบข้อมูลฝั่งเซิร์ฟเวอร์
- เพิ่มชุดทดสอบ (unit/integration) สำหรับ repository และคอมโพเนนต์สำคัญ
- ใช้บันเดิลเลอร์/เฟรมเวิร์ก (เช่น Vite/Next) หากต้องการ DX ที่ครบขึ้น โดยย้ายโค้ดปัจจุบันเข้าโปรเจกต์ใหม่ได้โดยแทบไม่ต้องแก้ที่ชั้น Repository

---

หากต้องการความช่วยเหลือในการตั้งค่าแวดล้อมหรือดีบักเพิ่มเติม แจ้งรายละเอียดระบบของคุณ (เช่นเวอร์ชัน Node.js/เบราว์เซอร์) เพื่อช่วยวิเคราะห์ได้รวดเร็วยิ่งขึ้น

## แนวทางการเขียนเอกสาร

- เอกสาร: เมื่อมีการเปลี่ยนแปลงโครงสร้าง โค้ด สคริปต์ หรือขั้นตอนการใช้งาน ให้ปรับปรุงทั้ง README.md และ README-TH.md ให้สอดคล้องกันเสมอ
## ฐานข้อมูล (PostgreSQL)

- Backend รองรับ PostgreSQL สำหรับจัดเก็บข้อมูลถาวรแล้ว
- ตั้งค่าได้ด้วยตัวแปรแวดล้อม: ใช้ `DATABASE_URL` (เช่น `postgres://user:pass@localhost:5432/todo`) หรือกำหนดแยก `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` (ถ้าจำเป็น `PGSSL=1`)
- เมื่อรันเซิร์ฟเวอร์ครั้งแรก ระบบจะสร้างตาราง `todos` ให้อัตโนมัติหากยังไม่มี
- มีคำสั่งช่วย migration: `npm -w backend run migrate`

ตัวอย่าง (Windows PowerShell):

```powershell
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/todo"; npm -w backend run dev
```

ตัวอย่าง (bash):

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/todo npm -w backend run dev
```

