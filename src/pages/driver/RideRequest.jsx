export default function RideRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-5 rounded shadow w-80">
        <h2 className="font-bold mb-2">New Ride Request</h2>
        <p>Pickup: Anna Nagar</p>
        <p>Drop: T Nagar</p>

        <div className="flex gap-2 mt-4">
          <button className="flex-1 bg-green-500 text-white py-2 rounded">
            Accept
          </button>
          <button className="flex-1 bg-red-500 text-white py-2 rounded">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
