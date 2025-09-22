import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

export const syncUser = async (req, res) => {
  try {
    const clerkId = req.auth.userId; // requireAuth() ensures this exists
    if (!clerkId) return res.status(401).json({ message: "Not authenticated" });

    // Get user info from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkId);

    // Check if user exists in MongoDB
    let dbUser = await User.findOne({ clerkId });
    if (!dbUser) {
      dbUser = await User.create({
        clerkId,
        username:
          clerkUser.username ??
          clerkUser.emailAddresses[0].emailAddress.split("@")[0],
        email: clerkUser.emailAddresses[0].emailAddress,
      });
    }

    res.json(dbUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
