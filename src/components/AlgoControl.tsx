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
  const [validations, setValidations] = useState<any>({});

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
      setTotalAskPriceInUSD(spotPrice * (1 + configEdit.total_ask_price_range));
      setTotalBidPriceInUSD(spotPrice * (1 - configEdit.total_bid_price_range));
      setBestAskPriceInUSD(spotPrice * (1 + configEdit.best_ask_price_range));
      setBestBidPriceInUSD(spotPrice * (1 - configEdit.best_bid_price_range));
      setSpreadUpperPrice(spotPrice * (1 + configEdit.spread / 2));
      setSpreadLowerPrice(spotPrice * (1 - configEdit.spread / 2));
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

  useEffect(() => {
    let validations: any = {};
    for (const prop in configEdit) {
      switch (prop) {
        case "total_ask_price_range":
        case "best_ask_price_range":
        case "total_bid_price_range":
        case "best_bid_price_range":
        case "total_ask_order_depth":
        case "best_ask_order_depth":
        case "total_bid_order_depth":
        case "best_bid_order_depth":
          validations[prop] = !(configEdit[prop] < 0);
          break;
        case "tilt_asks":
        case "tilt_bids":
          validations[prop] = !(configEdit[prop] > 10 || configEdit[prop] < 0);
          break;
        default:
          break;
      }
    }
    setValidations(validations);
  }, [configEdit]);

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
    if (message.action === "START_STOP") {
      setConfig({ ...config, status: message.result });
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

  const checkValidations = () => {
    let retbool: boolean = true;
    for (const prop in validations) {
      if (!validations[prop]) {
        retbool = false;
      }
    }
    return retbool;
  };

  const startAlgo = () => {
    websocket.send(
      JSON.stringify({
        action: "START_STOP",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        status: true,
      })
    );
  };

  const stopAlgo = () => {
    websocket.send(
      JSON.stringify({
        action: "START_STOP",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        status: false,
      })
    );
  };

  return (
    <div className="algo-control">
      <div className="fixed-buttons">
        <button className="edit-config" disabled={!checkCompare() && !checkValidations()} onClick={editConfig}>
          EDIT CONFIG
        </button>
        {config.status ? (
          <button className="stop-algo" onClick={() => stopAlgo()}>
            STOP ALGO
          </button>
        ) : (
          <button className="start-algo" onClick={() => startAlgo()}>
            START ALGO
          </button>
        )}
      </div>
      <div className="algo-status">
        <h1>Algo Status: Algo is {config.status ? "running" : "stopped"}</h1>
      </div>
      <div className="vol-algo">
        <h1>Volume</h1>
        <div className={"field col" + (!compare.vol_trade_per_hour ? " highlighted" : "")}>
          <span>USD Vol Trade Per Hour</span>
          <div className="field col">
            <b>${config.vol_trade_per_hour}</b>
            <input
              type="number"
              onChange={(e) => {
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, vol_trade_per_hour: config.vol_trade_per_hour })
                  : setConfigEdit({ ...configEdit, vol_trade_per_hour: Number(e.target.value) });
              }}
            />
          </div>
        </div>
        <div className={"field col" + (!compare.min_trade ? " highlighted" : "")}>
          <span>Trade Slice Out Per Minute (Min)</span>
          <div className="field col">
            <b>{config.min_trade}</b>
            <input
              type="number"
              onChange={(e) => {
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, min_trade: config.min_trade })
                  : setConfigEdit({ ...configEdit, min_trade: Number(e.target.value) });
              }}
            />
          </div>
        </div>
        <div className={"field col" + (!compare.max_trade ? " highlighted" : "")}>
          <span>Trade Slice Out Per Minute (Max)</span>
          <div className="field col">
            <b>{config.max_trade}</b>
            <input
              type="number"
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, max_trade: config.max_trade })
                  : setConfigEdit({ ...configEdit, max_trade: Number(e.target.value) })
              }
            />
          </div>
        </div>
        <div className={"field col" + (!compare.random_walk_degree ? " highlighted" : "")}>
          <span>Random Walk Degree</span>
          <div className="field col">
            <b>{config.random_walk_degree}</b>
            <select
              onChange={(e) => {
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, random_walk_degree: config.random_walk_degree })
                  : setConfigEdit({ ...configEdit, random_walk_degree: e.target.value });
              }}
              defaultValue={config.random_walk_degree}
            >
              {!compare.random_walk_degree && <option value="">Reset</option>}
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
            <br />
            <b>
              $
              {totalAskPriceInUSD !== undefined && totalBidPriceInUSD !== undefined
                ? (totalAskPriceInUSD - totalBidPriceInUSD).toFixed(4)
                : null}
            </b>
          </div>
        </div>
        <div className="field-group">
          <div
            className={
              "field col" + !compare.best_ask_price_range || !compare.best_bid_price_range ? " highlighted" : ""
            }
          >
            <span>Best Range in $:</span>
            <br />
            <b>
              $
              {bestAskPriceInUSD !== undefined && bestBidPriceInUSD !== undefined
                ? (bestAskPriceInUSD - bestBidPriceInUSD).toFixed(4)
                : null}
            </b>
          </div>
        </div>
        <div className="field-group">
          <div className={"field col" + (!compare.spread ? " highlighted" : "")}>
            <span>
              Price Gap Allowance / Spread: <br />
              <b>{config.spread * 100}%</b>
            </span>
            <input
              type="number"
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, spread: config.spread })
                  : setConfigEdit({ ...configEdit, spread: Number(e.target.value) / 100 })
              }
            />
          </div>
        </div>
        <div className="field-group">
          <div className={"field col" + (!compare.total_ask_price_range ? " highlighted" : "")}>
            <span>
              Upper Total Range
              <br />/ Total Ask: <br />
              <b>{config.total_ask_price_range * 100}%</b>
            </span>
            <input
              type="number"
              onChange={(e) =>
                e.target.value === "" || Number(e.target.value) === config.total_ask_price_range
                  ? setConfigEdit({ ...configEdit, total_ask_price_range: config.total_ask_price_range })
                  : setConfigEdit({ ...configEdit, total_ask_price_range: Number(e.target.value) / 100 })
              }
            />
            {!validations.total_ask_price_range && <span className="validation">Must enter a positive value!</span>}
          </div>
          <div className={"field col" + (!compare.total_ask_price_range ? " highlighted" : "")}>
            <span>
              Upper Total Range Price <br />
              / Total Ask Price: <br />
            </span>
            <b>${totalAskPriceInUSD && totalAskPriceInUSD}</b>
          </div>
          <div className={"field col" + (!compare.total_ask_price_range ? " highlighted" : "")}>
            <span>Upper Total Range Quantity</span>
            <br />
            <b>
              $
              {orderBook.ask
                .filter(
                  (ask, i) =>
                    ask[0] <= (totalAskPriceInUSD ? totalAskPriceInUSD : spotPrice * (1 + config.total_ask_price_range))
                )
                .reduce((acc, next) => acc + next[1], 0)
                .toFixed(4)}
            </b>
          </div>
          <div className={"field col" + (!compare.total_ask_order_depth ? " highlighted" : "")}>
            <span>
              Total Ask Order Depth: <br />
              <br />
              <b>${config.total_ask_order_depth}</b>
            </span>
            <input
              type="number"
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, total_ask_order_depth: config.total_ask_order_depth })
                  : setConfigEdit({ ...configEdit, total_ask_order_depth: e.target.value })
              }
            />
            {!validations.total_ask_order_depth && <span className="validation">Must enter a positive value!</span>}
          </div>
          <div className={"field col" + (!compare.total_ask_random_walk ? " highlighted" : "")}>
            <span>
              Random Walk (Total Ask): <br />
              <br />
              <b>{config.total_ask_random_walk}</b>
            </span>
            <select
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, total_ask_random_walk: config.total_ask_random_walk })
                  : setConfigEdit({ ...configEdit, total_ask_random_walk: e.target.value })
              }
            >
              {!compare.total_ask_random_walk && <option value="">Reset</option>}
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
              <b>{config.best_ask_price_range * 100}%</b>
            </span>
            <input
              type="number"
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, best_ask_price_range: config.best_ask_price_range })
                  : setConfigEdit({ ...configEdit, best_ask_price_range: Number(e.target.value) / 100 })
              }
            />
            {!validations.best_ask_price_range && <span className="validation">Must enter a positive value!</span>}
          </div>
          <div className={"field col" + (!compare.best_ask_price_range ? " highlighted" : "")}>
            <span>
              Upper Best Range Price / <br />
              Best Ask Price:
              <br />
            </span>
            <b>${bestAskPriceInUSD?.toFixed(4)}</b>
          </div>
          <div className={"field col" + (!compare.best_ask_price_range ? " highlighted" : "")}>
            <span>Upper Best Range Quantity</span>
            <br />
            <b>
              $
              {orderBook.ask
                .filter((ask, i) => ask[0] <= (bestAskPriceInUSD ? bestAskPriceInUSD : spotPrice))
                .reduce((acc, next) => acc + next[1], 0)
                .toFixed(4)}
            </b>
          </div>
          <div className={"field col" + (!compare.best_ask_order_depth ? " highlighted" : "")}>
            <span>
              Best Ask Order Depth: <br />
              <br />
              <b>${config.best_ask_order_depth}</b>
            </span>
            <input
              type="number"
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, best_ask_order_depth: config.best_ask_order_depth })
                  : setConfigEdit({ ...configEdit, best_ask_order_depth: Number(e.target.value) })
              }
            />
            {!validations.best_ask_order_depth && <span className="validation">Must enter a positive value!</span>}
          </div>
          <div className={"field col" + (!compare.best_ask_random_walk ? " highlighted" : "")}>
            <span>
              Random Walk (Best Ask): <br />
              <br />
              <b>{config.best_ask_random_walk}</b>
            </span>
            <select
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, best_ask_random_walk: config.best_ask_random_walk })
                  : setConfigEdit({ ...configEdit, best_ask_random_walk: e.target.value })
              }
            >
              {!compare.best_ask_random_walk && <option value="">Reset</option>}
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="field-group">
          <div className={"field col" + (!compare.tilt_asks ? " highlighted" : "")}>
            <span>
              Order Tilt
              <br />
              (Asks) <br />
              <b>{config.tilt_asks}</b>
            </span>
            <input
              type="number"
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, tilt_asks: config.tilt_asks })
                  : setConfigEdit({ ...configEdit, tilt_asks: Number(e.target.value).toFixed(0) })
              }
            />
            {!validations.tilt_asks && <span className="validation">Must enter a value from 1 to 10!</span>}
          </div>
        </div>
        <div className="field-group">
          <div className={"field col" + (!compare.spread ? " highlighted" : "")}>
            <span>Upper Price</span>
            <b>{spreadUpperPrice && spreadUpperPrice.toFixed(4)}$</b>
          </div>
        </div>
        <div className="field-group">
          <div className="field col">
            <span>Spot Price</span>
            <b>{spotPrice.toFixed(4)}$</b>
          </div>
        </div>
        <div className="field-group">
          <div className={"field col" + (!compare.spread ? " highlighted" : "")}>
            <span>Lower Price</span>
            <b>{spreadLowerPrice && spreadLowerPrice.toFixed(4)}$</b>
          </div>
        </div>
        <div className="field-group">
          <div className={"field col" + (!compare.tilt_bids ? " highlighted" : "")}>
            <span>
              Order Tilt
              <br />
              (Bids) <br />
              <b>{config.tilt_bids}</b>
            </span>
            <input
              type="number"
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, tilt_bids: config.tilt_bids })
                  : setConfigEdit({ ...configEdit, tilt_bids: Number(e.target.value) })
              }
            />
            {!validations.tilt_bids && <span className="validation">Must enter a value from 1 to 10!</span>}
          </div>
        </div>
        <div className="field-group">
          <div className={"field col" + (!compare.best_bid_price_range ? " highlighted" : "")}>
            <span>
              Lower Best Range /<br />
              Best Bid: <br />
              <b>{config.best_bid_price_range * 100}%</b>
            </span>
            <input
              type="number"
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, best_bid_price_range: config.best_bid_price_range })
                  : setConfigEdit({ ...configEdit, best_bid_price_range: Number(e.target.value) / 100 })
              }
            />
          </div>
          <div className={"field col" + (!compare.best_bid_price_range ? " highlighted" : "")}>
            <span>
              Lower Best Range Price /<br /> Best Bid Price
            </span>
            <b>${bestBidPriceInUSD?.toFixed(4)}</b>
          </div>
          <div className={"field col" + (!compare.best_bid_price_range ? " highlighted" : "")}>
            <span>Lower Best Range Quantity</span>
            <br />
            <b>
              $
              {orderBook.bid
                .filter((bid, i) => bid[0] >= (bestBidPriceInUSD ? bestBidPriceInUSD : spotPrice))
                .reduce((acc, next) => acc + next[1], 0)
                .toFixed(4)}
            </b>
          </div>
          <div className={"field col" + (!compare.best_bid_order_depth ? " highlighted" : "")}>
            <span>
              Best Bid Order Depth: <br />
              <br />
              <b>${config.best_bid_order_depth}</b>
            </span>
            <input
              type="number"
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, best_bid_order_depth: config.best_bid_order_depth })
                  : setConfigEdit({ ...configEdit, best_bid_order_depth: Number(e.target.value) })
              }
            />
            {!validations.best_bid_order_depth && <span className="validation">Must enter a positive value!</span>}
          </div>
          <div className={"field col" + (!compare.best_bid_random_walk ? " highlighted" : "")}>
            <span>
              Random Walk (Best Bid): <br />
              <br />
              <b>{config.best_bid_random_walk}</b>
            </span>
            <select
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, best_bid_random_walk: config.best_bid_random_walk })
                  : setConfigEdit({ ...configEdit, best_bid_random_walk: e.target.value })
              }
            >
              {!compare.best_bid_random_walk && <option value="">Reset</option>}
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
              <b>{config.total_bid_price_range * 100}%</b>
            </span>
            <input
              type="number"
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, total_bid_price_range: config.total_bid_price_range })
                  : setConfigEdit({ ...configEdit, total_bid_price_range: Number(e.target.value) / 100 })
              }
            />
            {!validations.total_bid_price_range && <span className="validation">Must enter a positive value!</span>}
          </div>
          <div className={"field col" + (!compare.total_bid_price_range ? " highlighted" : "")}>
            <span>
              Lower Total Range Price /<br />
              Total Bid Price:
            </span>
            <b>${totalBidPriceInUSD?.toFixed(4)}</b>
          </div>
          <div className={"field col" + (!compare.total_bid_price_range ? " highlighted" : "")}>
            <span>Lower Total Range Quantity</span>
            <br />
            <b>
              $
              {orderBook.bid
                .filter((bid, i) => bid[0] >= (totalBidPriceInUSD ? totalBidPriceInUSD : spotPrice))
                .reduce((acc, next) => acc + next[1], 0)
                .toFixed(4)}
            </b>
          </div>
          <div className={"field col" + (!compare.total_bid_order_depth ? " highlighted" : "")}>
            <span>
              Total Bid Order Depth: <br />
              <br />
              <b>${config.total_bid_order_depth}</b>
            </span>
            <input
              type="number"
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, total_bid_order_depth: config.total_bid_order_depth })
                  : setConfigEdit({ ...configEdit, total_bid_order_depth: Number(e.target.value) })
              }
            />
            {!validations.total_bid_order_depth && <span className="validation">Must enter a positive value!</span>}
          </div>
          <div className={"field col" + (!compare.total_bid_random_walk ? " highlighted" : "")}>
            <span>
              Random Walk (Total Bid): <br />
              <br />
              <b>{config.total_bid_random_walk}</b>
            </span>
            <select
              onChange={(e) =>
                e.target.value === ""
                  ? setConfigEdit({ ...configEdit, total_bid_random_walk: config.total_bid_random_walk })
                  : setConfigEdit({ ...configEdit, total_bid_random_walk: e.target.value })
              }
            >
              {!compare.total_bid_random_walk && <option value="">Reset</option>}
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgoControl;
