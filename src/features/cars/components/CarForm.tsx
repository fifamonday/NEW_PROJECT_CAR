import { createCarAction } from "@/features/cars/actions";

export default function CarForm() {
  return (
    <form
      action={createCarAction}
      className="admin-form"
    >
      <div className="two-col">
        <div>
          <label htmlFor="name">
            ชื่อรถ
          </label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="เช่น Toyota Camry"
            required
          />
        </div>

        <div>
          <label htmlFor="brand">
            ยี่ห้อ
          </label>

          <input
            id="brand"
            name="brand"
            type="text"
            placeholder="เช่น Toyota"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="licensePlate">
          ทะเบียนรถ
        </label>

        <input
          id="licensePlate"
          name="licensePlate"
          type="text"
          placeholder="เช่น กข 1234 เชียงใหม่"
          required
        />
      </div>

      <div className="two-col">
        <div>
          <label htmlFor="type">
            ประเภทรถ
          </label>

          <select
            id="type"
            name="type"
            defaultValue="รถเก๋ง"
            required
          >
            <option value="รถเก๋ง">
              รถเก๋ง
            </option>

            <option value="SUV">
              SUV
            </option>

            <option value="กระบะ">
              กระบะ
            </option>

            <option value="รถตู้">
              รถตู้
            </option>

            <option value="มอเตอร์ไซค์">
              มอเตอร์ไซค์
            </option>
          </select>
        </div>

        <div>
          <label htmlFor="pricePerDay">
            ราคา / วัน
          </label>

          <input
            id="pricePerDay"
            name="pricePerDay"
            type="number"
            min="0"
            placeholder="เช่น 1500"
            required
          />
        </div>
      </div>

      <div className="two-col">
        <div>
          <label htmlFor="seats">
            จำนวนที่นั่ง
          </label>

          <input
            id="seats"
            name="seats"
            type="number"
            min="1"
            placeholder="เช่น 5"
            required
          />
        </div>

        <div>
          <label htmlFor="transmission">
            เกียร์
          </label>

          <select
            id="transmission"
            name="transmission"
            defaultValue="อัตโนมัติ"
            required
          >
            <option value="อัตโนมัติ">
              ออโต้
            </option>

            <option value="ธรรมดา">
              ธรรมดา
            </option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="fuel">
          เชื้อเพลิง
        </label>

        <select
          id="fuel"
          name="fuel"
          defaultValue="เบนซิน"
          required
        >
          <option value="เบนซิน">
            เบนซิน
          </option>

          <option value="ดีเซล">
            ดีเซล
          </option>

          <option value="ไฟฟ้า">
            ไฟฟ้า
          </option>

          <option value="ไฮบริด">
            ไฮบริด
          </option>
        </select>
      </div>

      <div>
        <label htmlFor="image">
          URL รูปรถ
        </label>

        <input
          id="image"
          name="image"
          type="url"
          placeholder="https://example.com/car.jpg"
          required
        />
      </div>

      <label className="check">
        <input
          type="checkbox"
          name="available"
          defaultChecked
        />

        เปิดให้เช่า
      </label>

      <button
        type="submit"
        className="primary-button"
      >
        เพิ่มรถเข้าระบบ
      </button>
    </form>
  );
}