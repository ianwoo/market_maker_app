import { useEffect, useState } from "react";

type Props = {
  websocket: WebSocket;
};

const AlgoControl = (props: Props) => {
  const { websocket } = props;

  const [config, setConfig] = useState<any>({}); //type later

  const [configEdit, setConfigEdit] = useState<any>({});

  useEffect(() => {
    console.log("firing get config");
    websocket.send(
      JSON.stringify({
        action: "GET_CONFIG",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
      })
    );
  }, [websocket]);

  websocket.onmessage = (event) => {
    console.log(JSON.parse(event.data));
    const message = JSON.parse(event.data);
    message.action === "GET_CONFIG" && setConfig(JSON.parse(message.result));
    console.log("CONFIG:");
    console.log(config);
  };

  const editConfig = () => {
    websocket.send(
      JSON.stringify({
        action: "UPDATE_CONFIG",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        update_params: {
          vol_trade_per_hour: 0,
          min_trade: 0,
          max_trade: 0,
          random_walk_degree: "",
        },
      })
    );
  };

  return (
    <div className="algo-control">
      <div className="vol-algo">
        <h1>Volume</h1>
        <h2>ADV: $2.4m</h2>
        <div className="field">
          <b>USD Vol Trade Per Hour</b>
          <input value={config.vol_trade_per_hour} />
        </div>
        <div className="field">
          <b>Trade Slice Out Per Minute (Min)</b>
          <input value={config.min_trade} />
        </div>
        <div className="field">
          <b>Trade Slice Out Per Minute (Max)</b>
          <input value={config.max_trade} />
        </div>
        <div className="field">
          <b>Random Walk Degree</b>
          <select value={config.random_walk_degree}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
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
