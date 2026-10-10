import "./Header.css";

// Sticky top bar. Its right end has the account spot, which depends on what App knows:
//   user            - null for nobody, or { id, email }
//   checkingSession - true while App is still asking the server about a saved wristband
//   onLogInClick    - what the "Log in" button calls
//   onLogOut        - what the "Log out" button calls
export default function Header({ user, checkingSession, onLogInClick, onLogOut }) {
    // What goes in the account spot. While still checking: nothing (null draws nothing),
    // so "Log in" never flashes up at someone who is actually logged in.
    // Logged in: the email as plain text (it isn't something to click), then "Log out".
    // Logged out: "Log in".
    let account = null;
    if (!checkingSession) {
        account = (
            <div className="account">
                {user ? (
                    <>
                        <span className="account-email">{user.email}</span>
                        <button type="button" className="btn-ghost" onClick={onLogOut}>Log out</button>
                    </>
                ) : (
                    <button type="button" className="btn-ghost" onClick={onLogInClick}>Log in</button>
                )}
            </div>
        );
    }

    return (
        <header>
            {/* <header> stays full width so its background and bottom border reach
                the screen edges. .header-inner caps the content width so the
                wordmark lines up with the cards below on a wide monitor. */}
            <div className="header-inner">
                {/* The span holds just the "." so it can be coloured brass in CSS */}
                <h1 className="wordmark">corpus<span>.</span></h1>

                <div className="header-right">
                    <nav>
                        <a href="#how-it-works">How it works</a>
                        <a href="#glossary">Glossary</a>
                    </nav>
                    <button type="button" className="btn-ghost">Save this mix</button>
                </div>

                {/* The account spot is its own item here, not inside .header-right, so on
                    a phone it can move up next to the wordmark (Header.css, 480px) */}
                {account}
            </div>
        </header>
    );
}