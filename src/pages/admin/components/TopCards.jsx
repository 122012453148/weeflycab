export default function TopCards({ data }) {
  return (
    <div className="cards">
      <div className="card orange">
        <h3>{data.totalUsers}</h3>
        <p>Total Users</p>
      </div>

      <div className="card blue">
        <h3>{data.totalDrivers}</h3>
        <p>Total Drivers</p>
      </div>

      <div className="card green">
        <h3>{data.totalRides}</h3>
        <p>Total Rides</p>
      </div>

      <div className="card gold">
        <h3>₹ {data.totalRevenue}</h3>
        <p>Total Revenue</p>
      </div>
    </div>
  );
}
