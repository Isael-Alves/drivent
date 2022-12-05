import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import {
  createUser,
  createEnrollmentWithAddress,
  createTicket,
  createPayment,
  createHotel,
  createRooms,
  createTicketTypeRemoteAndIncludeHotel,
  findFirstRoomsByRoomId,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";
import { createBooking } from "../factories/booking-factory";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("When token is valid", () => {
    it("Should respond with status 200 and with booking body", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeRemoteAndIncludeHotel();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, TicketType.price);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const result = (await server.get("/booking").set("Authorization", `Bearer ${token}`));
      
      expect(result.status).toBe(httpStatus.OK);
      expect(result.body).toEqual({
        id: booking.id,
        userId: user.id,
        roomId: room.id,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      });
    });

    it("Should respond with status 404 when user adress not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const result = (await server.get("/booking").set("Authorization", `Bearer ${token}`));
      
      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 when user doesnt own given ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeRemoteAndIncludeHotel();
      await createTicket(enrollment.id, TicketType.id, TicketStatus.RESERVED);

      const result = (await server.get("/booking").set("Authorization", `Bearer ${token}`));

      expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("When token is valid", () => {
    //verificar se tem o ticket se o ticket é presencial, pago e com hospedagem
    
    it("Should respond with status 200 when post the booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeRemoteAndIncludeHotel();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, TicketType.price);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);

      const body = { roomId: room.id };

      const result = (await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body));
      expect(result.status).toBe(httpStatus.OK);
    });
    
    it("Should respond with status 404 when user adress not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createTicketTypeRemoteAndIncludeHotel();
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);

      const body = { roomId: room.id };

      const result = (await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body));
      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 when user doesnt own given ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeRemoteAndIncludeHotel();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, TicketType.price);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);

      const body = { roomId: room.id };

      const result = (await (await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body)));

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("Should respond with status 404 when roomId is not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeRemoteAndIncludeHotel();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, TicketType.price);
      const hotel = await createHotel();
      await createRooms(hotel.id);
      const newRoom = await findFirstRoomsByRoomId(enrollment.id);

      const body = { roomId: newRoom };

      const result = (await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body));
      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });
  });
});

describe("PUT /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.put("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("When token is valid", () => {
    it("Should respond with status 200 when the booking is updated", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeRemoteAndIncludeHotel();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, TicketType.price);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);
      const newRoom = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const body = { roomId: newRoom.id };

      const result = (await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body));

      expect(result.status).toBe(httpStatus.OK);
      expect(result.body).toEqual({
        bookingId: booking.id,
      });
    });

    it("Should respond with status 404 when the roomId is underfined", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeRemoteAndIncludeHotel();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, TicketType.price);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);
      const newRoom = await findFirstRoomsByRoomId(enrollment.id);
      const booking = await createBooking(user.id, room.id);

      const body = { roomId: newRoom };

      const result = (await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body));

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it("Should respond with status 403 when the ticket is invalid ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeRemoteAndIncludeHotel();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, TicketType.price);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);
      const newRoom = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const body = { roomId: newRoom.id };

      const result = (await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body));

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it("Should respond with status 404 when user adress not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);
      const newRoom = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const body = { roomId: newRoom.id };

      const result = (await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body));

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it("Should respond with status 401 when the user has no reservation", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const TicketType = await createTicketTypeRemoteAndIncludeHotel();
      const ticket = await createTicket(enrollment.id, TicketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, TicketType.price);
      const hotel = await createHotel();
      await createRooms(hotel.id);
      const newRoom = await createRooms(hotel.id);

      const body = { roomId: newRoom.id };

      const result = (await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body));

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });
});
