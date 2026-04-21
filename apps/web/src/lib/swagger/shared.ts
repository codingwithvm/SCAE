export const errorResponse = (description: string, example: string) => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          error: { type: "string", example },
        },
      },
    },
  },
});
