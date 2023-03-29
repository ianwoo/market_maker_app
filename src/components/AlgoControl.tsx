const AlgoControl = () => {
  return (
    <div className="algo-control">
      <div className="vol-algo">
        <h1>Volume</h1>
        <h2>ADV: $2.4m</h2>
        <div className="field">
          <b>USD Vol Trade Per Hour</b>
          <input />
        </div>
        <div className="field">
          <b>Trade Slice Out Per Minute (Min)</b>
          <input />
        </div>
        <div className="field">
          <b>Trade Slice Out Per Minute (Max)</b>
          <input />
        </div>
        <div className="field">
          <b>Random Walk Degree</b>
          <select>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </div>
      <div className="order-book-depth">
        <h1>Order Book Depth</h1>
        <b>Price Range From Spot</b>
        <div className="field-group">
          <div className="field col">
            <span>Bid</span>
            <input />
          </div>
          <div className="field col">
            <span>Random Walk (Bid)</span>
            <select>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="field col">
            <span>Offer</span>
            <input />
          </div>
          <div className="field col">
            <span>Random Walk (Offer)</span>
            <select>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
        <b>Depth in USD</b>
        <div className="field-group">
          <div className="field col">
            <span>Bid</span>
            <input />
          </div>
          <div className="field col">
            <span>Random Walk (Bid)</span>
            <select>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="field col">
            <span>Offer</span>
            <input />
          </div>
          <div className="field col">
            <span>Random Walk (Offer)</span>
            <select>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
        <b>Bid/Offer Cap Target</b>
        <div className="field-group">
          <div className="field col">
            <span>Bid</span>
            <input />
          </div>
          <div className="field col">
            <span>Random Walk (Bid)</span>
            <select>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="field col">
            <span>Offer</span>
            <input />
          </div>
          <div className="field col">
            <span>Random Walk (Offer)</span>
            <select>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
        <b>Spread</b>
        <div className="field-group">
          <div className="field col">
            <span>Bid</span>
            <input />
          </div>
          <div className="field col">
            <span>Random Walk (Bid)</span>
            <select>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="field col">
            <span>Offer</span>
            <input />
          </div>
          <div className="field col">
            <span>Random Walk (Offer)</span>
            <select>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
        <b>Density</b>
        <div className="field-group">
          <div className="field col">
            <span>Bid</span>
            <input />
          </div>
          <div className="field col">
            <span>Random Walk (Bid)</span>
            <select>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="field col">
            <span>Offer</span>
            <input />
          </div>
          <div className="field col">
            <span>Random Walk (Offer)</span>
            <select>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgoControl;
