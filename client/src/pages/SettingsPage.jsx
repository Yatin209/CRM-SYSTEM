import { KeyRound, Palette, Save } from "lucide-react";
import Button from "../components/common/Button.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import ThemeToggle from "../components/common/ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function SettingsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="page-stack">
      <PageHeader title="Settings" eyebrow="Workspace controls" actions={<Button icon={Save}>Save Changes</Button>} />

      <section className="settings-grid">
        <article className="surface settings-panel">
          <div className="section-title">
            <h2>Profile</h2>
            <KeyRound size={18} />
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Name</span>
              <input value={user.name} readOnly />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input value={user.email} readOnly />
            </label>
            <label className="form-field">
              <span>Role</span>
              <input value={user.role} readOnly />
            </label>
            <label className="form-field">
              <span>Region</span>
              <input value={user.region} readOnly />
            </label>
          </div>
        </article>

        <article className="surface settings-panel">
          <div className="section-title">
            <h2>Appearance</h2>
            <Palette size={18} />
          </div>
          <div className="settings-row">
            <div>
              <strong>{theme === "dark" ? "Dark" : "Light"} theme</strong>
              <span>Dashboard preference</span>
            </div>
            <ThemeToggle />
          </div>
        </article>
      </section>
    </div>
  );
}

export default SettingsPage;
