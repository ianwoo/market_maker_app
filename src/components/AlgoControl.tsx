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
              onChange={(e) => setConfigEdit({ ...configEdit, vol_trade_per_hour: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className={"field" + (config.min_trade !== configEdit.min_trade ? " highlighted" : "")}>
          <b>Trade Slice Out Per Minute (Min)</b>
          <div className="field col">
            <b>{config.min_trade}</b>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, min_trade: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className={"field" + (config.max_trade !== configEdit.max_trade ? " highlighted" : "")}>
          <b>Trade Slice Out Per Minute (Max)</b>
          <div className="field col">
            <b>{config.max_trade}</b>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, max_trade: Number(e.target.value) })}
            />
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
        <b>Best</b>
        <div className="field-group">
          <div className="field col">
            <span>Best Bid: {config.best_bid_price_range}</span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, best_bid_price_range: Number(e.target.value) })}
            />
          </div>
          <div className="field col">
            <span>Random Walk (Best Bid): {config.best_bid_random_walk}</span>
            <select onChange={(e) => setConfigEdit({ ...configEdit, best_bid_random_walk: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="field col">
            <span>Best Ask: {config.best_ask_price_range}</span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, best_ask_price_range: Number(e.target.value) })}
            />
          </div>
          <div className="field col">
            <span>Random Walk (Best Ask): {config.best_ask_random_walk}</span>
            <select onChange={(e) => setConfigEdit({ ...configEdit, best_ask_random_walk: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="field-group">
          <div className="field col">
            <span>Best Bid Order Depth: {config.best_bid_order_depth}</span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, best_bid_order_depth: Number(e.target.value) })}
            />
          </div>
          {/* spacer below */}
          <div />
          <div className="field col">
            <span>Best Ask Order Depth: {config.best_ask_order_depth}</span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, best_ask_order_depth: Number(e.target.value) })}
            />
          </div>
          {/* spacer below */}
          <div />
        </div>
        <b>Total</b>
        <div className="field-group">
          <div className="field col">
            <span>Total Bid: {config.total_bid_price_range}</span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, total_bid_price_range: Number(e.target.value) })}
            />
          </div>
          <div className="field col">
            <span>Random Walk (Total Bid): {config.total_bid_random_walk}</span>
            <select onChange={(e) => setConfigEdit({ ...configEdit, total_bid_random_walk: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="field col">
            <span>Total Ask: {config.total_ask_price_range}</span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, total_ask_price_range: Number(e.target.value) })}
            />
          </div>
          <div className="field col">
            <span>Random Walk (Total Ask): {config.total_ask_random_walk}</span>
            <select onChange={(e) => setConfigEdit({ ...configEdit, total_ask_random_walk: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="field-group">
          <div className="field col">
            <span>Total Bid Order Depth: {config.total_bid_order_depth}</span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, total_bid_order_depth: Number(e.target.value) })}
            />
          </div>
          {/* spacer below */}
          <div />
          <div className="field col">
            <span>Total Ask Order Depth: {config.total_ask_order_depth}</span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, total_ask_order_depth: e.target.value })}
            />
          </div>
          {/* spacer below */}
          <div />
        </div>
        <b>Spread</b>
        <div className="field-group">
          <div className="field col">
            <span>Spread: {config.spread}</span>
            <input type="number" onChange={(e) => setConfigEdit({ ...configEdit, spread: e.target.value })} />
          </div>
        </div>
        {/* <b>Density</b>
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
        </div> */}
      </div>
    </div>
  );
};

export default AlgoControl;
