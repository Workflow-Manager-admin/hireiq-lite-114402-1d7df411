import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import { UserContext } from "../App";

/**
 * JobsBrowse component - shows all jobs (for candidates), optionally allow apply button.
 * @param {boolean} showApply - if true, show apply buttons
 * @param {function} onApply - callback when apply clicked (job)=>{}
 * @param {array} appliedJobIds - jobs already applied to by candidate (disable button)
 */
function JobsBrowse({ showApply = false, onApply, appliedJobIds = [] }) {
  const { profile } = useContext(UserContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      let { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      setJobs(data || []);
      setLoading(false);
    }
    fetchJobs();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="py-4 text-center">
          <div className="spinner-border text-accent" role="status"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="alert alert-info">No jobs posted yet.</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {jobs.map((job) => (
            <div className="col" key={job.id}>
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">{job.title}</h5>
                </div>
                <div className="card-body">{job.description}</div>
                <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                  <span className="small text-muted">Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                  {showApply && profile?.role === "candidate" && (
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => onApply(job)}
                      disabled={appliedJobIds.includes(job.id)}
                    >
                      {appliedJobIds.includes(job.id) ? "Applied" : "Apply"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobsBrowse;
