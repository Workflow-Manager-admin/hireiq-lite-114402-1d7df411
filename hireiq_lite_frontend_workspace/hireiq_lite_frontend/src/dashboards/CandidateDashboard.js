import React, { useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { UserContext } from "../App";
import JobsBrowse from "../components/JobsBrowse";
import ApplicationModal from "../components/ApplicationModal";

/**
 * CandidateDashboard: Show jobs, allow applying, show applications.
 */
export default function CandidateDashboard() {
  const { user } = useContext(UserContext);
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch candidate's applications
  useEffect(() => {
    async function fetchApplications() {
      let { data } = await supabase.from("applications").select("*, jobs(*)").eq("candidate_id", user.id).order("created_at", { ascending: false });
      setApplications((data || []));
    }
    if (user?.id) fetchApplications();
  }, [user]);

  function handleApply(job) {
    setSelectedJob(job);
    setShowModal(true);
  }
  function handleModalClose(didApply) {
    setShowModal(false);
    setSelectedJob(null);
    // Optionally, refresh applications
    if (didApply) {
      supabase
        .from("applications")
        .select("*, jobs(*)")
        .eq("candidate_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setApplications(data || []));
    }
  }

  return (
    <div>
      <h3>
        <span className="text-accent">Job Listings</span>
      </h3>
      <JobsBrowse showApply onApply={handleApply} appliedJobIds={applications.map((a) => a.job_id)} />
      <div className="my-4">
        <h4>Your Applications</h4>
        {applications.length === 0 ? (
          <div className="small">You haven't applied to any jobs yet.</div>
        ) : (
          <div className="row row-cols-1 g-3">
            {applications.map((app) => (
              <div className="col" key={app.id}>
                <div className="card p-3">
                  <div>
                    <b>{app.jobs?.title}</b>
                  </div>
                  <div>Date Applied: {new Date(app.created_at).toLocaleDateString()}</div>
                  <div>Status: {app.status || "Applied"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && <ApplicationModal job={selectedJob} onClose={handleModalClose} />}
    </div>
  );
}
