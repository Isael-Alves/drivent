import enrollmentRepository from "@/repositories/enrollment-repository";
import { forbidden, notFoundError } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";
import bookingRepository from "@/repositories/booking-repository";

export async function getBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError;
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED" || !ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw notFoundError;
  }
  
  const booking = await bookingRepository.findBooking(userId);
  return booking;
}

export async function postBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError;
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED" || !ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw notFoundError;
  }
  const bookingData = {
    userId,
    roomId
  };

  // const room = await hotelRepository.findOneRoom(roomId);
  // console.log(room);
  const booking = await bookingRepository.createBooking(bookingData);
  return booking;
}

export async function putBooking(userId: number, roomId: number, bookingId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError;
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED" || !ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbidden;
  }

  const booking = await bookingRepository.updatedBooking(bookingId, roomId);
  return booking;
}

const bookingService = {
  postBooking,
  getBooking,
  putBooking
};

export default bookingService;
