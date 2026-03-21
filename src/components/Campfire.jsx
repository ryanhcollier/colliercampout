import './Campfire.css';

export default function Campfire() {
  return (
    <div className="campfire-wrapper">
      <div className="flame"></div>
      <div className="flame inner"></div>
      <div className="flame spark"></div>
      <div className="flame spark delay"></div>
      <div className="logs">
        <div className="log"></div>
        <div className="log"></div>
      </div>
    </div>
  );
}
