import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function createBooking(bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt">) {
  return prisma.booking.create({
    data: {
      ...bookingData,
    }
  });
}

async function findBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    }
  });
}

async function updatedBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    }
  });
}

const bookingRepository = {
  createBooking,
  findBooking,
  updatedBooking
};

export default bookingRepository;
