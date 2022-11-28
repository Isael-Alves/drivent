import app, { init } from "@/app";
import httpStatus from "http-status";
import supertest from "supertest";
import { createHotel, createRooms } from "../factories/hotels-factory";
import { cleanDb } from "../helpers";

beforeAll(async () => {
  await init();
});

afterAll(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 200 if there is hotels", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.OK);
  });

  it("should respond with status 200 and hotel data if there is an hotels", async () => {
    const hotel = await createHotel();

    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
        }),
      ]),
    );
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 200 if there is hotels", async () => {
    const response = await server.get("/hotels?hotelId=8");

    expect(response.status).toBe(httpStatus.OK);
  });

  // it("should respond with status 200 if there is hotels", async () => {
  //   const response = await server.get("/hotels");

  //   expect(response.status).toBe(httpStatus.OK);
  // });

  it("should respond with status 200 and hotel data if there is an hotels", async () => {
    const rooms = await createRooms();

    const response = await server.get("/hotels?hotelId=8");

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: rooms.id,
          name: rooms.name,
          capacity: rooms.capacity,
          hotelId: rooms.hotelId,
          createdAt: rooms.createdAt.toISOString(),
          updatedAt: rooms.updatedAt.toISOString(),
        }),
      ]),
    );
  });
});
