export default function CabCard({ cab }) {
  return (
    <div className="bg-white p-4 rounded shadow flex justify-between">
      <div>
        <h2 className="font-semibold">{cab.cabType}</h2>
        <p>{cab.vehicleName}</p>
        <p>₹{cab.pricePerKm}/km • {cab.capacity} seats</p>
      </div>
      <button className="bg-black text-white px-4 py-2 rounded">
        Book
      </button>
    </div>
  );
}
