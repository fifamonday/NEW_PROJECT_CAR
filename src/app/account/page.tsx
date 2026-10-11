
import { getCurrentUser } from "@/features/auth/service";
import { getUserBookings } from "@/features/bookings/service";
import ReturnCarButton from "@/features/bookings/components/ReturnCarButton";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const bookings = await getUserBookings(user.email);

  return (
    <main className="account-page">
      <div className="account-card">
        <h1>รายการเช่าของฉัน</h1>

        <p>ประวัติการจองรถของ {user.name}</p>

        <p className="muted">{user.email}</p>

        {bookings.length === 0 ? (
          <div className="empty">ยังไม่มีประวัติการเช่ารถ</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>รถ</th>
                  <th>วันที่รับ</th>
                  <th>วันที่คืน</th>
                  <th>จำนวนวัน</th>
                  <th>รวม</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.carName}</td>

                    <td>{booking.startDate}</td>

                    <td>{booking.endDate}</td>

                    <td>{booking.days}</td>

                    <td>฿{booking.total.toLocaleString("th-TH")}</td>

                    <td>
                      <span
                        className={`status ${
                          booking.status === "ยืนยันแล้ว" ||
                          booking.status === "คืนรถแล้ว"
                            ? "status-success"
                            : booking.status === "ยกเลิก"
                              ? "status-danger"
                              : "status-warning"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td>
                      {booking.status === "ยืนยันแล้ว" ? (
                        <ReturnCarButton bookingId={booking.id} />
                      ) : booking.status === "คืนรถแล้ว" ? (
                        <span className="muted">คืนรถแล้ว</span>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
