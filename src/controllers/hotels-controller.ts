import hotelService from "@/services/hotel-service";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function getHotelByUser(req: Request, res: Response) {
  try {
    const hotels = await hotelService.getHotels();

    if (!hotels) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function getHotelRoomById(req: Request, res: Response) {
  const { hotelId } = req.params;
  
  const id = Number(hotelId);
  try {
    const Rooms = await hotelService.getHotelRooms(id);
    const hotel = await hotelService.getOneHotel(id);

    const result = {
      ...hotel,
      Rooms,
    };

    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}
