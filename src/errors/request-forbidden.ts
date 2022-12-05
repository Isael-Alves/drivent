import { ApplicationError } from "@/protocols";

export function forbidden(): ApplicationError {
  return {
    name: "Forbidden",
    message: "forbidden request forbidden by administrative rules!",
  };
}
