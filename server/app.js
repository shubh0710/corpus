import express from "express";
import { mixesRouter } from "./routes/mixes.js";
import { authRouter } from "./routes/auth.js";

// The server application. This file only builds it and says which doors it has;
// it does not open it. index.js opens it for real (on port 3000), and the check
// files open it on a spare port.
// `export const` is a named export, so other files bring it in with { app }.
export const app = express();

// Unpack JSON packages first. A request's body arrives as text; express.json turns it
// into an object at req.body, for every door below this line. It only does that when
// the request says its package is JSON (the "Content-Type: application/json" header).
app.use(express.json());

// The health door. When something asks for GET /api/health, this function
// answers. req (the request) is what came in; res (the response) is what we
// send back. res.json turns the object into JSON text and sends it with
// status 200 ("OK"). A server that can answer this is up and running.
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// The saved-mix doors, all under one sign: /api/mixes (see routes/mixes.js)
app.use("/api/mixes", mixesRouter);

// The sign-up and log-in doors, under /api/auth (see routes/auth.js)
app.use("/api/auth", authRouter);