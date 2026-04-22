import { errorResponse } from "../shared";

const classIdParameter = {
  name: "id",
  in: "path",
  required: true,
  description: "Class UUID",
  schema: { type: "string", format: "uuid" },
};

export const classesPaths = {
  "/classes": {
    post: {
      tags: ["Classes"],
      summary: "Create class",
      description:
        "Creates a new class linked to a school. Requires ADMIN, MUNICIPAL_MANAGER, or SCHOOL_MANAGER role.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["schoolId", "name", "grade", "year"],
              properties: {
                schoolId: {
                  type: "string",
                  format: "uuid",
                  description: "UUID of the school this class belongs to",
                },
                name: { type: "string", example: "5º Ano A" },
                grade: {
                  type: "integer",
                  minimum: 1,
                  maximum: 9,
                  example: 5,
                },
                year: { type: "integer", example: 2026 },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Class created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Class" },
            },
          },
        },
        "400": errorResponse(
          "Validation error",
          "schoolId, name, grade, and year are required",
        ),
        "401": errorResponse(
          "Not authenticated",
          "Authorization header is required",
        ),
        "403": errorResponse(
          "Insufficient permissions",
          "Insufficient permissions",
        ),
        "404": errorResponse("School not found", "School not found"),
      },
    },
    get: {
      tags: ["Classes"],
      summary: "List classes",
      description:
        "Returns a paginated list of classes. Supports filtering by school, year, and grade.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "schoolId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filter by school UUID",
        },
        {
          name: "year",
          in: "query",
          schema: { type: "integer" },
          description: "Filter by year",
          example: 2026,
        },
        {
          name: "grade",
          in: "query",
          schema: { type: "integer", minimum: 1, maximum: 9 },
          description: "Filter by grade (1-9)",
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
          description: "Paginated list of classes",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Class" },
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

  "/classes/{id}": {
    get: {
      tags: ["Classes"],
      summary: "Get class by ID",
      description:
        "Returns a single class by its UUID. Soft-deleted classes are excluded.",
      security: [{ bearerAuth: [] }],
      parameters: [classIdParameter],
      responses: {
        "200": {
          description: "Class found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Class" },
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
        "404": errorResponse("Not found", "Class not found"),
      },
    },
    put: {
      tags: ["Classes"],
      summary: "Update class",
      description:
        "Updates one or more fields of a class. At least one field is required.",
      security: [{ bearerAuth: [] }],
      parameters: [classIdParameter],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "5º Ano B" },
                grade: {
                  type: "integer",
                  minimum: 1,
                  maximum: 9,
                  example: 5,
                },
                year: { type: "integer", example: 2026 },
                schoolId: {
                  type: "string",
                  format: "uuid",
                  description: "UUID of the new school",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Class updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Class" },
            },
          },
        },
        "400": errorResponse(
          "Validation error",
          "At least one field (name, grade, year, or schoolId) is required",
        ),
        "401": errorResponse(
          "Not authenticated",
          "Authorization header is required",
        ),
        "403": errorResponse(
          "Insufficient permissions",
          "Insufficient permissions",
        ),
        "404": errorResponse("Not found", "Class not found"),
      },
    },
    delete: {
      tags: ["Classes"],
      summary: "Delete class (soft delete)",
      description:
        "Soft-deletes a class by setting the `deletedAt` timestamp. The record is not removed from the database.",
      security: [{ bearerAuth: [] }],
      parameters: [classIdParameter],
      responses: {
        "200": {
          description: "Class soft-deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Class deleted" },
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
        "404": errorResponse("Not found", "Class not found"),
      },
    },
  },
};
