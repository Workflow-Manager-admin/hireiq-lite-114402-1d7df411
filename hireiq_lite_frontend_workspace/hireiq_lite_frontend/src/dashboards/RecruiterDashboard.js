import React, { useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { UserContext } from "../App";

/** PUBLIC_INTERFACE
 * RecruiterDashboard for managing jobs. Allows job creation and CRUD.
 */
export default function RecruiterDashboard() {
  const { user } = useContext(UserContext);
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalJob, setModalJob] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch all jobs for this recruiter
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      let { data, error } = await supabase.from("jobs").select("*").eq("created_by", user.id).order("created_at", { ascending: false });
      if (error) setError(error.message);
      setJobs(data || []);
      setLoading(false);
    }
    if (user?.id) fetchJobs();
  }, [user]);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    let { title, description } = modalJob;
    if (!title || !description) {
      setError("Please provide job title and description.");
      setSubmitting(false);
      return;
    }
    let { data, error } = await supabase.from("jobs").insert([{ title, description, created_by: user.id }]);
    if (error) setError(error.message);
    else setJobs(js => [{ ...data[0], applications: [] }, ...js]);
    setShowModal(false);
    setSubmitting(false);
    setModalJob({ title: "", description: "" });
  }

  function openNewJobModal() {
    setModalJob({ title: "", description: "" });
    setShowModal(true);
    setError("");
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 className="mb-0">
          <span className="text-accent">Your Job Postings</span>
        </h3>
        <button className="btn btn-accent" onClick={openNewJobModal}>
          + New Job
        </button>
      </div>
      {/* Jobs Table */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-accent" role="status"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="alert alert-info">No job postings yet. Click 'New Job' to create one.</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {jobs.map(job => (
            <div key={job.id} className="col">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white d-flex justify-content-between">
                  <h5 className="mb-0">{job.title}</h5>
                  {/* Optionally add more controls (edit/delete in future) */}
                </div>
                <div className="card-body">{job.description}</div>
                <div className="card-footer small text-muted">
                  <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* New Job Modal */}
      {showModal && (
        <div className="modal show fade" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleCreate}>
              <div className="modal-header">
                <h5 className="modal-title">Post New Job</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Job Title</label>
                  <input type="text" className="form-control" required value={modalJob.title} onChange={e => setModalJob(mj => ({ ...mj, title: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" required value={modalJob.description} onChange={e => setModalJob(mj => ({ ...mj, description: e.target.value }))} rows={4}></textarea>
                </div>
                {error && <div className="alert alert-danger py-1 my-2">{error}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent" disabled={submitting}>
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
