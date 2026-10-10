import { useState, useEffect, useRef } from "react";
import { logIn, signUp } from "../lib/authApi";
import "./AuthDialog.css";

// The log-in / sign-up pop-up. It's a native <dialog>: the browser itself dims the page,
// keeps Tab inside the pop-up while it's open, and closes it on Esc.
//   isOpen     - whether App wants it open
//   onClose    - tells App it closed (for any reason: Esc, Close, or success)
//   onSignedIn - gets the server's answer, { token, user }, when logging in or signing up works
export default function AuthDialog({ isOpen, onClose, onSignedIn }) {
    // "login" or "signup": the same two boxes, a different door on the server
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // The server's message when it says no ("" means nothing to show)
    const [error, setError] = useState("");
    // True while waiting for the server, so the button can't be pressed twice
    const [busy, setBusy] = useState(false);

    // A ref is a sticky note pointing at the real <dialog> on the page. React draws the
    // dialog, but opening and closing it are things only the element itself can do
    // (showModal and close), so we need a handle on it.
    const dialogRef = useRef(null);

    // A second sticky note, on the email box, so we can put the cursor there
    const emailRef = useRef(null);

    // Whenever isOpen changes, make the real dialog match it. The .open checks stop us
    // opening an already-open dialog (which throws an error) or closing a closed one.
    // On opening, the browser focuses the first thing it can, which is the Close button,
    // so keyboard users would have to Tab past it every time. .focus() moves the cursor
    // straight to the email box instead. (React's autoFocus prop can't do this: it acts
    // when the page first draws, while the pop-up is still closed.)
    useEffect(() => {
        const dialog = dialogRef.current;
        if (isOpen && !dialog.open) {
            dialog.showModal();
            emailRef.current.focus();
        } else if (!isOpen && dialog.open) {
            dialog.close();
        }
    }, [isOpen]);

    const isLogin = mode === "login";

    // The dialog's close event fires however it closes: Esc (which the browser handles
    // on its own, without asking React), the Close button, or after a success. So this is
    // the one place that tidies up: forget the password, so it isn't still sitting in the
    // box on a shared computer, and the old message, so the pop-up doesn't reopen with
    // "Wrong email or password." before anything is typed. Then tell App, so isOpen goes
    // back to false. Without that, after Esc App would still think it's open, and "Log in"
    // would do nothing next time.
    function handleClose() {
        setPassword("");
        setError("");
        onClose();
    }

    // Flip between "Log in" and "Create account". The old message belonged to the other
    // mode, so it goes too.
    function handleSwitchMode() {
        setMode(isLogin ? "signup" : "login");
        setError("");
    }

    async function handleSubmit(event) {
        // Stop the browser sending the form off and reloading the page
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            // Same two boxes, different door. Either one gives back { token, user }, or
            // throws an Error carrying the server's message (see lib/authApi.js).
            const session = isLogin ? await logIn(email, password) : await signUp(email, password);
            onSignedIn(session);
            setEmail("");
            setPassword("");
            // Closing fires the close event, so handleClose tells App
            dialogRef.current.close();
        } catch (error) {
            setError(error.message);
        } finally {
            // Success or failure, the wait is over
            setBusy(false);
        }
    }

    let buttonText;
    if (busy) {
        buttonText = isLogin ? "Logging in…" : "Creating account…";
    } else {
        buttonText = isLogin ? "Log in" : "Create account";
    }

    return (
        // aria-labelledby gives the pop-up its name (the title), which a screen reader
        // reads out when it opens
        <dialog ref={dialogRef} className="auth-dialog" aria-labelledby="auth-title" onClose={handleClose}>
            <div className="auth-head">
                <h2 className="panel-title" id="auth-title">{isLogin ? "Log in" : "Create account"}</h2>
                <button type="button" className="btn-ghost" onClick={() => dialogRef.current.close()}>Close</button>
            </div>

            {/* noValidate: no browser bubbles; the messages come from one place, the server */}
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="field">
                    <label className="field-label" htmlFor="auth-email">Email</label>
                    {/* autoComplete="email" lets the browser offer saved addresses */}
                    <input type="email" id="auth-email" name="email" autoComplete="email" ref={emailRef}
                        value={email} onChange={event => setEmail(event.target.value)} />
                </div>

                <div className="field">
                    <label className="field-label" htmlFor="auth-password">Password</label>
                    {/* Tells password managers what this is: "current-password" means
                        "fill in the saved one", "new-password" means "offer to save this".
                        When signing up, aria-describedby links the hint below to the box,
                        so a screen reader reads it out with the box. */}
                    <input type="password" id="auth-password" name="password"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        aria-describedby={isLogin ? undefined : "auth-password-hint"}
                        value={password} onChange={event => setPassword(event.target.value)} />
                    {!isLogin && <p className="auth-hint" id="auth-password-hint">At least 8 characters.</p>}
                </div>

                {/* The server's message. role="alert" makes screen readers announce it
                    as soon as it appears. */}
                {error && <p className="field-error" role="alert">{error}</p>}

                <button type="submit" className="btn-primary" disabled={busy}>{buttonText}</button>
            </form>

            <p className="auth-switch">
                {isLogin ? "No account yet? " : "Already have an account? "}
                <button type="button" className="auth-switch-btn" onClick={handleSwitchMode}>
                    {isLogin ? "Create one" : "Log in"}
                </button>
            </p>
        </dialog>
    );
}