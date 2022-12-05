import { prisma } from "@/config";
import { Booking } from "@prisma/client";
import dayjs from "dayjs";

export function createBooking(userId: number, roomId: number): Promise<Booking> {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
      createdAt: dayjs().subtract(1, "day").toDate(),
      updatedAt: dayjs().add(5, "days").toDate(),
    },
  });
}
