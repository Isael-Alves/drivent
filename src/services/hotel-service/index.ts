import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import { Hotel, Room } from "@prisma/client";

async function getHotels(): Promise<Hotel[]> {
  const hotels = await hotelRepository.findManyHotels();
  if (!hotels) throw notFoundError();

  return hotels;
}

async function getOneHotel(hotelId: number): Promise<Hotel> {
  const hotel = await hotelRepository.findOneHotel(hotelId);
  if (!hotel) throw notFoundError();

  return hotel;
}

async function getHotelRooms(hotelId: number): Promise<Room[]> {
  const rooms = await hotelRepository.findManyHotelRooms(hotelId);
  if (!rooms) throw notFoundError();

  return rooms;
}

const hotelService = {
  getHotels,
  getHotelRooms,
  getOneHotel
};

export default hotelService;
