import { errorResponse } from "../shared";

const municipalityIdParameter = {
  name: "id",
  in: "path",
  required: true,
  description: "Municipality UUID",
  schema: { type: "string", format: "uuid" },
};

export const municipalitiesPaths = {
  "/municipalities": {
    post: {
      tags: ["Municipalities"],
      summary: "Create municipality",
      description: "Creates a new municipality. Requires ADMIN or MUNICIPAL_MANAGER role.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "state", "ibgeCode"],
              properties: {
                name: { type: "string", example: "São Paulo" },
                state: { type: "string", minLength: 2, maxLength: 2, example: "SP" },
                ibgeCode: { type: "string", example: "3550308" },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Municipality created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Municipality" },
            },
          },
        },
        "400": errorResponse("Validation error", "name, state, and ibgeCode are required"),
        "401": errorResponse("Not authenticated", "Authorization header is required"),
        "403": errorResponse("Insufficient permissions", "Insufficient permissions"),
        "409": errorResponse("Duplicate IBGE code", "Municipality with this IBGE code already exists"),
      },
    },
    get: {
      tags: ["Municipalities"],
      summary: "List municipalities",
      description: "Returns a paginated list of municipalities. Supports filtering by state and search by name.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "state", in: "query", schema: { type: "string" }, description: "Filter by state (2-char code)", example: "SP" },
        { name: "search", in: "query", schema: { type: "string" }, description: "Search by municipality name (case-insensitive)" },
        { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
        { name: "perPage", in: "query", schema: { type: "integer", default: 20 }, description: "Items per page" },
      ],
      responses: {
        "200": {
          description: "Paginated list of municipalities",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/Municipality" } },
                  total: { type: "integer" },
                  page: { type: "integer" },
                  perPage: { type: "integer" },
                },
              },
            },
          },
        },
        "401": errorResponse("Not authenticated", "Authorization header is required"),
        "403": errorResponse("Insufficient permissions", "Insufficient permissions"),
      },
    },
  },

  "/municipalities/{id}": {
    get: {
      tags: ["Municipalities"],
      summary: "Get municipality by ID",
      description: "Returns a single municipality by its UUID. Soft-deleted municipalities are excluded.",
      security: [{ bearerAuth: [] }],
      parameters: [municipalityIdParameter],
      responses: {
        "200": {
          description: "Municipality found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Municipality" },
            },
          },
        },
        "401": errorResponse("Not authenticated", "Authorization header is required"),
        "403": errorResponse("Insufficient permissions", "Insufficient permissions"),
        "404": errorResponse("Not found", "Municipality not found"),
      },
    },
    put: {
      tags: ["Municipalities"],
      summary: "Update municipality",
      description: "Updates one or more fields of a municipality. At least one field is required.",
      security: [{ bearerAuth: [] }],
      parameters: [municipalityIdParameter],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "São Paulo" },
                state: { type: "string", minLength: 2, maxLength: 2, example: "SP" },
                ibgeCode: { type: "string", example: "3550308" },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Municipality updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Municipality" },
            },
          },
        },
        "400": errorResponse("Validation error", "At least one field (name, state, or ibgeCode) is required"),
        "401": errorResponse("Not authenticated", "Authorization header is required"),
        "403": errorResponse("Insufficient permissions", "Insufficient permissions"),
        "404": errorResponse("Not found", "Municipality not found"),
        "409": errorResponse("Duplicate IBGE code", "Municipality with this IBGE code already exists"),
      },
    },
    delete: {
      tags: ["Municipalities"],
      summary: "Delete municipality (soft delete)",
      description: "Soft-deletes a municipality by setting the `deletedAt` timestamp. The record is not removed from the database.",
      security: [{ bearerAuth: [] }],
      parameters: [municipalityIdParameter],
      responses: {
        "200": {
          description: "Municipality soft-deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Municipality deleted" },
                },
              },
            },
          },
        },
        "401": errorResponse("Not authenticated", "Authorization header is required"),
        "403": errorResponse("Insufficient permissions", "Insufficient permissions"),
        "404": errorResponse("Not found", "Municipality not found"),
      },
    },
  },
};
