import './PlaceholderPage.css';

export default function PlaceholderPage({ icon: Icon, title, body }) {
  return (
    <div className="container">
      <div className="placeholder-page card card-pad">
        {Icon && (
          <span className="placeholder-icon">
            <Icon size={22} strokeWidth={2.25} />
          </span>
        )}
        <h2>{title}</h2>
        <p className="text-soft">{body}</p>
      </div>
    </div>
  );
}
