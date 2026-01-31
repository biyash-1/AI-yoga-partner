import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { requireAuth, clerkMiddleware } from "@clerk/express";
import dotenv from "dotenv";
import {
  syncUser,
  checkOnboarding,
  saveOnboarding,
  getUserStats,
} from "./controllers/userController.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

dotenv.config();

mongoose
  .connect(process.env.MONGOURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use(clerkMiddleware());
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("API is running...");
});
app.post("/api/sync-user", requireAuth(), syncUser);
app.get("/api/check-onboarding", requireAuth(), checkOnboarding);
app.post("/api/save-onboarding",requireAuth(), saveOnboarding);
app.get("/api/user-stats", requireAuth(),getUserStats);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
