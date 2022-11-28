import { Hotel } from "@prisma/client";

type NewHotel = Omit<Hotel, "id">;

const Hotel: NewHotel = {
  name: "IsaHotel",
  image: "https://pix10.agoda.net/hotelImages/124/1246280/1246280_16061017110043391702.jpg?ca=6&ce=1&s=1024x768",
  createdAt: new Date("23-11-2020"),
  updatedAt: new Date("12-10-2021")
};

// model Room {
//   name      String
//   capacity  Int
//   hotelId   Int
//   Hotel     Hotel     @relation(fields: [hotelId], references: [id])
//   Booking   Booking[]
//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt
// }

// model Booking {
//   User      User     @relation(fields: [userId], references: [id])
//   userId    Int
//   Room      Room     @relation(fields: [roomId], references: [id])
//   roomId    Int
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }
