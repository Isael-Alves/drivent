import dayjs from "dayjs";
import faker from "@faker-js/faker";
import { Hotel, Room } from "@prisma/client";
import { prisma } from "@/config";

export function createHotel(params: Partial<Hotel> = {}): Promise<Hotel> {
  return prisma.hotel.create({
    data: {
      name: params.name || faker.lorem.sentence(),
      image: params.image || faker.image.imageUrl(),
      createdAt: params.createdAt || dayjs().subtract(1, "day").toDate(),
      updatedAt: params.updatedAt || dayjs().add(5, "days").toDate(),
    },
  });
}

export function createRooms(params: Partial<Room> = {}): Promise<Room> {
  return prisma.room.create({
    data: {
      name: params.name || faker.lorem.sentence(),
      capacity: params.capacity || faker.datatype.number(),
      hotelId: params.hotelId || faker.datatype.number(),
      createdAt: params.createdAt || dayjs().subtract(1, "day").toDate(),
      updatedAt: params.updatedAt || dayjs().add(5, "days").toDate(),
    },
  });
}
