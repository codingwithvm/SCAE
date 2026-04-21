import { errorResponse } from "../shared";

export const authPaths = {
  "/auth/login/student": {
    post: {
      tags: ["Authentication"],
      summary: "Student login",
      description: "Authenticates a student using their registration number and birth date.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["registrationNumber", "birthDate"],
              properties: {
                registrationNumber: { type: "string", example: "2025001" },
                birthDate: { type: "string", format: "date", example: "2010-05-15" },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Login successful",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthenticationTokenResponse" },
            },
          },
        },
        "400": errorResponse("Missing or invalid fields", "registrationNumber and birthDate are required"),
        "401": errorResponse("Invalid credentials", "Invalid credentials"),
      },
    },
  },

  "/auth/login/staff": {
    post: {
      tags: ["Authentication"],
      summary: "Staff login",
      description: "Authenticates a staff member (teacher, coordinator, municipal manager, or admin) using email and password.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email", example: "admin@scae.dev" },
                password: { type: "string", example: "password123" },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Login successful",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthenticationTokenResponse" },
            },
          },
        },
        "400": errorResponse("Missing fields", "email and password are required"),
        "401": errorResponse("Invalid credentials", "Invalid credentials"),
      },
    },
  },
};
