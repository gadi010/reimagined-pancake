import swaggerJsdoc from "swagger-jsdoc";


const baseUrl = process.env.API_URL || "http://localhost:3000/api/v1";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My API Documentation",
            version: "1.0.0",
            description: "API documentation for my backend service",
        },
        servers: [
            {
                url: baseUrl,
                description:
                    process.env.NODE_ENV === "production"
                        ? "Production Server"
                        : "Development Server",
            },
        ],
    },
    apis: ["./src/routes/*.route.js", "./src/app.js"]
};

export const swaggerSpec = swaggerJsdoc(options);

