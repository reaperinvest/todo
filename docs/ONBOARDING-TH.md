# คู่มือเริ่มต้น (Onboarding)

## สิ่งที่ต้องมี
- ติดตั้ง Node.js 18+ และ npm
- มี PostgreSQL ที่รันอยู่ในเครื่อง
- ติดตั้ง Git, Postman (desktop) และโปรแกรมแก้ไขโค้ด

## ตั้งค่าครั้งแรก
- ติดตั้งแพ็กเกจทั้งหมด: `npm install`
- สร้างฐานข้อมูล `todo`
- คัดลอกไฟล์ตัวอย่างเป็นไฟล์จริง:
  - `Copy-Item backend\.env.example backend\.env`
  - แก้ `DATABASE_URL` ให้ตรงกับเครื่อง
- สร้างตาราง (เลือกอย่างใดอย่างหนึ่ง):
  - `npm -w backend run migrate`
  - หรือสตาร์ท backend หนึ่งครั้ง ระบบจะสร้างให้เอง

## การรันระบบ
- Backend: `npm -w backend run dev` แล้วเปิด `http://localhost:4000/api/health`
- Frontend dev: `npm -w frontend run dev`
- หรือ build ครั้งเดียวแล้วเปิดไฟล์ `frontend/src/index.html`:
  - `npm -w frontend run build`

## โหมดข้อมูลของ Frontend
- Auto (ค่าเริ่มต้น): ถ้าติดต่อ API ได้จะใช้ DB จริง, ถ้าไม่ได้จะกลับไป localStorage
- บังคับใช้ API (สั่งใน Console ของเบราว์เซอร์):
  - `localStorage.setItem('data-source','api')`
  - `localStorage.setItem('api-base','http://localhost:4000')`
  - `location.reload()`

## ทดสอบ API ด้วย Postman
- Import คอลเลกชัน: `postman/todo-api.min.postman_collection.json`
- Import Environment: `postman/local.postman_environment.json` แล้วเลือก "Todo Local"
- ใช้ Runner รันลำดับ: Health → List → Create → Update → Delete → Clear

## เวิร์กโฟลว์รายวัน
- รัน backend + frontend
- พัฒนา/ทดสอบฟีเจอร์
- รัน Postman collection ให้ผ่านทั้งหมด
- อัปเดตเอกสารทั้ง `README.md` และ `README-TH.md` เมื่อมีการเปลี่ยนแปลงที่กระทบการใช้งาน
- Commit และ push

## คำสั่งที่ใช้บ่อย
- Backend: `npm -w backend run dev`
- Frontend (dev): `npm -w frontend run dev`
- Frontend (build): `npm -w frontend run build`
- Migrate: `npm -w backend run migrate`

## แก้ปัญหาพบได้บ่อย
- 500 จาก API: ตรวจ `backend/.env` และการเชื่อมต่อ DB
- 404 เวลา PATCH/DELETE: id ไม่ถูกต้อง (ให้ List ก่อน)
- Import Postman ไม่ได้: ใช้ Import แบบ Raw text ด้วยไฟล์ minimal
- Commit ไม่ผ่าน: ต้องอัปเดต README ทั้งสองไฟล์ (มี pre-commit ตรวจ)
