const Intervention = () => {
  return (
    <div className="intervention">
      <h1>Intervention</h1>
      <br />
      <span>(TBD: Dynamic Order Book + Cancel Individual Orders)</span>
      <br />
      <button>Stop Volume Algo</button>
      <br />
      <h2>Sweep and Peg</h2>
      <div className="tabs">
        <div className="tab selected">Buy</div>
        <div className="tab">Sell</div>
      </div>
      <span>Limit Price (Target)</span>
      <input />
      <br />
      <span>Amount</span>
      <input />
      <select>
        <option>USD</option>
        <option>QTY</option>
      </select>
      <br />
      <span>Aggressiveness / Timing</span>
      <select>
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
      <br />
      <span>Peg Additional Orders</span>
      <input type="checkbox" />
      <br />
      <span>Price Range</span>
      <br />
      <span>From</span>
      <input />
      <span>To</span>
      <input />
      <br />
      <span>Amount</span>
      <input />
      <select>
        <option>USD</option>
        <option>QTY</option>
      </select>
      <br />
      <span>Aggressiveness / Timing</span>
      <select>
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
    </div>
  );
};

export default Intervention;
