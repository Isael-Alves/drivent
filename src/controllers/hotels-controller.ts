import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotel-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  
  try {
    const hotels = await hotelService.getHotels(Number(userId));
    
    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function getHotelRoomById(req: AuthenticatedRequest, res: Response) {
  const { hotelId } = req.params;

  try {
    const Rooms = await hotelService.getHotelRooms(Number(hotelId));
    const hotel = await hotelService.getOneHotel(Number(hotelId));

    const result = {
      ...hotel,
      Rooms,
    };

    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}
