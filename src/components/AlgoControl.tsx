import { useEffect, useState } from "react";

type Props = {
  websocket: WebSocket;
};

const AlgoControl = (props: Props) => {
  const { websocket } = props;

  const [config, setConfig] = useState<any>({}); //type later

  const [configEdit, setConfigEdit] = useState<any>({});

  useEffect(() => {
    websocket.send(
      JSON.stringify({
        action: "GET_CONFIG",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
      })
    );
  }, [websocket]);

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    message.action === "GET_CONFIG" && setConfig(JSON.parse(message.result));
    message.action === "GET_CONFIG" && setConfigEdit(JSON.parse(message.result));
  };

  const editConfig = () => {
    websocket.send(
      JSON.stringify({
        action: "UPDATE_CONFIG",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        update_params: configEdit,
      })
    );
  };

  return (
    <div className="algo-control">
      <div className="vol-algo">
        <h1>Volume</h1>
        <h2>ADV: $2.4m</h2>
        <div className={"field" + (config.vol_trade_per_hour !== configEdit.vol_trade_per_hour ? " highlighted" : "")}>
          <b>USD Vol Trade Per Hour</b>
          <div className="field col">
            <b>{config.vol_trade_per_hour}</b>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, vol_trade_per_hour: e.target.value })}
            />
          </div>
        </div>
        <div className={"field" + (config.min_trade !== configEdit.min_trade ? " highlighted" : "")}>
          <b>Trade Slice Out Per Minute (Min)</b>
          <div className="field col">
            <b>{config.min_trade}</b>
            <input type="number" onChange={(e) => setConfigEdit({ ...configEdit, min_trade: e.target.value })} />
          </div>
        </div>
        <div className={"field" + (config.max_trade !== configEdit.max_trade ? " highlighted" : "")}>
          <b>Trade Slice Out Per Minute (Max)</b>
          <div className="field col">
            <b>{config.max_trade}</b>
            <input type="number" onChange={(e) => setConfigEdit({ ...configEdit, max_trade: e.target.value })} />
          </div>
        </div>
        <div className={"field" + (config.random_walk_degree !== configEdit.random_walk_degree ? " highlighted" : "")}>
          <b>Random Walk Degree</b>
          <div className="field col">
            <b>{config.random_walk_degree}</b>
            <select
              onChange={(e) => {
                setConfigEdit({ ...configEdit, random_walk_degree: e.target.value });
              }}
              defaultValue={config.random_walk_degree}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <button
          disabled={
            config.vol_trade_per_hour === configEdit.vol_trade_per_hour &&
            config.min_trade === configEdit.min_trade &&
            config.max_trade === configEdit.max_trade &&
            config.random_walk_degree === configEdit.random_walk_degree
          }
          onClick={editConfig}
        >
          EDIT CONFIG
        </button>
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
