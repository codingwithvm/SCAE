import { errorResponse } from "../shared";

const userIdParameter = {
  name: "id",
  in: "path",
  required: true,
  description: "User UUID",
  schema: { type: "string", format: "uuid" },
};

export const usersPaths = {
  "/users": {
    post: {
      tags: ["Users"],
      summary: "Create user",
      description:
        "Creates a new user with role-specific validation. Only ADMIN can manage users.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["role", "name"],
              properties: {
                role: {
                  type: "string",
                  enum: [
                    "STUDENT",
                    "TEACHER",
                    "SCHOOL_MANAGER",
                    "MUNICIPAL_MANAGER",
                    "ADMIN",
                  ],
                },
                name: { type: "string", example: "Maria Silva" },
                email: {
                  type: "string",
                  format: "email",
                  example: "carlos@escola.edu.br",
                  nullable: true,
                },
                registrationNumber: {
                  type: "string",
                  example: "2026001",
                  nullable: true,
                },
                birthDate: {
                  type: "string",
                  format: "date",
                  example: "2015-03-10",
                  nullable: true,
                },
                password: {
                  type: "string",
                  example: "senhaSegura123",
                  nullable: true,
                },
                schoolId: {
                  type: "string",
                  format: "uuid",
                  nullable: true,
                },
                municipalityId: {
                  type: "string",
                  format: "uuid",
                  nullable: true,
                },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "User created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
        "400": errorResponse("Validation error", "role and name are required"),
        "401": errorResponse(
          "Not authenticated",
          "Authorization header is required",
        ),
        "403": errorResponse(
          "Insufficient permissions",
          "Insufficient permissions",
        ),
        "404": errorResponse("Referenced entity not found", "School not found"),
        "409": errorResponse(
          "Unique constraint violation",
          "User with this email already exists",
        ),
      },
    },
    get: {
      tags: ["Users"],
      summary: "List users",
      description:
        "Returns a paginated list of users. Supports filtering by role, school, and class assignment or enrollment.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "role",
          in: "query",
          schema: {
            type: "string",
            enum: [
              "STUDENT",
              "TEACHER",
              "SCHOOL_MANAGER",
              "MUNICIPAL_MANAGER",
              "ADMIN",
            ],
          },
          description: "Filter by user role",
        },
        {
          name: "schoolId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filter by school UUID",
        },
        {
          name: "classId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filter by class UUID",
        },
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
          description: "Page number",
        },
        {
          name: "perPage",
          in: "query",
          schema: { type: "integer", default: 20 },
          description: "Items per page",
        },
      ],
      responses: {
        "200": {
          description: "Paginated list of users",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/User" },
                  },
                  total: { type: "integer" },
                  page: { type: "integer" },
                  perPage: { type: "integer" },
                },
              },
            },
          },
        },
        "401": errorResponse(
          "Not authenticated",
          "Authorization header is required",
        ),
        "403": errorResponse(
          "Insufficient permissions",
          "Insufficient permissions",
        ),
      },
    },
  },
  "/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Get user by ID",
      description:
        "Returns a single active user by UUID. The password hash is never exposed.",
      security: [{ bearerAuth: [] }],
      parameters: [userIdParameter],
      responses: {
        "200": {
          description: "User found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
        "401": errorResponse(
          "Not authenticated",
          "Authorization header is required",
        ),
        "403": errorResponse(
          "Insufficient permissions",
          "Insufficient permissions",
        ),
        "404": errorResponse("Not found", "User not found"),
      },
    },
    put: {
      tags: ["Users"],
      summary: "Update user",
      description:
        "Updates one or more user fields. Staff passwords are re-hashed before persisting.",
      security: [{ bearerAuth: [] }],
      parameters: [userIdParameter],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                role: {
                  type: "string",
                  enum: [
                    "STUDENT",
                    "TEACHER",
                    "SCHOOL_MANAGER",
                    "MUNICIPAL_MANAGER",
                    "ADMIN",
                  ],
                },
                name: { type: "string" },
                email: { type: "string", format: "email", nullable: true },
                registrationNumber: { type: "string", nullable: true },
                birthDate: {
                  type: "string",
                  format: "date",
                  nullable: true,
                },
                password: { type: "string", nullable: true },
                schoolId: {
                  type: "string",
                  format: "uuid",
                  nullable: true,
                },
                municipalityId: {
                  type: "string",
                  format: "uuid",
                  nullable: true,
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "User updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
        "400": errorResponse(
          "Validation error",
          "At least one field (role, name, email, registrationNumber, birthDate, password, schoolId, or municipalityId) is required",
        ),
        "401": errorResponse(
          "Not authenticated",
          "Authorization header is required",
        ),
        "403": errorResponse(
          "Insufficient permissions",
          "Insufficient permissions",
        ),
        "404": errorResponse("Not found", "User not found"),
        "409": errorResponse(
          "Unique constraint violation",
          "User with this email already exists",
        ),
      },
    },
    delete: {
      tags: ["Users"],
      summary: "Delete user (soft delete)",
      description:
        "Soft-deletes a user by setting the `deletedAt` timestamp. The record remains in the database.",
      security: [{ bearerAuth: [] }],
      parameters: [userIdParameter],
      responses: {
        "200": {
          description: "User soft-deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "User deleted" },
                },
              },
            },
          },
        },
        "401": errorResponse(
          "Not authenticated",
          "Authorization header is required",
        ),
        "403": errorResponse(
          "Insufficient permissions",
          "Insufficient permissions",
        ),
        "404": errorResponse("Not found", "User not found"),
      },
    },
  },
};
