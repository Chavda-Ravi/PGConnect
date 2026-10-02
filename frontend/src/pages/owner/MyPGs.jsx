import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPGs } from "../../services/pgService";
import "../../index.css";

function MyPGs() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getMyPGs();
        const list = Array.isArray(data)
          ? data
          : data.pgListings || data.pgs || data.data || data.results || [];
        setPgs(list);
      } catch (err) {
        if (!err.response) {
          setError(
            "Backend is not responding. Please restart the server and try again.",
          );
        } else {
          setError(
            err.response.data?.message || "Could not load your PG listings.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="owner-page">
      <div className="owner-inner">
        <header className="owner-header owner-header-row">
          <div>
            <p className="owner-kicker">Owner</p>
            <h1>My PGs</h1>
            <p>Manage the PG listings you have published.</p>
          </div>

          <Link className="owner-primary-cta" to="/owner/pgs/add">
            + Add PG
          </Link>
        </header>

        {error && <div className="auth-alert error">{error}</div>}

        {loading ? (
          <div className="owner-loading">Loading your PGs…</div>
        ) : pgs.length === 0 ? (
          <div className="owner-empty">
            <p>You haven&apos;t published any PG yet.</p>
            <Link className="owner-primary-cta" to="/owner/pgs/add">
              Add your first PG
            </Link>
          </div>
        ) : (
          <div className="search-grid">
            {pgs.map((pg) => (
              <article className="pg-card" key={pg._id}>
                <div
                  className="preview-card-image"
                  style={{ borderRadius: 12 }}
                >
                  {pg.images && pg.images[0] ? (
                    <img
                      src={pg.images[0]}
                      alt={pg.pgName}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display =
                            "flex";
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="preview-card-placeholder"
                    style={{
                      display:
                        pg.images && pg.images[0]
                          ? "none"
                          : "flex",
                      minHeight: "150px",
                    }}
                  >
                    No photo
                  </div>
                </div>

                <div className="pg-card-body">
                  <h3>{pg.pgName}</h3>
                  <p className="pg-card-location">
                    {pg.city}
                    {pg.state ? `, ${pg.state}` : ""}
                  </p>
                  {pg.description && (
                    <p className="pg-card-desc">{pg.description}</p>
                  )}
                  {pg.contactNo && (
                    <p className="pg-card-contact">Contact: {pg.contactNo}</p>
                  )}
                </div>

                <div className="pg-card-actions">
                  <Link
                      className="pg-card-link"
                      to={`/owner/pgs/edit/${pg._id}`}
                  >
                      Edit
                  </Link>

                  <Link
                      className="pg-card-link"
                      to={`/owner/availability?pgId=${pg._id}`}
                  >
                      Availability
                  </Link>
              </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyPGs;
