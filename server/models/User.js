import mongoose from "mongoose";

// The blueprint for one person's account, saved in the "users" drawer.
const userSchema = new mongoose.Schema(
    {
        // unique: no two accounts can have the same email. This is an index in MongoDB (a
        // lookup list the database keeps), not a Mongoose rule, so validate() won't catch a
        // duplicate: the database refuses it at save time. The sign-up door will check first
        // and answer with a friendly message.
        // lowercase and trim tidy the email before it's saved: "  Shubh@Example.com " is
        // stored as "shubh@example.com", so the same person can't sign up twice by
        // changing capitals.
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },

        // Never the password itself: a scrambled version of it (hashing comes in a later step)
        passwordHash: { type: String, required: true }
    },
    // Adds createdAt and updatedAt, filled in automatically
    { timestamps: true }
);

// "User" becomes the "users" drawer in the database
export const User = mongoose.model("User", userSchema);