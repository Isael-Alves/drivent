import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { Hotel, Room } from "@prisma/client";
import { notFoundError } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number): Promise<Hotel[]> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError;
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw notFoundError;
  }

  const hotels = await hotelRepository.findManyHotels();
  return hotels;
}

async function getOneHotel(hotelId: number): Promise<Hotel> {
  const hotel = await hotelRepository.findOneHotel(hotelId);
  return hotel;
}

async function getHotelWithRooms(hotelId: number, userId: number): Promise<(Hotel & { Rooms: Room[]})> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError;
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw notFoundError;
  }

  const hotel = await hotelRepository.findManyHotelRooms(hotelId);

  if (!hotel) {
    throw notFoundError;
  }

  return hotel;
}

const hotelService = {
  getHotels,
  getHotelWithRooms,
  getOneHotel
};

export default hotelService;
