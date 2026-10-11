
"use client";

import { useMemo, useState } from "react";
import { createBookingAction } from "@/features/bookings/actions";
import type { Car } from "@/features/cars/schema";

type BookingModalProps = {
  car: Car;
  onClose: () => void;
};

export default function BookingModal({
  car,
  onClose,
}: BookingModalProps) {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const today = new Date().toLocaleDateString("en-CA");

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;

    const start = new Date(`${startDate}T${startTime || "00:00"}`);
    const end = new Date(`${endDate}T${endTime || "00:00"}`);

    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      end <= start
    ) {
      return 0;
    }

    return Math.max(
      1,
      Math.ceil(
        (end.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  }, [startDate, startTime, endDate, endTime]);

  const total = days * car.pricePerDay;

  function showError(message: string) {
    setErrorMessage(message);
    setShowErrorPopup(true);
  }

  function handleStartDateChange(value: string) {
    setStartDate(value);

    if (endDate && value >= endDate) {
      setEndDate("");
      setEndTime("");
    }
  }

  function handleStartTimeChange(value: string) {
    setStartTime(value);

    if (
      startDate &&
      endDate === startDate &&
      endTime &&
      endTime <= value
    ) {
      setEndTime("");
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!startDate) {
      showError("กรุณาเลือกวันรับรถก่อน");
      return;
    }

    if (!startTime) {
      showError("กรุณาเลือกเวลารับรถก่อน");
      return;
    }

    if (!endDate) {
      showError("กรุณาเลือกวันคืนรถ");
      return;
    }

    if (!endTime) {
      showError("กรุณาเลือกเวลาคืนรถ");
      return;
    }

    if (
      endDate < startDate ||
      (endDate === startDate && endTime <= startTime)
    ) {
      showError(
        "วันและเวลาคืนรถต้องอยู่หลังวันและเวลารับรถ"
      );
      return;
    }

    if (!car.available) {
      showError("รถยังไม่เปิดเช่า");
      return;
    }

    setLoading(true);

    try {
      // สร้าง FormData ก่อน await เพื่อไม่ให้ event.currentTarget หาย
      const formData = new FormData(event.currentTarget);

      formData.set("carId", String(car.id));
      formData.set("startDate", startDate);
      formData.set("startTime", startTime);
      formData.set("endDate", endDate);
      formData.set("endTime", endTime);

      const result = await createBookingAction(formData);

      if (!result.success) {
        showError(result.message);
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Booking error:", error);

      showError(
        error instanceof Error &&
          error.message.includes("กรุณาเข้าสู่ระบบ")
          ? error.message
          : "ไม่สามารถทำรายการเช่าได้ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setLoading(false);
    }
  }

  // หน้าจอยืนยันการจอง
  if (submitted) {
    return (
      <div
        className="booking-modal-overlay"
        onClick={onClose}
      >
        <div
          className="booking-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-success-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="booking-success-icon">✓</div>

          <h2 id="booking-success-title">
            ส่งคำขอเช่ารถเรียบร้อย
          </h2>

          <p>
            ระบบได้รับคำขอเช่ารถ {car.name} แล้ว
          </p>

          <div className="booking-summary">
            <p>
              <strong>วันรับรถ:</strong> {startDate} เวลา{" "}
              {startTime}
            </p>

            <p>
              <strong>วันคืนรถ:</strong> {endDate} เวลา{" "}
              {endTime}
            </p>

            <p>
              <strong>จำนวนวัน:</strong> {days} วัน
            </p>

            <p>
              <strong>ราคารวม:</strong>{" "}
              {total.toLocaleString("th-TH")} บาท
            </p>
          </div>

          <button
            type="button"
            className="primary-button booking-popup-button"
            onClick={onClose}
          >
            ตกลง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="booking-modal-overlay"
      onClick={onClose}
    >
      {/* Popup แจ้งเตือน */}
      {showErrorPopup && (
        <div
          className="booking-popup-overlay"
          onClick={() => setShowErrorPopup(false)}
        >
          <div
            className="booking-popup"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="booking-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="booking-popup-icon"
              aria-hidden="true"
            >
              !
            </div>

            <h2 id="booking-popup-title">
              {errorMessage === "รถยังไม่เปิดเช่า"
                ? "รถยังไม่พร้อมให้เช่า"
                : "ทำรายการไม่สำเร็จ"}
            </h2>

            <p>{errorMessage}</p>

            <button
              type="button"
              className="booking-popup-button"
              onClick={() => setShowErrorPopup(false)}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      <div
        className="booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="booking-close-button"
          onClick={onClose}
        >
          ×
        </button>

        <h2 id="booking-title">จองรถเช่า</h2>

        <div className="booking-car-info">
          <h3>{car.name}</h3>

          <p>
            ทะเบียนรถ: {car.licensePlate}
          </p>

          <p>
            ราคา {car.pricePerDay.toLocaleString("th-TH")} บาท/วัน
          </p>
        </div>

        {!car.available && (
          <div className="booking-unavailable-message">
            รถคันนี้ยังไม่เปิดให้จอง กรุณาเลือกรถคันอื่น
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="hidden"
            name="carId"
            value={car.id}
          />

          <div className="booking-form-group">
            <label htmlFor="startDate">
              วันรับรถ
            </label>

            <input
              id="startDate"
              name="startDate"
              type="date"
              min={today}
              value={startDate}
              onChange={(event) =>
                handleStartDateChange(event.target.value)
              }
              required
            />
          </div>

          <div className="booking-form-group">
            <label htmlFor="startTime">
              เวลารับรถ
            </label>

            <input
              id="startTime"
              name="startTime"
              type="time"
              value={startTime}
              onChange={(event) =>
                handleStartTimeChange(event.target.value)
              }
              required
            />
          </div>

          <div className="booking-form-group">
            <label htmlFor="endDate">
              วันคืนรถ
            </label>

            <input
              id="endDate"
              name="endDate"
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setEndTime("");
              }}
              required
            />
          </div>

          <div className="booking-form-group">
            <label htmlFor="endTime">
              เวลาคืนรถ
            </label>

            <input
              id="endTime"
              name="endTime"
              type="time"
              value={endTime}
              onChange={(event) =>
                setEndTime(event.target.value)
              }
              required
            />
          </div>

          <div className="booking-total">
            <p>
              จำนวนวันเช่า: <strong>{days} วัน</strong>
            </p>

            <p>
              ราคารวม:{" "}
              <strong>
                {total.toLocaleString("th-TH")} บาท
              </strong>
            </p>
          </div>


          <button
            type="submit"
            className="booking-confirm-button"
          >
            ยืนยันการจอง
          </button>

        </form>
      </div>
    </div>
  );
}
