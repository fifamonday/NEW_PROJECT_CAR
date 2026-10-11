
"use server";

import { getCurrentUser } from "@/features/auth/service";

import {
  createBooking,
  getBooking,
  getBookings,
  updateBooking,
  updateBookingStatus,
} from "@/features/bookings/service";

import {
  getCars,
  setCarAvailability,
} from "@/features/cars/service";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type BookingStatus = Parameters<typeof updateBookingStatus>[1];

/* =========================================================
   CREATE BOOKING
========================================================= */

export async function createBookingAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent("กรุณาเข้าสู่ระบบก่อนเช่ารถ")}`
    );
  }

  const carId = Number(formData.get("carId"));
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");

  if (
    !Number.isInteger(carId) ||
    carId <= 0 ||
    !startDate ||
    !endDate ||
    !startTime ||
    !endTime
  ) {
    return {
      success: false as const,
      message: "กรุณากรอกข้อมูลการเช่าให้ครบ",
    };
  }

  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);

  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    end <= start
  ) {
    return {
      success: false as const,
      message: "วันและเวลาคืนรถต้องอยู่หลังวันและเวลารับรถ",
    };
  }

  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 1) {
    return {
      success: false as const,
      message: "ระยะเวลาเช่าไม่ถูกต้อง",
    };
  }

  const cars = await getCars();
  const car = cars.find((item) => Number(item.id) === carId);

  if (!car) {
    return {
      success: false as const,
      message: "ไม่พบรถที่ต้องการเช่า",
    };
  }

  if (!car.available) {
    return {
      success: false as const,
      message: "รถยังไม่เปิดเช่า",
    };
  }

  await createBooking({
    carId: car.id,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    carName: car.name,
    licensePlate: car.licensePlate,
    startDate,
    endDate,
    days,
    total: days * car.pricePerDay,
  });

  revalidatePath("/account");
  revalidatePath("/admin/bookings");
  revalidatePath("/");
  revalidatePath("/admin/cars");

  return {
    success: true as const,
    message: "ส่งคำขอเช่ารถเรียบร้อย",
  };
}

/* =========================================================
   UPDATE BOOKING
========================================================= */

export async function updateBookingAction(
  id: number,
  formData: FormData
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  const endDate = String(formData.get("endDate") ?? "");

  if (!endDate) {
    throw new Error("กรุณาเลือกวันคืนรถ");
  }

  await updateBooking(id, endDate);

  revalidatePath("/admin/bookings");
  revalidatePath("/account");

  redirect("/admin/bookings");
}

/* =========================================================
   UPDATE BOOKING STATUS
========================================================= */

export async function updateBookingStatusAction(
  id: number,
  status: BookingStatus
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  const updatedBooking = await updateBookingStatus(id, status);

  if (status === "ยืนยันแล้ว") {
    await setCarAvailability(updatedBooking.carId, false);
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/account");
  revalidatePath("/");
  revalidatePath("/admin/cars");
}

/* =========================================================
   USER RETURNS CAR
========================================================= */

export async function returnCarAction(id: number) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const booking = await getBooking(id);

  if (
    !booking ||
    booking.userEmail?.toLowerCase() !== user.email.toLowerCase()
  ) {
    throw new Error("ไม่พบรายการเช่าของคุณ");
  }

  if (booking.status !== "ยืนยันแล้ว") {
    throw new Error(
      "สามารถคืนรถได้เฉพาะรายการที่ยืนยันแล้วเท่านั้น"
    );
  }

  // เปลี่ยนสถานะรายการเดิม ไม่ลบประวัติ
  await updateBookingStatus(id, "คืนรถแล้ว");

  // ถ้ายังมีรายการอื่นที่ยืนยันแล้วของรถคันเดียวกัน
  // ให้คงสถานะรถเป็นไม่พร้อมเช่า
  const allBookings = await getBookings();

  const hasOtherConfirmedBooking = allBookings.some(
    (item) =>
      item.carId === booking.carId &&
      item.id !== booking.id &&
      item.status === "ยืนยันแล้ว"
  );

  if (!hasOtherConfirmedBooking) {
    await setCarAvailability(booking.carId, true);
  }

  revalidatePath("/account");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/cars");
  revalidatePath("/");
}
