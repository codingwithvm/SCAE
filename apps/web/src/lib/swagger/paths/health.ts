export const healthPaths = {
  "/health": {
    get: {
      tags: ["Health"],
      summary: "Check service health",
      description: "Returns API and database connection status with version info and connection stats.",
      responses: {
        "200": {
          description: "Service is healthy and database is connected",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "healthy" },
                  version: { type: "string", example: "0.1.0" },
                  timestamp: { type: "string", format: "date-time" },
                  services: {
                    type: "object",
                    properties: {
                      database: {
                        type: "object",
                        properties: {
                          status: { type: "string", example: "connected" },
                          version: { type: "string", example: "16.3" },
                          max_connections: { type: "integer", example: 100 },
                          opened_connections: { type: "integer", example: 3 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "503": {
          description: "Service is unhealthy — database unreachable",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "unhealthy" },
                  version: { type: "string", example: "0.1.0" },
                  timestamp: { type: "string", format: "date-time" },
                  services: {
                    type: "object",
                    properties: {
                      database: {
                        type: "object",
                        properties: {
                          status: { type: "string", example: "disconnected" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
