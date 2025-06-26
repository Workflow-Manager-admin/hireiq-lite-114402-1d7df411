import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { supabase } from "../supabaseClient";

/** PUBLIC_INTERFACE
 * Top navigation bar, shows login status, branding, and contextual nav.
 */
export default function Navbar() {
  const { session, profile, user, setProfile } = useContext(UserContext);
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    setProfile(null);
    navigate("/auth");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-primary mb-4" style={{ backgroundColor: "var(--color-primary)" }}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to={session && profile?.role ? "/dashboard" : "/"}>
          <span className="text-accent">HireIQ Lite</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
          aria-controls="navbarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarMenu">
          {session && profile?.role && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/jobs">
                  {profile.role === "recruiter" ? "Manage Jobs" : "Jobs"}
                </Link>
              </li>
            </ul>
          )}
          <div className="d-flex align-items-center ms-auto">
            {session && profile?.role && (
              <span className="me-3 text-dark small">
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} | {profile.email}
              </span>
            )}
            {session ? (
              <button className="btn btn-accent btn-sm" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <Link className="btn btn-accent btn-sm" to="/auth">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
