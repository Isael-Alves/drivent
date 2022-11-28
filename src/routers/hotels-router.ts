import { Router } from "express";
import { getHotelByUser, getHotelRoomById } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter
  .get("/", getHotelByUser)
  .get("/:hotelId", getHotelRoomById);

export { hotelsRouter };
