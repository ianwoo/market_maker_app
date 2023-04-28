import { useEffect, useState } from "react";
import { OrderBookUpdate } from "../App";

type Props = {
  websocket: WebSocket;
  spotPrice: number;
  orderBook: OrderBookUpdate;
};

// type Config = {
//   mm_engine_status: boolean;
//   self_trade_status: boolean;
//   vol_trade_per_hour: number;
//   min_trade: number;
//   max_trade: number;
//   random_walk_degree: string;
//   spread: number;
//   total_ask_price_range: number;
//   total_ask_order_depth: number;
//   total_ask_random_walk: string;
//   best_ask_price_range: number;
//   best_ask_order_depth: number;
//   best_ask_random_walk: string;
//   tilt_asks: number;
//   tilt_bids: number;
//   best_bid_price_range: number;
//   best_bid_order_depth: number;
//   best_bid_random_walk: string;
//   total_bid_price_range: number;
//   total_bid_order_depth: number;
//   total_bid_random_walk: string;
// };

enum FieldType {
  Input = 0,
  Select = 1,
  Output = 2,
}

type Field = {
  fieldNames: string[];
  fieldTitle: string;
  fieldType: FieldType;
  prefix?: string;
  suffix?: string;
  output?: number;
  validation?: string;
};

const volAlgoFields: Field[] = [
  {
    fieldNames: ["vol_trade_per_hour"],
    fieldTitle: "USD Vol Trade Per Hour",
    fieldType: FieldType.Input,
    prefix: "$",
    validation: "Must enter a positive value!",
  },
  {
    fieldNames: ["min_trade"],
    fieldTitle: "Minimum Trade Slice Out Per Minute",
    fieldType: FieldType.Input,
    validation: "Must enter a positive value!",
  },
  {
    fieldNames: ["max_trade"],
    fieldTitle: "Maximum Trade Slice Out Per Minute",
    fieldType: FieldType.Input,
    validation: "Must enter a positive value!",
  },
  {
    fieldNames: ["random_walk_degree"],
    fieldTitle: "Random Walk Degree",
    fieldType: FieldType.Select,
  },
];

