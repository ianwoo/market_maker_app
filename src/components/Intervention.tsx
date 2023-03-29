const orderBookDummyData = [
  { price: 0.00838282, supply: 816.816 },
  { price: 0.00508547, supply: 745.953 },
  { price: 0.00223873, supply: 613.184 },
  { price: 0.0019977, supply: 567.743 },
  { price: 0.00180763, supply: 468.297 },
  { price: 0.00115504, supply: 372.553 },
  { price: 0.00105263, supply: 299.027 },
  { price: 0.00072402, supply: 267.585 },
  { price: 0.00071632, supply: 123.55 },
  { price: 0.00066819, supply: 100.55 },
  { price: 0.00011713, supply: 21.07 },
];

const orderBookDummySpotPrice = 0.00000875;

const Intervention = () => {
  return (
    <div className="intervention">
      <h1>Intervention</h1>
      <div className="flex">
        <div className="order-book">
          <span>(TBD: Dynamic Order Book + Cancel Individual Orders)</span>
          <button>Stop Volume Algo</button>
        </div>
        <div className="sweep-and-peg">
          <h2>Sweep and Peg</h2>
          <div className="tabs">
            <div className="tab selected">Buy</div>
            <div className="tab">Sell</div>
          </div>
          <div className="field">
            <b>Limit Price (Target)</b>
            <input />
          </div>
          <div className="field">
            <b>Amount</b>
            <div className="field col">
              <input />
              <select>
                <option>USD</option>
                <option>QTY</option>
              </select>
            </div>
          </div>
          <div className="field">
            <b>Aggressiveness / Timing</b>
            <select>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div className="field">
            <b>Peg Additional Orders</b>
            <input type="checkbox" />
          </div>
          <b>Price Range</b>
          <div className="field">
            <span>From</span>
            <input />
            <span>To</span>
            <input />
          </div>
          <div className="field">
            <b>Amount</b>
            <div className="field col">
              <input />
              <select>
                <option>USD</option>
                <option>QTY</option>
              </select>
            </div>
          </div>
          <div className="field">
            <b>Aggressiveness / Timing</b>
            <select>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intervention;
