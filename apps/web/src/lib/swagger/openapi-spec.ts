import { healthPaths } from "./paths/health";
import { authPaths } from "./paths/auth";
import { municipalitiesPaths } from "./paths/municipalities";
import { schoolsPaths } from "./paths/schools";

export const openapiSpec = {
  openapi: "3.1.0",
  info: {
    title: "SCAE API",
    version: "1.0.0",
    description:
      "Sistema de Controle e Acompanhamento Escolar — API documentation",
  },
  servers: [{ url: "/api/v1", description: "API v1" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token obtained from one of the login endpoints",
      },
    },
    schemas: {
      AuthenticationTokenResponse: {
        type: "object",
        properties: {
          token: { type: "string", description: "JWT authentication token" },
          user: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              role: {
                type: "string",
                enum: [
                  "STUDENT",
                  "TEACHER",
                  "COORDINATOR",
                  "MUNICIPAL_MANAGER",
                  "ADMIN",
                ],
              },
            },
          },
        },
      },
      Municipality: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "São Paulo" },
          state: { type: "string", minLength: 2, maxLength: 2, example: "SP" },
          ibgeCode: { type: "string", example: "3550308" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          deletedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      School: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          municipalityId: { type: "string", format: "uuid" },
          name: { type: "string", example: "Escola Municipal São Paulo" },
          inepCode: { type: "string", example: "35000001" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          deletedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
    },
  },
  tags: [
    { name: "Health", description: "Service health check" },
    {
      name: "Authentication",
      description: "Login endpoints for students and staff",
    },
    {
      name: "Municipalities",
      description: "Municipality CRUD (ADMIN, MUNICIPAL_MANAGER)",
    },
    {
      name: "Schools",
      description: "School CRUD (ADMIN, MUNICIPAL_MANAGER, SCHOOL_MANAGER)",
    },
  ],
  paths: {
    ...healthPaths,
    ...authPaths,
    ...municipalitiesPaths,
    ...schoolsPaths,
  },
};
