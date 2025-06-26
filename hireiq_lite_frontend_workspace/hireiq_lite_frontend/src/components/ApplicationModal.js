import React, { useContext, useState } from "react";
import { supabase } from "../supabaseClient";
import { UserContext } from "../App";

/**
 * ApplicationModal - modal dialog for filling out job application.
 * Used by candidates.
 */
export default function ApplicationModal({ job, onClose }) {
  const { user, profile } = useContext(UserContext);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submitApplication(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);
    // Insert to Supabase applications: job_id, candidate_id, cover_letter, status (pending)
    let { error } = await supabase.from("applications").insert([
      {
        job_id: job.id,
        candidate_id: user.id,
        cover_letter: coverLetter,
        status: "pending",
        applied_email: profile.email,
      },
    ]);
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose(true);
      }, 1000);
    }
  }

  return (
    <div className="modal show fade" tabIndex="-1" style={{ display: "block", background: "rgba(0,0,0,0.3)" }}>
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={submitApplication}>
          <div className="modal-header">
            <h5 className="modal-title">Apply for {job.title}</h5>
            <button type="button" className="btn-close" onClick={() => onClose(false)}></button>
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Cover Letter</label>
              <textarea
                className="form-control"
                required
                rows={4}
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                disabled={submitting}
              />
            </div>
            {error && <div className="alert alert-danger py-1 my-2">{error}</div>}
            {success && <div className="alert alert-success py-1 my-2">Application sent!</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onClose(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={submitting || !coverLetter}>
              {submitting ? "Applying..." : "Apply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
