import { useEffect, useState } from "react";
import { OrderBookUpdate } from "../App";

type Props = {
  websocket: WebSocket;
  spotPrice: number;
  orderBook: OrderBookUpdate;
};

const AlgoControl = (props: Props) => {
  const { websocket, spotPrice, orderBook } = props;

  const [config, setConfig] = useState<any>({}); //type later
  const [configEdit, setConfigEdit] = useState<any>({});

  const [upperPrice, setUpperPrice] = useState<number>(0);
  const [lowerPrice, setLowerPrice] = useState<number>(0);

  useEffect(() => {
    setUpperPrice([...orderBook.ask].sort((a, b) => a[0] - b[0])[0][0]);
    setLowerPrice([...orderBook.bid].sort((a, b) => b[0] - a[0])[0][0]);
  }, [orderBook]);

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

  const totalAskPriceInUSD = spotPrice * (1 + config.total_ask_price_range);
  const totalBidPriceInUSD = spotPrice * (1 - config.total_bid_price_range);
  const bestAskPriceInUSD = spotPrice * (1 + config.best_ask_price_range);
  const bestBidPriceInUSD = spotPrice * (1 - config.best_bid_price_range);

  return (
    <div className="algo-control">
      <div className="vol-algo">
        <button
          disabled={
            config.vol_trade_per_hour === configEdit.vol_trade_per_hour &&
            config.min_trade === configEdit.min_trade &&
            config.max_trade === configEdit.max_trade &&
            config.random_walk_degree === configEdit.random_walk_degree &&
            config.best_bid_price_range === configEdit.best_bid_price_range &&
            config.best_bid_random_walk === configEdit.best_bid_random_walk &&
            config.best_ask_price_range === configEdit.best_ask_price_range &&
            config.best_ask_random_walk === configEdit.best_ask_random_walk &&
            config.best_bid_order_depth === configEdit.best_bid_order_depth &&
            config.best_ask_order_depth === configEdit.best_ask_order_depth &&
            config.total_bid_price_range === configEdit.total_bid_price_range &&
            config.total_ask_order_depth === configEdit.total_ask_order_depth &&
            config.spread === configEdit.spread
          }
          onClick={editConfig}
        >
          EDIT CONFIG
        </button>
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
      </div>
      <div className="order-book-depth">
        <h1>Order Book Depth</h1>
        <div className="field-group">
          <div className="field col">
            <span>Total Range in $:</span>
            <span>{totalAskPriceInUSD - totalBidPriceInUSD}</span>
          </div>
        </div>
        <div className="field-group">
          <div className="field col">
            <span>Best Range in $:</span>
            <span>{bestAskPriceInUSD - bestBidPriceInUSD}</span>
          </div>
        </div>
        <div className="field-group">
          <div className={"field col" + (config.spread !== configEdit.spread ? " highlighted" : "")}>
            <span>
              Price Gap Allowance / Spread: <br />
              <b>{config.spread}</b>
            </span>
            <input type="number" onChange={(e) => setConfigEdit({ ...configEdit, spread: e.target.value })} />
          </div>
        </div>
        <div className="field-group">
          <div
            className={
              "field col" + (config.total_ask_price_range !== configEdit.total_ask_price_range ? " highlighted" : "")
            }
          >
            <span>
              Upper Total Range
              <br />/ Total Ask: <br />
              <b>
                {config.total_ask_price_range} / {config.total_ask_price_range * 100}%
              </b>
            </span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, total_ask_price_range: Number(e.target.value) })}
            />
          </div>
          <div className="field col">
            <span>
              Upper Total Range Price <br />
              / Total Ask Price: <br />
            </span>
            <b>{totalAskPriceInUSD}$</b>
          </div>
          <div className="field col">
            <span>Upper Total Range Quantity</span>
            <b>
              {orderBook.ask.filter((ask, i) => ask[0] <= totalAskPriceInUSD).reduce((acc, next) => acc + next[1], 0)}
            </b>
          </div>
          <div
            className={
              "field col" + (config.total_ask_order_depth !== configEdit.total_ask_order_depth ? " highlighted" : "")
            }
          >
            <span>
              Total Ask Order Depth: <br />
              <b>{config.total_ask_order_depth}</b>
            </span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, total_ask_order_depth: e.target.value })}
            />
          </div>
          <div
            className={
              "field col" + (config.total_ask_random_walk !== configEdit.total_ask_random_walk ? " highlighted" : "")
            }
          >
            <span>
              Random Walk (Total Ask): <br />
              <b>{config.total_ask_random_walk}</b>
            </span>
            <select onChange={(e) => setConfigEdit({ ...configEdit, total_ask_random_walk: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="field-group">
          <div
            className={
              "field col" + (config.best_ask_price_range !== configEdit.best_ask_price_range ? " highlighted" : "")
            }
          >
            <span>
              Upper Best Range /<br />
              Best Ask: <br />
              <b>
                {config.best_ask_price_range} / {config.best_ask_price_range * 100}%
              </b>
            </span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, best_ask_price_range: Number(e.target.value) })}
            />
          </div>
          <div className="field col">
            <span>
              Upper Best Range Price / <br />
              Best Ask Price:
              <br />
            </span>
            <b>{bestAskPriceInUSD}$</b>
          </div>
          <div className="field col">
            <span>Upper Best Range Quantity</span>
            <b>
              {orderBook.ask.filter((ask, i) => ask[0] <= bestAskPriceInUSD).reduce((acc, next) => acc + next[1], 0)}
            </b>
          </div>
          <div
            className={
              "field col" + (config.best_ask_order_depth !== configEdit.best_ask_order_depth ? " highlighted" : "")
            }
          >
            <span>
              Best Ask Order Depth: <br />
              <b>{config.best_ask_order_depth}</b>
            </span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, best_ask_order_depth: Number(e.target.value) })}
            />
          </div>
          <div
            className={
              "field col" + (config.best_ask_random_walk !== configEdit.best_ask_random_walk ? " highlighted" : "")
            }
          >
            <span>
              Random Walk (Best Ask): <br />
              <b>{config.best_ask_random_walk}</b>
            </span>
            <select onChange={(e) => setConfigEdit({ ...configEdit, best_ask_random_walk: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="field-group">
          <div className="field col">
            <span>Upper Price</span>
            <b>{upperPrice}$</b>
          </div>
        </div>
        <div className="field-group">
          <div className="field col">
            <span>Spot Price</span>
            <b>{spotPrice}$</b>
          </div>
        </div>
        <div className="field-group">
          <div className="field col">
            <span>Lower Price</span>
            <b>{lowerPrice}$</b>
          </div>
        </div>
        <div className="field-group">
          <div
            className={
              "field col" + (config.best_bid_price_range !== configEdit.best_bid_price_range ? " highlighted" : "")
            }
          >
            <span>
              Lower Best Range /<br />
              Best Bid: <br />
              <b>
                {config.best_bid_price_range} / {config.best_bid_price_range * 100}%
              </b>
            </span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, best_bid_price_range: Number(e.target.value) })}
            />
          </div>
          <div className="field col">
            <span>
              Lower Best Range Price /<br /> Best Bid Price
            </span>
            <b>{bestBidPriceInUSD}$</b>
          </div>
          <div className="field col">
            <span>Lower Best Range Quantity</span>
            <b>
              {orderBook.bid.filter((bid, i) => bid[0] >= bestBidPriceInUSD).reduce((acc, next) => acc + next[1], 0)}
            </b>
          </div>
          <div
            className={
              "field col" + (config.best_bid_order_depth !== configEdit.best_bid_order_depth ? " highlighted" : "")
            }
          >
            <span>
              Best Bid Order Depth: <br />
              <b>{config.best_bid_order_depth}</b>
            </span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, best_bid_order_depth: Number(e.target.value) })}
            />
          </div>
          <div
            className={
              "field col" + (config.best_bid_random_walk !== configEdit.best_bid_random_walk ? " highlighted" : "")
            }
          >
            <span>
              Random Walk (Best Bid): <br />
              <b>{config.best_bid_random_walk}</b>
            </span>
            <select onChange={(e) => setConfigEdit({ ...configEdit, best_bid_random_walk: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="field-group">
          <div
            className={
              "field col" + (config.total_bid_price_range !== configEdit.total_bid_price_range ? " highlighted" : "")
            }
          >
            <span>
              Lower Total Range
              <br />
              Total Bid: <br />
              <b>
                {config.total_bid_price_range} / {config.total_bid_price_range * 100}%
              </b>
            </span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, total_bid_price_range: Number(e.target.value) })}
            />
          </div>
          <div className="field col">
            <span>
              Lower Total Range Price /<br />
              Total Bid Price:
            </span>
            <b>{totalBidPriceInUSD}$</b>
          </div>
          <div className="field col">
            <span>Lower Total Range Quantity</span>
            <b>
              {orderBook.bid.filter((bid, i) => bid[0] >= totalBidPriceInUSD).reduce((acc, next) => acc + next[1], 0)}
            </b>
          </div>
          <div
            className={
              "field col" + (config.total_bid_order_depth !== configEdit.total_bid_order_depth ? " highlighted" : "")
            }
          >
            <span>
              Total Bid Order Depth: <br />
              <b>{config.total_bid_order_depth}</b>
            </span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, total_bid_order_depth: Number(e.target.value) })}
            />
          </div>
          <div
            className={
              "field col" + (config.total_bid_random_walk !== configEdit.total_bid_random_walk ? " highlighted" : "")
            }
          >
            <span>
              Random Walk (Total Bid): <br />
              <b>{config.total_bid_random_walk}</b>
            </span>
            <select onChange={(e) => setConfigEdit({ ...configEdit, total_bid_random_walk: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
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
