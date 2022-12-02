import { Router } from "express";
import { getHotels, getHotelRoomById } from "@/controllers";
import { authenticateToken } from "@/middlewares";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/:hotelId", getHotelRoomById);

export { hotelsRouter };
