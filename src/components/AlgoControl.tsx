import { useEffect, useState } from "react";
import { OrderBookUpdate } from "../App";

type Props = {
  websocket: WebSocket;
  spotPrice: number;
  orderBook: OrderBookUpdate;
};

const AlgoControl = (props: Props) => {
  const { websocket, spotPrice, orderBook } = props;

  const [configsLoaded, setConfigsLoaded] = useState<boolean>(false);
  const [config, setConfig] = useState<any>({}); //type later
  const [configEdit, setConfigEdit] = useState<any>({}); //type later
  const [compare, setCompare] = useState<any>({}); //type later

  const [totalAskPriceInUSD, setTotalAskPriceInUSD] = useState<number>();
  const [totalBidPriceInUSD, setTotalBidPriceInUSD] = useState<number>();
  const [bestAskPriceInUSD, setBestAskPriceInUSD] = useState<number>();
  const [bestBidPriceInUSD, setBestBidPriceInUSD] = useState<number>();
  const [spreadUpperPrice, setSpreadUpperPrice] = useState<number>();
  const [spreadLowerPrice, setSpreadLowerPrice] = useState<number>();

  useEffect(() => {
    //set initial variable and react to spot price change / actual config changes
    if (configsLoaded) {
      //update variables if spot price or config (but not config edit) changes
      setTotalAskPriceInUSD(spotPrice * (1 + config.total_ask_price_range));
      setTotalBidPriceInUSD(spotPrice * (1 - config.total_bid_price_range));
      setBestAskPriceInUSD(spotPrice * (1 + config.best_ask_price_range));
      setBestBidPriceInUSD(spotPrice * (1 - config.best_bid_price_range));
      setSpreadUpperPrice(spotPrice * (1 + config.spread / 2));
      setSpreadLowerPrice(spotPrice * (1 - config.spread / 2));
    }
  }, [spotPrice, configsLoaded, config]);

  useEffect(() => {
    if (configsLoaded) {
      //reactive variables on edit
      configEdit.total_ask_price_range !== config.total_ask_price_range &&
        setTotalAskPriceInUSD(spotPrice * (1 + configEdit.total_ask_price_range));
      configEdit.total_bid_price_range !== config.total_bid_price_range &&
        setTotalBidPriceInUSD(spotPrice * (1 - configEdit.total_bid_price_range));
      configEdit.best_ask_price_range !== config.best_ask_price_range &&
        setBestAskPriceInUSD(spotPrice * (1 + configEdit.best_ask_price_range));
      configEdit.best_bid_price_range !== config.best_bid_price_range &&
        setBestBidPriceInUSD(spotPrice * (1 - configEdit.best_bid_price_range));
      if (configEdit.spread !== config.spread) {
        setSpreadUpperPrice(spotPrice * (1 + configEdit.spread / 2));
        setSpreadLowerPrice(spotPrice * (1 - configEdit.spread / 2));
      }
    }
  }, [spotPrice, configsLoaded, config, configEdit]);

  useEffect(() => {
    websocket.send(
      JSON.stringify({
        action: "GET_CONFIG",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
      })
    );
  }, [websocket]);

  useEffect(() => {
    let comparison: any = {}; //type later;
    for (const prop in config) {
      comparison[prop] = config[prop] !== configEdit[prop] ? false : true;
    }
    setCompare(comparison);
  }, [config, configEdit]);

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.action === "GET_CONFIG") {
      setConfig(JSON.parse(message.result));
      setConfigEdit(JSON.parse(message.result));
      setConfigsLoaded(true);
    }
    if (message.action === "UPDATE_CONFIG") {
      if (JSON.parse(message.result)) {
        setConfig(configEdit);
      }
    }
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

  const checkCompare = () => {
    let retbool: boolean = true;
    for (const prop in compare) {
      if (!compare[prop]) {
        retbool = false;
      }
    }
    return retbool;
  };

  console.log("pre render");
  console.log(compare);

  return (
    <div className="algo-control">
      <div className="vol-algo">
        <button disabled={checkCompare()} onClick={editConfig}>
          EDIT CONFIG
        </button>
        <h1>Volume</h1>
        <h2>ADV: $2.4m</h2>
        <div className={"field" + (!compare.vol_trade_per_hour ? " highlighted" : "")}>
          <b>USD Vol Trade Per Hour</b>
          <div className="field col">
            <b>{config.vol_trade_per_hour}</b>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, vol_trade_per_hour: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className={"field" + (!compare.min_trade ? " highlighted" : "")}>
          <b>Trade Slice Out Per Minute (Min)</b>
          <div className="field col">
            <b>{config.min_trade}</b>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, min_trade: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className={"field" + (!compare.max_trade ? " highlighted" : "")}>
          <b>Trade Slice Out Per Minute (Max)</b>
          <div className="field col">
            <b>{config.max_trade}</b>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, max_trade: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className={"field" + (!compare.random_walk_degree ? " highlighted" : "")}>
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
          <div
            className={
              "field col" + !compare.total_ask_price_range || !compare.total_bid_price_range ? " highlighted" : ""
            }
          >
            <span>Total Range in $:</span>
            <span>{totalAskPriceInUSD && totalBidPriceInUSD ? totalAskPriceInUSD - totalBidPriceInUSD : null}</span>
          </div>
        </div>
        <div className="field-group">
          <div
            className={
              "field col" + !compare.best_ask_price_range || !compare.best_bid_price_range ? " highlighted" : ""
            }
          >
            <span>Best Range in $:</span>
            <span>{bestAskPriceInUSD && bestBidPriceInUSD ? bestAskPriceInUSD - bestBidPriceInUSD : null}</span>
          </div>
        </div>
        <div className="field-group">
          <div className={"field col" + (!compare.spread ? " highlighted" : "")}>
            <span>
              Price Gap Allowance / Spread: <br />
              <b>{config.spread}</b>
            </span>
            <input type="number" onChange={(e) => setConfigEdit({ ...configEdit, spread: e.target.value })} />
          </div>
        </div>
        <div className="field-group">
          <div className={"field col" + (!compare.total_ask_price_range ? " highlighted" : "")}>
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
          <div className={"field col" + (!compare.total_ask_price_range ? " highlighted" : "")}>
            <span>
              Upper Total Range Price <br />
              / Total Ask Price: <br />
            </span>
            <b>{totalAskPriceInUSD && totalAskPriceInUSD}$</b>
          </div>
          <div className={"field col" + (!compare.total_ask_price_range ? " highlighted" : "")}>
            <span>Upper Total Range Quantity</span>
            <b>
              {orderBook.ask
                .filter((ask, i) => ask[0] <= (totalAskPriceInUSD ? totalAskPriceInUSD : spotPrice))
                .reduce((acc, next) => acc + next[1], 0)}
            </b>
          </div>
          <div className={"field col" + (!compare.total_ask_order_depth ? " highlighted" : "")}>
            <span>
              Total Ask Order Depth: <br />
              <b>{config.total_ask_order_depth}</b>
            </span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, total_ask_order_depth: e.target.value })}
            />
          </div>
          <div className={"field col" + (!compare.total_ask_random_walk ? " highlighted" : "")}>
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
          <div className={"field col" + (!compare.best_ask_price_range ? " highlighted" : "")}>
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
          <div className={"field col" + (!compare.best_ask_price_range ? " highlighted" : "")}>
            <span>
              Upper Best Range Price / <br />
              Best Ask Price:
              <br />
            </span>
            <b>{bestAskPriceInUSD}$</b>
          </div>
          <div className={"field col" + (!compare.best_ask_price_range ? " highlighted" : "")}>
            <span>Upper Best Range Quantity</span>
            <b>
              {orderBook.ask
                .filter((ask, i) => ask[0] <= (bestAskPriceInUSD ? bestAskPriceInUSD : spotPrice))
                .reduce((acc, next) => acc + next[1], 0)}
            </b>
          </div>
          <div className={"field col" + (!compare.best_ask_order_depth ? " highlighted" : "")}>
            <span>
              Best Ask Order Depth: <br />
              <b>{config.best_ask_order_depth}</b>
            </span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, best_ask_order_depth: Number(e.target.value) })}
            />
          </div>
          <div className={"field col" + (!compare.best_ask_random_walk ? " highlighted" : "")}>
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
          <div className={"field col" + (!compare.spread ? " highlighted" : "")}>
            <span>Upper Price</span>
            <b>{spreadUpperPrice && spreadUpperPrice}$</b>
          </div>
        </div>
        <div className="field-group">
          <div className="field col">
            <span>Spot Price</span>
            <b>{spotPrice}$</b>
          </div>
        </div>
        <div className="field-group">
          <div className={"field col" + (!compare.spread ? " highlighted" : "")}>
            <span>Lower Price</span>
            <b>{spreadLowerPrice && spreadLowerPrice}$</b>
          </div>
        </div>
        <div className="field-group">
          <div className={"field col" + (!compare.best_bid_price_range ? " highlighted" : "")}>
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
          <div className={"field col" + (!compare.best_bid_price_range ? " highlighted" : "")}>
            <span>
              Lower Best Range Price /<br /> Best Bid Price
            </span>
            <b>{bestBidPriceInUSD}$</b>
          </div>
          <div className={"field col" + (!compare.best_bid_price_range ? " highlighted" : "")}>
            <span>Lower Best Range Quantity</span>
            <b>
              {orderBook.bid
                .filter((bid, i) => bid[0] >= (bestBidPriceInUSD ? bestBidPriceInUSD : spotPrice))
                .reduce((acc, next) => acc + next[1], 0)}
            </b>
          </div>
          <div className={"field col" + (!compare.best_bid_order_depth ? " highlighted" : "")}>
            <span>
              Best Bid Order Depth: <br />
              <b>{config.best_bid_order_depth}</b>
            </span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, best_bid_order_depth: Number(e.target.value) })}
            />
          </div>
          <div className={"field col" + (!compare.best_bid_random_walk ? " highlighted" : "")}>
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
          <div className={"field col" + (!compare.total_bid_price_range ? " highlighted" : "")}>
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
          <div className={"field col" + (!compare.total_bid_price_range ? " highlighted" : "")}>
            <span>
              Lower Total Range Price /<br />
              Total Bid Price:
            </span>
            <b>{totalBidPriceInUSD}$</b>
          </div>
          <div className={"field col" + (!compare.total_bid_price_range ? " highlighted" : "")}>
            <span>Lower Total Range Quantity</span>
            <b>
              {orderBook.bid
                .filter((bid, i) => bid[0] >= (totalBidPriceInUSD ? totalBidPriceInUSD : spotPrice))
                .reduce((acc, next) => acc + next[1], 0)}
            </b>
          </div>
          <div className={"field col" + (!compare.total_bid_order_depth ? " highlighted" : "")}>
            <span>
              Total Bid Order Depth: <br />
              <b>{config.total_bid_order_depth}</b>
            </span>
            <input
              type="number"
              onChange={(e) => setConfigEdit({ ...configEdit, total_bid_order_depth: Number(e.target.value) })}
            />
          </div>
          <div className={"field col" + (!compare.total_bid_random_walk ? " highlighted" : "")}>
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
