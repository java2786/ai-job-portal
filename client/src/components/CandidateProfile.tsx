import { useEffect, useState } from "react";  
import { Candidate } from "../types";
import {server_api} from "../data/api";
interface CandidateProfileProps{
  token: string;
}
function CandidateProfile({token}: CandidateProfileProps) {  
  const [profile, setProfile] = useState<Candidate|null>(null);  
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
    useEffect(() => {
      const loadProfile = async () => {
        try {
          setLoading(true);
          setError("");
          const response = await fetch(`${server_api}/api/candidate/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error("Unable to load your profile.");
          }

          const data: Candidate = await response.json();
          setProfile(data);
          setResumeText(data.resumeText || "");
        } catch (fetchError) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load your profile.");
        } finally {
          setLoading(false);
        }
      };

      loadProfile();
    }, [token]);

    const handleResumeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSaving(true);
      setSaveMessage("");

      try {
        const response = await fetch(`${server_api}/api/candidate/me/resume`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ resumeText })
        });

        if (!response.ok) {
          throw new Error("Unable to save your resume.");
        }

        setProfile((currentProfile) => currentProfile ? { ...currentProfile, resumeText } : currentProfile);
        setSaveMessage("Resume saved successfully.");
      } catch (saveError) {
        setSaveMessage(saveError instanceof Error ? saveError.message : "Unable to save your resume.");
      } finally {
        setIsSaving(false);
      }
    };

    if (loading) return (<p className="profile-status">Loading Profile....</p>);
    if (error) return (<p className="profile-status profile-error">{error}</p>);
    if (!profile) return (<p className="profile-status profile-error">Unable to load your profile.</p>);

  return (  
    <div className="candidate-profile">  
      <h2>{profile.name.toUpperCase()}</h2>  
      <p>{profile.email.toUpperCase()}</p>  
      <section className="resume-section" aria-labelledby="resume-heading">
        <div className="resume-heading">
          <div>
            <h4 id="resume-heading">Resume</h4>
            <p className="resume-help">Keep your experience and skills up to date for job matching.</p>
          </div>
          <button type="submit" form="resume-form" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Resume"}
          </button>
        </div>
        <form id="resume-form" className="resume-form" onSubmit={handleResumeSubmit}>
          <label htmlFor="resume-text">Resume details</label>
          <textarea
            id="resume-text"
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            placeholder="Add your experience, education, and skills..."
            rows={10}
          />
        </form>
        {saveMessage && <p className={`resume-message ${saveMessage.includes("successfully") ? "resume-success" : "profile-error"}`} role="status">{saveMessage}</p>}
      </section>
      <h4>Applications</h4>  
      {profile.applications.length==0 && 
        <p>You have not applied to any job yet.</p>
      } 
<ul>
      {
        profile.applications.map(
          (app, index)=> {return (
            <li key={index}>
              JobId: {app.jobId} - Status: {app.status} - MatchScore: {app.matchScore??"Not yet evaluated"} - AI Feedback: <span>{app.aiFeedback??""}</span>
            </li>
            )
          }
        )
      } 
      </ul>

      
    </div>  
  );  
}  
  
export default CandidateProfile;  