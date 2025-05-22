import { Link } from "react-router-dom";

function UserNavbar() {
  return (
    <header className="navbar">
      <section className="navbar-section">
        <Link to="/dashboard" className="btn btn-link">
          Logo
        </Link>
      </section>
      <section className="features">
        <Link to='/MLmodel' className="btn btn-link">
          MLmodel
        </Link>
      </section>
      <section className="features2">
        <Link to='/Chatbot' className="btn btn-link">
          Chatbot
        </Link>
      </section>
    </header>
  );
}

export default UserNavbar;
