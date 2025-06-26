/**
 * Auth.js - Authentication page for login/sign up and optional profile setup.
 * Uses Supabase Auth for direct user management.
 */
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import { supabase } from "../supabaseClient";

/** PUBLIC_INTERFACE
 * Auth component with login/sign-up and role selection.
 * @param {boolean} showRoleSelect - if true, show role selection form (for new user profile)
 * @param {string} initialEmail - if provided, fill email field on role selection
 */
function Auth({ showRoleSelect = false, initialEmail = "" }) {
  const { setProfile } = useContext(UserContext);
  const [mode, setMode] = useState("login"); // or signup
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Clean error on input
  useEffect(() => {
    setError("");
  }, [email, password, mode, role, showRoleSelect]);

  async function handleAuth(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      // signup
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
    }
    setSubmitting(false);
  }

  async function handleRoleSet(e) {
    e.preventDefault();
    if (!role) {
      setError("Please select your role.");
      return;
    }
    setSubmitting(true);
    // Update users table entry with role
    let { data, error } = await supabase
      .from("users")
      .update({ role })
      .eq("email", email)
      .select("*")
      .single();
    if (error) {
      setError(error.message);
    } else if (data) {
      setProfile(data);
    }
    setSubmitting(false);
  }

  // If role select is needed (i.e. onboarding new profile)
  if (showRoleSelect) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <form className="card p-4 shadow-sm" style={{ minWidth: 320, maxWidth: 400 }} onSubmit={handleRoleSet}>
          <h5 className="mb-3">Set up your profile</h5>
          <div className="mb-3">
            <label className="form-label">Your Email</label>
            <input type="email" className="form-control" value={email} disabled readOnly />
          </div>
          <div className="mb-3">
            <label className="form-label">Select Role</label>
            <select className="form-select" required value={role} onChange={e => setRole(e.target.value)}>
              <option value="">-- select --</option>
              <option value="recruiter">Recruiter</option>
              <option value="candidate">Candidate</option>
            </select>
          </div>
          {error && <div className="alert alert-danger py-1 my-2">{error}</div>}
          <button className="btn btn-accent w-100" disabled={submitting || !role}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    );
  }

  // Show login/signup forms
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
      <form className="card p-4 shadow-sm" style={{ minWidth: 320, maxWidth: 400 }} onSubmit={handleAuth}>
        <h5 className="mb-3">{mode === "login" ? "Sign In" : "Sign Up"}</h5>
        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <input
            autoFocus
            type="email"
            className="form-control"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={submitting}
          />
        </div>
        {error && <div className="alert alert-danger py-1 my-2">{error}</div>}
        <button className="btn btn-accent w-100" disabled={submitting}>
          {submitting ? (mode === "login" ? "Signing in..." : "Signing up...") : mode === "login" ? "Sign In" : "Sign Up"}
        </button>
        <div className="mt-3 text-center">
          <small>
            {mode === "login"
              ? <>Don't have an account?{" "}
                  <button type="button" className="btn btn-link btn-sm px-0" onClick={() => setMode("signup")}>Sign Up</button>
                </>
              : <>Already have an account?{" "}
                  <button type="button" className="btn btn-link btn-sm px-0" onClick={() => setMode("login")}>Sign In</button>
                </>
            }
          </small>
        </div>
      </form>
    </div>
  );
}

export default Auth;
