import React, { useEffect, useState, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./theme.css";
import { supabase } from "./supabaseClient";
import Navbar from "./components/Navbar";
import Auth from "./components/Auth";
import RecruiterDashboard from "./dashboards/RecruiterDashboard";
import CandidateDashboard from "./dashboards/CandidateDashboard";
import JobsBrowse from "./components/JobsBrowse";

// PUBLIC_INTERFACE
export const UserContext = React.createContext();

/**
 * Main application component supporting authentication, role context, routing, and theming.
 */
function App() {
  // Holds {session, user, role}
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // { role, ... }
  const [loading, setLoading] = useState(true);

  // Bootstrap theme switch is optional; only light theme is enforced here
  useEffect(() => {
    document.body.style.backgroundColor = "var(--color-bg)";
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    let { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Fetch user profile when session changes (assign role)
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
      } else {
        // Fetch from 'users' table; if doesn't exist, fill with metadata email and ask to complete profile
        let { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (data) {
          setProfile(data);
        } else if (error && error.code === "PGRST116") {
          // Row not found: create skeleton
          const newUser = {
            id: session.user.id,
            email: session.user.email,
            role: null,
          };
          await supabase.from("users").insert([newUser]);
          setProfile(newUser);
        } else if (data === null) {
          setProfile({ id: session.user.id, email: session.user.email, role: null });
        }
        setLoading(false);
      }
    }
    if (session?.user) {
      setLoading(true);
      fetchProfile();
    }
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user,
      profile,
      setProfile,
    }),
    [session, profile]
  );

  if (loading) {
    // Simple loading spinner
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-accent" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <UserContext.Provider value={value}>
        <Navbar />
        <div className="container py-4">
          <Routes>
            {!session ? (
              <>
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </>
            ) : !profile?.role ? (
              // New user must set profile/role first
              <>
                <Route path="/profile" element={<Auth showRoleSelect initialEmail={profile?.email} />} />
                <Route path="*" element={<Navigate to="/profile" replace />} />
              </>
            ) : profile.role === "recruiter" ? (
              <>
                <Route path="/dashboard" element={<RecruiterDashboard />} />
                <Route path="/jobs" element={<RecruiterDashboard />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            ) : (
              // Candidate
              <>
                <Route path="/dashboard" element={<CandidateDashboard />} />
                <Route path="/jobs" element={<JobsBrowse />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            )}
          </Routes>
        </div>
      </UserContext.Provider>
    </Router>
  );
}

export default App;
