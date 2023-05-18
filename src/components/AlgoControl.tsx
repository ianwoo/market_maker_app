import { useEffect, useState } from "react";
import { AccountUpdate, OrderBookUpdate, Template } from "../App";

type Props = {
  websocket: WebSocket;
  orderBook: OrderBookUpdate;
  accountUpdate: AccountUpdate[];
  configsLoaded: boolean;
  config: any;
  configEdit: any;
  setConfigEdit: React.Dispatch<React.SetStateAction<any>>;
  templates: Template[];
  selectedTemplate: string;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string | undefined>>;
};

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
  const {
    websocket,
    // orderBook, we don't need this right now because supply quantity calc is inaccurate, orderbook is incomplete
    accountUpdate,
    configsLoaded,
    config,
    configEdit,
    setConfigEdit,
    templates,
    selectedTemplate,
    setSelectedTemplate,
  } = props;

  const spotPrice = accountUpdate[0].price;
  const capitalMaximumAsk = Number(accountUpdate[0].total) * spotPrice;
  const capitalMaximumBid = Number(accountUpdate[1].total);

  const [compare, setCompare] = useState<any>({});
  const [validations, setValidations] = useState<any>({});

  const [totalAskPriceInUSD, setTotalAskPriceInUSD] = useState<number>();
  const [totalBidPriceInUSD, setTotalBidPriceInUSD] = useState<number>();
  const [bestAskPriceInUSD, setBestAskPriceInUSD] = useState<number>();
  const [bestBidPriceInUSD, setBestBidPriceInUSD] = useState<number>();
  const [spreadUpperPrice, setSpreadUpperPrice] = useState<number>();
  const [spreadLowerPrice, setSpreadLowerPrice] = useState<number>();

  const [templateLoaded, setTemplateLoaded] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>();
  const [newTemplateNameValid, setNewTemplateNameValid] = useState<boolean>(true);

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
        validation: "Must be higher than Upper Best Range / Best Ask, and must be positive!",
      },
      {
        fieldNames: ["total_ask_price_range"],
        fieldTitle: "Upper Total Range Price / Total Ask Price",
        fieldType: FieldType.Output,
        prefix: "$",
        output: totalAskPriceInUSD,
      },
      //removing this for now because we cannot obtain full depth of book
      // {
      //   fieldNames: ["total_ask_price_range"],
      //   fieldTitle: "Upper Total Range Quantity",
      //   fieldType: FieldType.Output,
      //   output: orderBook.ask
      //     .filter(
      //       (ask, i) =>
      //         ask[0] <= (totalAskPriceInUSD ? totalAskPriceInUSD : spotPrice * (1 + config.total_ask_price_range))
      //     )
      //     .reduce((acc, next) => acc + next[1], 0),
      // },
      {
        fieldNames: ["total_ask_order_depth"],
        fieldTitle: "Total Ask Order Depth",
        fieldType: FieldType.Input,
        prefix: "$",
        validation:
          "Cannot be higher than amount of capital available ($" +
          capitalMaximumAsk.toFixed(4) +
          "), and must be positive!",
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
        validation: "Must be higher than half the spread, and must be positive!",
      },
      {
        fieldNames: ["best_ask_price_range"],
        fieldTitle: "Upper Best Range Price / Best Ask Price",
        fieldType: FieldType.Output,
        prefix: "$",
        output: bestAskPriceInUSD,
      },
      // {
      //   fieldNames: ["best_ask_price_range"],
      //   fieldTitle: "Upper Best Range Quantity",
      //   fieldType: FieldType.Output,
      //   output: orderBook.ask
      //     .filter(
      //       (ask, i) =>
      //         ask[0] <= (bestAskPriceInUSD ? bestAskPriceInUSD : spotPrice * (1 + config.best_ask_price_range))
      //     )
      //     .reduce((acc, next) => acc + next[1], 0),
      // },
      {
        fieldNames: ["best_ask_order_depth"],
        fieldTitle: "Best Ask Order Depth",
        fieldType: FieldType.Input,
        prefix: "$",
        validation:
          "Cannot be higher than amount of capital available ($" +
          capitalMaximumAsk.toFixed(4) +
          "), and must be positive!",
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
        validation: "Must enter a value from -5 to 5!",
      },
      {
        fieldNames: ["min_ask_order_usd_value"],
        fieldTitle: "Minimum Ask Order Size (USD)",
        fieldType: FieldType.Input,
        prefix: "$",
        validation: "Cannot be higher than Maximum Ask Order!",
      },
      {
        fieldNames: ["max_ask_order_usd_value"],
        fieldTitle: "Maximum Ask Order Size (USD)",
        fieldType: FieldType.Input,
        prefix: "$",
        validation: "Cannot be lower than Minimum Ask Order!",
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
          "Lower Price (" + ((configEdit.spread ? configEdit.spread : config.spread) / 2) * 100 + "% below Spot)",
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
        validation: "Must enter a value from -5 to 5!",
      },
      {
        fieldNames: ["min_bid_order_usd_value"],
        fieldTitle: "Minimum Bid Order Size (USD)",
        fieldType: FieldType.Input,
        prefix: "$",
        validation: "Cannot be higher than Maximum Bid Order!",
      },
      {
        fieldNames: ["max_bid_order_usd_value"],
        fieldTitle: "Maximum Bid Order Size (USD)",
        fieldType: FieldType.Input,
        prefix: "$",
        validation: "Cannot be lower than Minimum Bid Order!",
      },
    ],
    [
      {
        fieldNames: ["best_bid_price_range"],
        fieldTitle: "Lower Best Range / Best Bid",
        fieldType: FieldType.Input,
        suffix: "%",
        validation: "Must be higher than half the spread, and must be positive!",
      },
      {
        fieldNames: ["best_bid_price_range"],
        fieldTitle: "Lower Best Range Price / Best Bid Price",
        fieldType: FieldType.Output,
        prefix: "$",
        output: bestBidPriceInUSD,
      },
      // {
      //   fieldNames: ["best_bid_price_range"],
      //   fieldTitle: "Lower Best Range Quantity",
      //   fieldType: FieldType.Output,
      //   output: orderBook.bid
      //     .filter((bid, i) => bid[0] <= (bestBidPriceInUSD ? bestBidPriceInUSD : spotPrice))
      //     .reduce((acc, next) => acc + next[1], 0),
      // },
      {
        fieldNames: ["best_bid_order_depth"],
        fieldTitle: "Best Bid Order Depth",
        fieldType: FieldType.Input,
        prefix: "$",
        validation:
          "Cannot be higher than amount of capital available ($" +
          capitalMaximumBid.toFixed(4) +
          "), and must be positive!",
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
        validation: "Must be higher than Lower Best Range / Best Bid, and must be positive!",
      },
      {
        fieldNames: ["total_bid_price_range"],
        fieldTitle: "Lower Total Range Price / Total Bid Price",
        fieldType: FieldType.Output,
        prefix: "$",
        output: totalBidPriceInUSD,
      },
      // {
      //   fieldNames: ["total_bid_price_range"],
      //   fieldTitle: "Lower Total Range Quantity",
      //   fieldType: FieldType.Output,
      //   output: orderBook.bid
      //     .filter(
      //       (bid, i) =>
      //         bid[0] <= (totalBidPriceInUSD ? totalBidPriceInUSD : spotPrice * (1 + config.total_bid_price_range))
      //     )
      //     .reduce((acc, next) => acc + next[1], 0),
      // },
      {
        fieldNames: ["total_bid_order_depth"],
        fieldTitle: "Total Bid Order Depth",
        fieldType: FieldType.Input,
        prefix: "$",
        validation:
          "Cannot be higher than amount of capital available ($" +
          capitalMaximumBid.toFixed(4) +
          "), and must be positive!",
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
    websocket.send(
      JSON.stringify({
        action: "GET_TEMPLATES",
        request_id: Date.now(),
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
          validations[prop] = !(configEdit[prop] < configEdit.best_ask_price_range || configEdit[prop] < 0);
          break;
        case "total_bid_price_range":
          validations[prop] = !(configEdit[prop] < configEdit.best_bid_price_range || configEdit[prop] < 0);
          break;
        case "best_ask_price_range":
        case "best_bid_price_range":
          validations[prop] = !(configEdit[prop] < configEdit.spread / 2 || configEdit[prop] < 0);
          break;
        case "total_ask_order_depth":
        case "best_ask_order_depth":
          validations[prop] = !(configEdit[prop] > capitalMaximumAsk || configEdit[prop] < 0);
        case "total_bid_order_depth":
        case "best_bid_order_depth":
          validations[prop] = !(configEdit[prop] > capitalMaximumBid || configEdit[prop] < 0);
          break;
        case "min_bid_order_usd_value":
          validations[prop] = !(configEdit[prop] > configEdit.max_bid_order_usd_value || configEdit[prop] <= 0);
          break;
        case "max_bid_order_usd_value":
          validations[prop] = !(configEdit[prop] < configEdit.min_bid_order_usd_value || configEdit[prop] <= 0);
          break;
        case "min_ask_order_usd_value":
          validations[prop] = !(configEdit[prop] > configEdit.max_ask_order_usd_value || configEdit[prop] <= 0);
          break;
        case "max_ask_order_usd_value":
          validations[prop] = !(configEdit[prop] < configEdit.min_ask_order_usd_value || configEdit[prop] <= 0);
          break;
        case "vol_trade_per_hour":
        case "min_trade":
        case "max_trade":
          validations[prop] = !(configEdit[prop] < 0);
          break;
        case "tilt_asks":
        case "tilt_bids":
          validations[prop] = !(configEdit[prop] > 5 || configEdit[prop] < -5);
          break;
        default:
          break;
      }
    }
    setValidations(validations);
  }, [capitalMaximumAsk, capitalMaximumBid, configEdit]);

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

  const loadTemplate = () => {
    if (selectedTemplate === "") return;
    const template = templates.find((t) => t.template_name === selectedTemplate);
    setTemplateLoaded(true);
    setConfigEdit(template?.update_params);
  };

  const saveTemplate = (templateName: string) => {
    websocket.send(
      JSON.stringify({
        action: "SAVE_TEMPLATE",
        request_id: Date.now(),
        update_params: config,
        template_name: templateName,
      })
    );
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName || newTemplateName === "") {
      setNewTemplateNameValid(false);
      return;
    } else {
      setNewTemplateNameValid(true);
      saveTemplate(newTemplateName);
      websocket.send(
        JSON.stringify({
          action: "GET_TEMPLATES",
          request_id: Date.now(),
        })
      );
    }
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
      {f.fieldType !== FieldType.Output && config[f.fieldNames[0]] !== configEdit[f.fieldNames[0]] && (
        <b>
          {"=> "}
          {f.prefix}
          {f.suffix !== "%" ? configEdit[f.fieldNames[0]] : configEdit[f.fieldNames[0]] * 100}
          {f.suffix}
        </b>
      )}
      {!templateLoaded && f.fieldType === FieldType.Input && (
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
      {!templateLoaded && f.fieldType === FieldType.Select && (
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
      {templateLoaded && f.fieldType !== FieldType.Output && <span>Template: {selectedTemplate}</span>}
      {f.fieldType === FieldType.Output && (
        <b>
          {f.prefix}
          {f.output && f.output.toFixed(4)}
          {f.suffix}
        </b>
      )}
      {f.validation && !validations[f.fieldNames[0]] && <span className="validation">{f.validation}</span>}
      {(f.fieldTitle === "Total Ask Order Depth" ||
        f.fieldTitle === "Best Ask Order Depth" ||
        f.fieldTitle === "Total Bid Order Depth" ||
        f.fieldTitle === "Best Bid Order Depth") &&
        configEdit[f.fieldNames[0]] >
          (f.fieldTitle === "Total Ask Order Depth" || f.fieldTitle === "Best Ask Order Depth"
            ? capitalMaximumAsk
            : capitalMaximumBid) /
            2 &&
        validations[f.fieldNames[0]] && (
          <span className="warning">
            This will commit more than half of available capital (
            {(f.fieldTitle === "Total Ask Order Depth" || f.fieldTitle === "Best Ask Order Depth"
              ? capitalMaximumAsk
              : capitalMaximumBid
            ).toFixed(4)}
            ) to this order depth! Are you sure?
          </span>
        )}
    </div>
  );

  return (
    <div className="algo-control">
      <div className="fixed-buttons">
        <div className="templates-wrapper">
          <div className="templates">
            {!templateLoaded ? (
              <button className="template apply-template" onClick={loadTemplate}>
                APPLY TEMPLATE
              </button>
            ) : (
              <button
                className="template remove-template"
                onClick={() => {
                  setTemplateLoaded(false);
                  setConfigEdit(config);
                }}
              >
                REMOVE TEMPLATE
              </button>
            )}
            {!templateLoaded ? (
              <select
                className="template"
                onChange={(e) => {
                  if (e.target.value !== "") {
                    setSelectedTemplate(e.target.value);
                  } else {
                    setTemplateLoaded(false);
                    setConfigEdit(config);
                  }
                }}
              >
                {templates.map((t, i) => (
                  <option key={i} value={t.template_name}>
                    {t.template_name}
                  </option>
                ))}
              </select>
            ) : (
              <span>{selectedTemplate}</span>
            )}
          </div>
        </div>
        <div className="templates-wrapper">
          <div className="templates">
            <button
              className="template save-template"
              onClick={handleSaveTemplate}
              disabled={!checkCompare() || !checkValidations()}
            >
              SAVE TEMPLATE
            </button>
            <input className="template" onChange={(e) => setNewTemplateName(e.target.value)} />
          </div>
          {!newTemplateNameValid && [
            <span>Please enter a template name to save these values!</span>,
            <button onClick={() => setNewTemplateNameValid(true)}>Close Warning</button>,
          ]}
        </div>
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
