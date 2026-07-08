import { Link } from "react-router-dom";
import Button from "../components/common/Button.jsx";

function NotFoundPage() {
  return (
    <main className="not-found">
      <h1>Page not found</h1>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </main>
  );
}

export default NotFoundPage;
