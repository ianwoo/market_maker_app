const AlgoControl = () => {
  return (
    <div className="algo-control">
      <div className="vol-algo">
        <h1>Volume</h1>
        <h2>ADV: $2.4m</h2>
        <span>USD Vol Trade Per Hour</span>
        <input />
        <br />
        <span>Trade Slice Out Per Minute (Min)</span>
        <input />
        <br />
        <span>Trade Slice Out Per Minute (Max)</span>
        <input />
        <br />
        <span>Random Walk Degree</span>
        <select>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <div className="order-book-depth">
        <h1>Order Book Depth</h1>
        <span>Price Range From Spot</span>
        <br />
        <span>Bid</span>
        <input />
        <span>Offer</span>
        <input />
        <span>Random Walk (Bid)</span>
        <select>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <span>Random Walk (Offer)</span>
        <select>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <br />
        <span>Depth in USD</span>
        <br />
        <span>Bid</span>
        <input />
        <span>Offer</span>
        <input />
        <span>Random Walk (Bid)</span>
        <select>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <span>Random Walk (Offer)</span>
        <select>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <br />
        <span>Bid/Offer Cap Target</span>
        <br />
        <span>Bid</span>
        <input />
        <span>Offer</span>
        <input />
        <span>Random Walk (Bid)</span>
        <select>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <span>Random Walk (Offer)</span>
        <select>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <br />
        <span>Spread</span>
        <br />
        <span>Bid</span>
        <input />
        <span>Offer</span>
        <input />
        <span>Random Walk (Bid)</span>
        <select>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <span>Random Walk (Offer)</span>
        <select>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <br />
        <span>Density</span>
        <br />
        <span>Bid</span>
        <input />
        <span>Offer</span>
        <input />
        <span>Random Walk (Bid)</span>
        <select>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <span>Random Walk (Offer)</span>
        <select>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <br />
      </div>
    </div>
  );
};

export default AlgoControl;
