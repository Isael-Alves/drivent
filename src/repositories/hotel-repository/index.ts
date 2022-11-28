import { prisma } from "@/config";

async function findManyHotels() {
  return prisma.hotel.findMany();
}

async function findOneHotel(hotelId: number) {
  return prisma.hotel.findFirst(
    {
      where: {
        id: hotelId,
      }
    }
  );
}

async function findManyHotelRooms(hotelId: number) {
  return prisma.room.findMany(
    {
      where: {
        id: hotelId,
      }
    }
  );
}

const hotelRepository = {
  findManyHotels,
  findManyHotelRooms,
  findOneHotel
};

export default hotelRepository;