const AlgoControl = (props: Props) => {
  const { websocket, spotPrice, orderBook } = props;

  const [configsLoaded, setConfigsLoaded] = useState<boolean>(false);
  const [config, setConfig] = useState<any>({});
  const [configEdit, setConfigEdit] = useState<any>({});
  const [compare, setCompare] = useState<any>({});
  const [validations, setValidations] = useState<any>({});

  const [totalAskPriceInUSD, setTotalAskPriceInUSD] = useState<number>();
  const [totalBidPriceInUSD, setTotalBidPriceInUSD] = useState<number>();
  const [bestAskPriceInUSD, setBestAskPriceInUSD] = useState<number>();
  const [bestBidPriceInUSD, setBestBidPriceInUSD] = useState<number>();
  const [spreadUpperPrice, setSpreadUpperPrice] = useState<number>();
  const [spreadLowerPrice, setSpreadLowerPrice] = useState<number>();

  const orderBookAlgoFieldGroups: Field[][] = [
    [
      {
        fieldNames: ["total_ask_price_range", "total_bid_price_range"],
        fieldTitle: "Total Range in $",
        fieldType: FieldType.Output,
        prefix: "$",
        output:
          totalAskPriceInUSD !== undefined && totalBidPriceInUSD !== undefined
            ? totalAskPriceInUSD - totalBidPriceInUSD
            : undefined,
      },
    ],
    [
      {
        fieldNames: ["best_ask_price_range", "best_bid_price_range"],
        fieldTitle: "Best Range in $",
        fieldType: FieldType.Output,
        prefix: "$",
        output:
          bestAskPriceInUSD !== undefined && bestBidPriceInUSD !== undefined
            ? bestAskPriceInUSD - bestBidPriceInUSD
            : undefined,
      },
    ],
    [
      {
        fieldNames: ["spread"],
        fieldTitle: "Price Gap Allowance / Spread",
        fieldType: FieldType.Input,
        suffix: "%",
      },
    ],
    [
      {
        fieldNames: ["total_ask_price_range"],
        fieldTitle: "Upper Total Range / Total Ask",
        fieldType: FieldType.Input,
        suffix: "%",
        validation: "Must enter a positive value!",
      },
      {
        fieldNames: ["total_ask_price_range"],
        fieldTitle: "Upper Total Range Price / Total Ask Price",
        fieldType: FieldType.Output,
        prefix: "$",
        output: totalAskPriceInUSD,
      },
      {
        fieldNames: ["total_ask_price_range"],
        fieldTitle: "Upper Total Range Quantity",
        fieldType: FieldType.Output,
        output: orderBook.ask
          .filter(
            (ask, i) =>
              ask[0] <= (totalAskPriceInUSD ? totalAskPriceInUSD : spotPrice * (1 + config.total_ask_price_range))
          )
          .reduce((acc, next) => acc + next[1], 0),
      },
      {
        fieldNames: ["total_ask_order_depth"],
        fieldTitle: "Total Ask Order Depth",
        fieldType: FieldType.Input,
        prefix: "$",
        validation: "Must enter a positive value!",
      },
      {
        fieldNames: ["total_ask_random_walk"],
        fieldTitle: "Random Walk (Total Ask)",
        fieldType: FieldType.Select,
      },
    ],
    [
      {
        fieldNames: ["best_ask_price_range"],
        fieldTitle: "Upper Best Range / Best Ask",
        fieldType: FieldType.Input,
        suffix: "%",
        validation: "Must enter a positive value!",
      },
      {
        fieldNames: ["best_ask_price_range"],
        fieldTitle: "Upper Best Range Price / Best Ask Price",
        fieldType: FieldType.Output,
        prefix: "$",
        output: bestAskPriceInUSD,
      },
      {
        fieldNames: ["best_ask_price_range"],
        fieldTitle: "Upper Best Range Quantity",
        fieldType: FieldType.Output,
        output: orderBook.ask
          .filter((ask, i) => ask[0] <= (bestAskPriceInUSD ? bestAskPriceInUSD : spotPrice))
          .reduce((acc, next) => acc + next[1], 0),
      },
      {
        fieldNames: ["best_ask_order_depth"],
        fieldTitle: "Best Ask Order Depth",
        fieldType: FieldType.Input,
        prefix: "$",
        validation: "Must enter a positive value!",
      },
      {
        fieldNames: ["best_ask_random_walk"],
        fieldTitle: "Random Walk (Best Ask)",
        fieldType: FieldType.Select,
      },
    ],
    [
      {
        fieldNames: ["tilt_asks"],
        fieldTitle: "Order Tilt (Asks)",
        fieldType: FieldType.Input,
        validation: "Must enter a value from 0 to 10!",
      },
    ],
    [
      {
        fieldNames: ["spread"],
        fieldTitle:
          "Upper Price (" + ((configEdit.spread ? configEdit.spread : config.spread) / 2) * 100 + "% above Spot)",
        fieldType: FieldType.Output,
        prefix: "$",
        output: spreadUpperPrice,
      },
    ],
    [
      {
        fieldNames: ["spread"],
        fieldTitle: "Spot Price",
        fieldType: FieldType.Output,
        prefix: "$",
        output: spotPrice,
      },
    ],
    [
      {
        fieldNames: ["spread"],
        fieldTitle:
          "Lower Price" + ((configEdit.spread ? configEdit.spread : config.spread) / 2) * 100 + "% below Spot)",
        fieldType: FieldType.Output,
        prefix: "$",
        output: spreadLowerPrice,
      },
    ],
    [
      {
        fieldNames: ["tilt_bids"],
        fieldTitle: "Order Tilt (Bids)",
        fieldType: FieldType.Input,
        validation: "Must enter a value from 0 to 10!",
      },
    ],
    [
      {
        fieldNames: ["best_bid_price_range"],
        fieldTitle: "Lower Best Range / Best Bid",
        fieldType: FieldType.Input,
        suffix: "%",
        validation: "Must enter a positive value!",
      },
      {
        fieldNames: ["best_bid_price_range"],
        fieldTitle: "Lower Best Range Price / Best Bid Price",
        fieldType: FieldType.Output,
        prefix: "$",
        output: bestBidPriceInUSD,
      },
      {
        fieldNames: ["best_bid_price_range"],
        fieldTitle: "Lower Best Range Quantity",
        fieldType: FieldType.Output,
        output: orderBook.bid
          .filter((bid, i) => bid[0] <= (bestBidPriceInUSD ? bestBidPriceInUSD : spotPrice))
          .reduce((acc, next) => acc + next[1], 0),
      },
      {
        fieldNames: ["best_bid_order_depth"],
        fieldTitle: "Best Bid Order Depth",
        fieldType: FieldType.Input,
        prefix: "$",
        validation: "Must enter a positive value!",
      },
      {
        fieldNames: ["best_bid_random_walk"],
        fieldTitle: "Random Walk (Best Bid)",
        fieldType: FieldType.Select,
      },
    ],
    [
      {
        fieldNames: ["total_bid_price_range"],
        fieldTitle: "Lower Total Range / Total Bid",
        fieldType: FieldType.Input,
        suffix: "%",
        validation: "Must enter a positive value!",
      },
      {
        fieldNames: ["total_bid_price_range"],
        fieldTitle: "Lower Total Range Price / Total Bid Price",
        fieldType: FieldType.Output,
        prefix: "$",
        output: totalBidPriceInUSD,
      },
      {
        fieldNames: ["total_bid_price_range"],
        fieldTitle: "Lower Total Range Quantity",
        fieldType: FieldType.Output,
        output: orderBook.bid
          .filter(
            (bid, i) =>
              bid[0] <= (totalBidPriceInUSD ? totalBidPriceInUSD : spotPrice * (1 + config.total_bid_price_range))
          )
          .reduce((acc, next) => acc + next[1], 0),
      },
      {
        fieldNames: ["total_bid_order_depth"],
        fieldTitle: "Total Bid Order Depth",
        fieldType: FieldType.Input,
        prefix: "$",
        validation: "Must enter a positive value!",
      },
      {
        fieldNames: ["total_bid_random_walk"],
        fieldTitle: "Random Walk (Total Bid)",
        fieldType: FieldType.Select,
      },
    ],
  ];

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
        case "vol_trade_per_hour":
        case "min_trade":
        case "max_trade":
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
          validations[prop] = !(configEdit[prop] > 10 || configEdit[prop] < 1);
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
      setConfig({ ...config, [message.type + "_status"]: !config[message.type + "_status"] });
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

  const startAlgo = (type: string) => {
    websocket.send(
      JSON.stringify({
        action: "START_STOP",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        type: type,
        status: true,
      })
    );
  };

  const stopAlgo = (type: string) => {
    websocket.send(
      JSON.stringify({
        action: "START_STOP",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        type: type,
        status: false,
      })
    );
  };

  const renderField = (f: Field, i: number) => (
    <div key={i} className={"field col" + (f.fieldNames.some((fn) => !compare[fn]) ? " highlighted" : "")}>
      <span>{f.fieldTitle}</span>
      {f.fieldType !== FieldType.Output && (
        <b>
          {f.prefix}
          {f.suffix !== "%" ? config[f.fieldNames[0]] : config[f.fieldNames[0]] * 100}
          {f.suffix}
        </b>
      )}
      {f.fieldType === FieldType.Input && (
        <input
          type="number"
          onChange={(e) => {
            e.target.value === ""
              ? setConfigEdit({ ...configEdit, [f.fieldNames[0]]: config[f.fieldNames[0]] })
              : setConfigEdit({
                  ...configEdit,
                  [f.fieldNames[0]]:
                    f.suffix !== "%"
                      ? f.fieldNames[0] === "tilt_asks" || f.fieldNames[0] === "tilt_bids"
                        ? Number(e.target.value).toFixed(0)
                        : Number(e.target.value)
                      : Number(e.target.value) / 100,
                });
          }}
        />
      )}
      {f.fieldType === FieldType.Select && (
        <select
          onChange={(e) => {
            e.target.value === ""
              ? setConfigEdit({ ...configEdit, [f.fieldNames[0]]: config[f.fieldNames[0]] })
              : setConfigEdit({ ...configEdit, [f.fieldNames[0]]: e.target.value });
          }}
          defaultValue={config[f.fieldNames[0]]}
        >
          {!compare[f.fieldNames[0]] && <option value="">Reset</option>}
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      )}
      {f.fieldType === FieldType.Output && (
        <b>
          {f.prefix}
          {f.output && f.output.toFixed(4)}
          {f.suffix}
        </b>
      )}
      {f.validation && !validations[f.fieldNames[0]] && <span className="validation">{f.validation}</span>}
    </div>
  );

  return (
    <div className="algo-control">
      <div className="fixed-buttons">
        <button className="edit-config" disabled={checkCompare() || !checkValidations()} onClick={editConfig}>
          EDIT CONFIG
        </button>
        {config.mm_engine_status ? (
          <button className="stop-algo" onClick={() => stopAlgo("mm_engine")}>
            STOP MM ENGINE
          </button>
        ) : (
          <button className="start-algo" onClick={() => startAlgo("mm_engine")}>
            START MM ENGINE
          </button>
        )}
        {config.self_trade_status ? (
          <button className="stop-algo" onClick={() => stopAlgo("self_trade")}>
            STOP SELF TRADE
          </button>
        ) : (
          <button className="start-algo" onClick={() => startAlgo("self_trade")}>
            START SELF TRADE
          </button>
        )}
      </div>
      <div className="algo-status">
        <h1>Algo Status:</h1>
        <h2>MM Engine is {config.mm_engine_status ? "running" : "stopped"}</h2>
        <h2>Self Trading is {config.self_trade_status ? "running" : "stopped"}</h2>
      </div>
      <div className="vol-algo">
        <h1>Volume</h1>
        <div className="field-group">{volAlgoFields.map((f, i) => renderField(f, i))}</div>
      </div>
      <div className="order-book-depth">
        <h1>Order Book Depth</h1>
        {orderBookAlgoFieldGroups.map((fg, i) => (
          <div className="field-group" key={"fg" + i}>
            {fg.map((f, j) => renderField(f, 3 + j))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlgoControl;
