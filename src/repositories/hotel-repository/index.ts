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

async function findOneRoom(roomId: number) {
  return prisma.room.findFirst(
    {
      where: {
        id: roomId,
      }
    }
  );
}

async function findManyHotelRooms(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    }
  }
  );
}

const hotelRepository = {
  findManyHotels,
  findManyHotelRooms,
  findOneHotel,
  findOneRoom
};

export default hotelRepository;
