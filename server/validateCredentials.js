// The guard's checklist for sign-up: { email, password }.
// Returns null when everything is fine, otherwise ONE message: the first rule that's broken,
// checked in order (email first), the same way validateMix works.
export function validateCredentials(body) {
    const { email, password } = body;

    // 1. The email is text, and once the spaces at the ends are trimmed away it looks like
    //    "something@something.something". This is a sanity check, not proof the address exists.
    if (typeof email !== "string") {
        return "Enter a valid email address.";
    }
    const trimmed = email.trim();
    // indexOf gives the position of the first "@" (counting from 0), or -1 if there is none.
    // lastIndexOf gives the position of the last "." (or -1).
    const at = trimmed.indexOf("@");
    // at < 1 catches two things: no @ at all (-1), and an @ in the very first spot (0),
    // which means nothing before it.
    // The last dot sitting before the @ (or missing) means there's no dot after the @.
    // A dot after the @ also means there IS something after the @, so this covers both.
    if (at < 1 || trimmed.lastIndexOf(".") < at) {
        return "Enter a valid email address.";
    }

    // 2. The password is text, at least 8 characters. Not trimmed: spaces are characters
    //    the person chose, and they must type the same ones to log in.
    if (typeof password !== "string" || password.length < 8) {
        return "Password must be at least 8 characters.";
    }

    // Every rule passed
    return null;
}