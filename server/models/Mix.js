import mongoose from "mongoose";

// The rulebook for one fund's line in a mix: which fund (its scheme code) and its share.
// { _id: false }: a line inside a mix doesn't need its own ID, the mix has one.
const shareSchema = new mongoose.Schema(
    {
        schemeCode: { type: Number, required: true },
        share: { type: Number, required: true }
    },
    { _id: false }
);

// The rulebook for a saved mix. MongoDB itself accepts any shape; the schema is
// what makes every saved mix look the same.
//   name   - text, must be there, spaces at the ends are trimmed away
//   shares - a list of lines, each following shareSchema above. A list of pairs
//            rather than { 118778: 25 } like the page uses, because MongoDB field
//            names are always text, so a number as a key would quietly become text.
// { timestamps: true } adds createdAt and updatedAt to every mix, for free.
const mixSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        shares: [shareSchema],
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

// The model: the tool for saving and finding mixes. Mongoose names the
// collection (the cabinet drawer) after it, in lower case and plural: "mixes".
export const Mix = mongoose.model("Mix", mixSchema);