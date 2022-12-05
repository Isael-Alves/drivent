import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import {
  createUser,
  createHotel,
  createEnrollmentWithAddress,
  createTicketTypeWithHotel,
  createTicket,
  createPayment,
  createTicketTypeRemote,
  createRooms
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("When token is valid", () => {
    it("Should respond with status 404 when user ticket is remote ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, TicketType.price);

      const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
      expect(result.body).toEqual({});
    });

    it("Should respond with status 404 when user has no enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createTicketTypeRemote();

      const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
      expect(result.body).toEqual({});
    });

    it("Should respond with status 200 and a list of hotels", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, TicketType.price);

      const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(result.status).toEqual(httpStatus.OK);
      expect(result.body).toEqual(
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

    it("Should respond with status 200 and an empty array", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, TicketType.price);

      const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.OK);
      expect(result.body).toEqual([]);
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("When token is valid", () => {
    it("Should respond with status 404 when user ticket is remote ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, TicketType.price);
      const hotel = await createHotel();
      const result = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
      expect(result.body).toEqual({});
    });

    it("Should respond with status 404 when user has no enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createTicketTypeRemote();

      const hotel = await createHotel();
      const result = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
      expect(result.body).toEqual({});
    });

    it("Should respond with status 200 and hotel with rooms", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, TicketType.price);
      const room = await createRooms(hotel.id);

      const result = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(result.status).toEqual(httpStatus.OK);
      expect(result.body).toEqual(
        {
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          Rooms: [{
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString(),
          }],
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
        }
      );
    });

    it("Should respond with status 200 and hotel with no rooms", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, TicketType.price);

      const result = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(result.status).toEqual(httpStatus.OK);
      expect(result.body).toEqual(
        {
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          Rooms: [],
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
        }
      );
    });
  });
});
