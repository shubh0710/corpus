import express from "express";

// The server application. This file only builds it and says which doors it has;
// it does not open it. index.js opens it for real (on port 3000), and
// health-check.mjs opens it on a spare port for the check.
// `export const` is a named export, so other files bring it in with { app }.
export const app = express();

// The health door. When something asks for GET /api/health, this function
// answers. req (the request) is what came in; res (the response) is what we
// send back. res.json turns the object into JSON text and sends it with
// status 200 ("OK"). A server that can answer this is up and running.
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});