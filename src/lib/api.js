// The one helper every page-side request to our server goes through (authApi.js now,
// mixesApi.js next). It lives in its own file because more than one file needs it.

// What it does: knock, read the JSON answer, and throw if the answer isn't OK.
// response.ok is true for statuses 200-299. For 400, 401 or 409 the server's answer is
// { error: "a friendly message" }, so throwing new Error(answer.error) lets a component
// simply show error.message.
// Two steps can fail before there's any answer to read: fetch itself (no connection), or
// json() (the answer isn't JSON; with the server stopped, Vite's proxy sends an empty
// body). Either way the person can't do anything with the technical message, so the
// try / catch swaps it for one they can act on. let declares the two names before the
// try, so they still exist after it.
// One answer is empty on purpose: 204 "No Content" (deleting a mix: done, nothing to
// send back). Its empty body would make json() throw, and the catch would wrongly say
// the server couldn't be reached. So a 204 stops before reading, and gives back null
// (nothing).
export async function ask(url, options) {
    let response;
    let answer;
    try {
        response = await fetch(url, options);
        if (response.status === 204) {
            return null;
        }
        answer = await response.json();
    } catch {
        throw new Error("Couldn't reach the server. Please try again.");
    }
    if (!response.ok) {
        throw new Error(answer.error);
    }
    return answer;
}