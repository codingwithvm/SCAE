import { errorResponse } from "../shared";

const schoolIdParameter = {
  name: "id",
  in: "path",
  required: true,
  description: "School UUID",
  schema: { type: "string", format: "uuid" },
};

export const schoolsPaths = {
  "/schools": {
    post: {
      tags: ["Schools"],
      summary: "Create school",
      description:
        "Creates a new school linked to a municipality. Requires ADMIN, MUNICIPAL_MANAGER, or SCHOOL_MANAGER role.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["municipalityId", "name", "inepCode"],
              properties: {
                municipalityId: {
                  type: "string",
                  format: "uuid",
                  description:
                    "UUID of the municipality this school belongs to",
                },
                name: { type: "string", example: "Escola Municipal São Paulo" },
                inepCode: { type: "string", example: "35000001" },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "School created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/School" },
            },
          },
        },
        "400": errorResponse(
          "Validation error",
          "municipalityId, name, and inepCode are required",
        ),
        "401": errorResponse(
          "Not authenticated",
          "Authorization header is required",
        ),
        "403": errorResponse(
          "Insufficient permissions",
          "Insufficient permissions",
        ),
        "404": errorResponse(
          "Municipality not found",
          "Municipality not found",
        ),
        "409": errorResponse(
          "Duplicate INEP code",
          "School with this INEP code already exists",
        ),
      },
    },
    get: {
      tags: ["Schools"],
      summary: "List schools",
      description:
        "Returns a paginated list of schools. Supports filtering by municipality and search by name.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "municipalityId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filter by municipality UUID",
        },
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Search by school name (case-insensitive)",
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
          description: "Paginated list of schools",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/School" },
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

  "/schools/{id}": {
    get: {
      tags: ["Schools"],
      summary: "Get school by ID",
      description:
        "Returns a single school by its UUID. Soft-deleted schools are excluded.",
      security: [{ bearerAuth: [] }],
      parameters: [schoolIdParameter],
      responses: {
        "200": {
          description: "School found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/School" },
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
        "404": errorResponse("Not found", "School not found"),
      },
    },
    put: {
      tags: ["Schools"],
      summary: "Update school",
      description:
        "Updates one or more fields of a school. At least one field is required.",
      security: [{ bearerAuth: [] }],
      parameters: [schoolIdParameter],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "Escola Renomeada" },
                inepCode: { type: "string", example: "35000099" },
                municipalityId: {
                  type: "string",
                  format: "uuid",
                  description: "UUID of the new municipality",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "School updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/School" },
            },
          },
        },
        "400": errorResponse(
          "Validation error",
          "At least one field (name, inepCode, or municipalityId) is required",
        ),
        "401": errorResponse(
          "Not authenticated",
          "Authorization header is required",
        ),
        "403": errorResponse(
          "Insufficient permissions",
          "Insufficient permissions",
        ),
        "404": errorResponse("Not found", "School not found"),
        "409": errorResponse(
          "Duplicate INEP code",
          "School with this INEP code already exists",
        ),
      },
    },
    delete: {
      tags: ["Schools"],
      summary: "Delete school (soft delete)",
      description:
        "Soft-deletes a school by setting the `deletedAt` timestamp. The record is not removed from the database.",
      security: [{ bearerAuth: [] }],
      parameters: [schoolIdParameter],
      responses: {
        "200": {
          description: "School soft-deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "School deleted" },
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
        "404": errorResponse("Not found", "School not found"),
      },
    },
  },
};
