export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      <span className="loader-text">{text}</span>
    </div>
  );
}
