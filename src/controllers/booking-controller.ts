import { notFoundError } from "@/errors";
import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBooking(Number(userId));

    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  try {
    if (!roomId) {
      throw notFoundError();
    }

    await bookingService.postBooking(Number(userId), Number(roomId));

    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  const { bookingId } = req.params;
  
  try {
    if (!roomId) {
      throw notFoundError();
    }
    
    await bookingService.putBooking(Number(userId), Number(roomId), Number(bookingId));
    
    return res.status(httpStatus.OK).send({ bookingId: Number(bookingId) });
  } catch (error) {
    if (error.name === "Forbidden") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
