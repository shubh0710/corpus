import "./Footer.css";

// The bottom strip of the page: a disclaimer on the left, two links on the right.
// Fully static, so no props.
export default function Footer() {
    return (
        <footer>
            <p>For educational and informational purposes only. Not investment advice.</p>
            <nav>
                <a href="https://github.com/shubh0710">GitHub</a>
                <a href="https://in.linkedin.com/">LinkedIn</a>
            </nav>
        </footer>
    );
}