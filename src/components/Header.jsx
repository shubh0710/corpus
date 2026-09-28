import "./Header.css";

// Sticky top bar. All static content, so no props.
export default function Header() {
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
            </div>
        </header>
    );
}