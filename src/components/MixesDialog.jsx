import { useState, useEffect, useRef } from "react";
import { saveMix, listMixes, deleteMix } from "../lib/mixesApi";
import { sharesToList, listToShares } from "../lib/mixShares";
import { formatDisplayDate } from "../lib/formatDisplayDate";
import "./MixesDialog.css";

// The "Your mixes" pop-up: save the current shares under a name, and see, load or delete
// your saved mixes. App only puts it on the page while it's open ({mixesOpen && ...}), so
// every time it opens, React builds a brand-new one, like a fresh paper slip: its state
// starts clean (loading, empty name, no messages) with no reset code.
//   token   - the wristband, for the server
//   shares  - the page's current shares, { 118778: 25, ... }: what "Save current mix" saves
//   onLoad  - gets a saved mix's shares, in the page's shape, when "Load" is clicked
//   onClose - tells App it closed (Esc, Close, or after Load), so App takes it off the page
export default function MixesDialog({ token, shares, onLoad, onClose }) {
    // The save form
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    // The list: "loading", then "ready" or "error"
    const [status, setStatus] = useState("loading");
    const [mixes, setMixes] = useState([]);
    const [listError, setListError] = useState("");

    // Which mix is being deleted right now (its _id), or null for none
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState("");

    // Sticky notes on the real <dialog> and on the Name box
    const dialogRef = useRef(null);
    const nameRef = useRef(null);

    // Effect A: once, when it appears, open it as a pop-up and put the cursor in the Name
    // box. In development React runs this twice on purpose (StrictMode), and opening an
    // already-open dialog throws an error, so the .open check skips the second time.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog.open) {
            dialog.showModal();
            nameRef.current.focus();
        }
    }, []);

    // Effect B: fetch the saved mixes, fresh every time the pop-up opens. The ignore flag
    // throws away the answer of a cancelled run (StrictMode's extra one, or the pop-up
    // closing before the answer arrives).
    useEffect(() => {
        let ignore = false;

        async function loadMixes() {
            try {
                const list = await listMixes(token);
                if (ignore) return;
                setMixes(list);
                setStatus("ready");
            } catch (error) {
                if (ignore) return;
                setListError(error.message);
                setStatus("error");
            }
        }
        loadMixes();

        return () => {
            ignore = true;
        };
    }, [token]);

    // "Save current mix". The server checks the name and the shares (one source of truth)
    // and answers with its own message if something's wrong. On success, the saved mix
    // goes to the top of the list. current => [saved, ...current] builds a NEW list from
    // the latest one: the saved mix first, then everything that was already there.
    async function handleSave(event) {
        event.preventDefault();
        setSaving(true);
        setSaveError("");
        try {
            const saved = await saveMix(token, name, sharesToList(shares));
            setMixes(current => [saved, ...current]);
            setName("");
        } catch (error) {
            setSaveError(error.message);
        } finally {
            setSaving(false);
        }
    }

    // "Load": hand the mix's shares to App in the page's shape, then close. Closing fires
    // the close event, so onClose tells App, which takes the pop-up off the page.
    function handleLoad(mix) {
        onLoad(listToShares(mix.shares));
        dialogRef.current.close();
    }

    // "Delete": no refetch. .filter builds a new list with every mix except this one.
    // current => works from the latest list, so a save that finished meanwhile isn't lost.
    async function handleDelete(id) {
        setDeletingId(id);
        setDeleteError("");
        try {
            await deleteMix(token, id);
            setMixes(current => current.filter(mix => mix._id !== id));
        } catch (error) {
            setDeleteError(error.message);
        } finally {
            setDeletingId(null);
        }
    }

    // The list area has four moods: loading, error, empty, or the list itself
    let listContent;
    if (status === "loading") {
        listContent = <p className="note">Loading your mixes…</p>;
    } else if (status === "error") {
        listContent = <p className="field-error" role="alert">{listError}</p>;
    } else if (mixes.length === 0) {
        listContent = <p className="note">No saved mixes yet.</p>;
    } else {
        listContent = (
            <ul className="mix-list">
                {mixes.map(mix => (
                    <li className="mix-row" key={mix._id}>
                        <div className="mix-info">
                            <p className="mix-name">{mix.name}</p>
                            {/* createdAt looks like "2026-10-11T14:05:12.345Z"; the first 10
                                characters are the date, which formatDisplayDate makes "11 Oct 2026" */}
                            <p className="mix-date">{formatDisplayDate(mix.createdAt.slice(0, 10))}</p>
                        </div>
                        {/* aria-label names the mix, so a screen reader says "Load My mix",
                            not "Load, Load, Load" down the list */}
                        <button type="button" className="btn-ghost" aria-label={`Load ${mix.name}`}
                            disabled={deletingId === mix._id} onClick={() => handleLoad(mix)}>Load</button>
                        <button type="button" className="btn-ghost" aria-label={`Delete ${mix.name}`}
                            disabled={deletingId === mix._id} onClick={() => handleDelete(mix._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <dialog ref={dialogRef} className="dialog" aria-labelledby="mixes-title" onClose={onClose}>
            <div className="dialog-head">
                <h2 className="panel-title" id="mixes-title">Your mixes</h2>
                <button type="button" className="btn-ghost" onClick={() => dialogRef.current.close()}>Close</button>
            </div>

            {/* noValidate: no browser bubbles; the messages come from the server */}
            <form className="mixes-form" onSubmit={handleSave} noValidate>
                <div className="field">
                    <label className="field-label" htmlFor="mix-name">Name</label>
                    {/* autoComplete="off": a mix name isn't something the browser should suggest */}
                    <input type="text" id="mix-name" name="name" autoComplete="off" ref={nameRef}
                        value={name} onChange={event => setName(event.target.value)} />
                    {saveError && <p className="field-error" role="alert">{saveError}</p>}
                </div>
                <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? "Saving…" : "Save current mix"}
                </button>
            </form>

            <section className="mixes-saved">
                <h3 className="eyebrow">Saved mixes</h3>
                {deleteError && <p className="field-error" role="alert">{deleteError}</p>}
                {listContent}
            </section>
        </dialog>
    );
}