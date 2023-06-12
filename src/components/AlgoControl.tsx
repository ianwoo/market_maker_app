import { useEffect, useState } from "react";
import { AccountUpdate, OrderBookUpdate, Template } from "../App";
import OrderBookShape from "./OrderBookShape";

type Props = {
  websocket: WebSocket;
  projectName: string;
  algoAccounts: string[];
  orderBook: OrderBookUpdate;
  orderBookSpotPrice: number;
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
  gap?: boolean;
  hideLabel?: boolean;
  extended?: boolean;
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

//THESE FIELDS ARE NOT PRESENT IN SCOTTIE'S NEW DESIGN:
// {
//   fieldNames: ["total_ask_price_range", "total_bid_price_range"],
//   fieldTitle: "Total Range in $",
//   fieldType: FieldType.Output,
//   prefix: "$",
//   output:
//     totalAskPriceInUSD !== undefined && totalBidPriceInUSD !== undefined
//       ? totalAskPriceInUSD - totalBidPriceInUSD
//       : undefined,
//   gap: true,
// },
// {
//   fieldNames: ["best_ask_price_range", "best_bid_price_range"],
//   fieldTitle: "Best Range in $",
//   fieldType: FieldType.Output,
//   prefix: "$",
//   output:
//     bestAskPriceInUSD !== undefined && bestBidPriceInUSD !== undefined
//       ? bestAskPriceInUSD - bestBidPriceInUSD
//       : undefined,
//   gap: true,
// },

//THESE FIELDS CAN'T BE CALCULATED RIGHT NOW BECAUSE OF 200 LINE CALL MAX
// {
//   fieldNames: ["best_ask_price_range"],
//   fieldTitle: "Upper Best Range Quantity",
//   fieldType: FieldType.Output,
//   output: orderBook.ask
//     .filter(
//       (ask, i) =>
//         ask[0] <= (bestAskPriceInUSD ? bestAskPriceInUSD : orderBookSpotPrice * (1 + config.best_ask_price_range))
//     )
//     .reduce((acc, next) => acc + next[1], 0),
// },
// {
//   fieldNames: ["total_ask_price_range"],
//   fieldTitle: "Upper Total Range Quantity",
//   fieldType: FieldType.Output,
//   output: orderBook.ask
//     .filter(
//       (ask, i) =>
//         ask[0] <= (totalAskPriceInUSD ? totalAskPriceInUSD : orderBookSpotPrice * (1 + config.total_ask_price_range))
//     )
//     .reduce((acc, next) => acc + next[1], 0),
// },
// {
//   fieldNames: ["best_bid_price_range"],
//   fieldTitle: "Lower Best Range Quantity",
//   fieldType: FieldType.Output,
//   output: orderBook.bid
//     .filter((bid, i) => bid[0] <= (bestBidPriceInUSD ? bestBidPriceInUSD : orderBookSpotPrice))
//     .reduce((acc, next) => acc + next[1], 0),
// },
// {
//   fieldNames: ["total_bid_price_range"],
//   fieldTitle: "Lower Total Range Quantity",
//   fieldType: FieldType.Output,
//   output: orderBook.bid
//     .filter(
//       (bid, i) =>
//         bid[0] <= (totalBidPriceInUSD ? totalBidPriceInUSD : orderBookSpotPrice * (1 + config.total_bid_price_range))
//     )
//     .reduce((acc, next) => acc + next[1], 0),
// },

const AlgoControl = (props: Props) => {
  const {
    websocket,
    projectName,
    algoAccounts,
    // orderBook, we don't need this right now because supply quantity calc is inaccurate, orderbook is incomplete
    orderBookSpotPrice,
    accountUpdate,
    configsLoaded,
    config,
    configEdit,
    setConfigEdit,
    templates,
    selectedTemplate,
    setSelectedTemplate,
  } = props;

  const capitalMaximumAsk = Number(accountUpdate[0].total) * orderBookSpotPrice;
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

  const AskFieldGroups1: Field[][] = [
    [
      {
        fieldNames: ["total_ask_price_range"],
        fieldTitle: "Outer Offer Bound Price:",
        fieldType: FieldType.Output,
        prefix: "$",
        output: totalAskPriceInUSD,
        gap: true,
      },
      {
        fieldNames: ["total_ask_price_range"],
        fieldTitle: "Outer Offer Bound %",
        fieldType: FieldType.Input,
        suffix: "%",
        validation: "Must be higher than Upper Best Range / Best Ask, and must be positive!",
        hideLabel: true,
      },
      {
        fieldNames: ["total_ask_order_depth"],
        fieldTitle: "Total Ask Order Depth",
        fieldType: FieldType.Input,
        prefix: "$",
        validation:
          "Cannot be higher than amount of capital available ($" +
          capitalMaximumAsk.toFixed(4) +
          "), and must be positive!",
        hideLabel: true,
      },
    ],
    [
      {
        fieldNames: ["best_ask_price_range"],
        fieldTitle: "Inner Offer Bound Price:",
        fieldType: FieldType.Output,
        prefix: "$",
        output: bestAskPriceInUSD,
        gap: true,
      },
      {
        fieldNames: ["best_ask_price_range"],
        fieldTitle: "Inner Offer Bound %",
        fieldType: FieldType.Input,
        suffix: "%",
        validation: "Must be higher than half the spread, and must be positive!",
        hideLabel: true,
      },
      {
        fieldNames: ["best_ask_order_depth"],
        fieldTitle: "Best Ask Order Depth",
        fieldType: FieldType.Input,
        prefix: "$",
        validation:
          "Cannot be higher than amount of capital available ($" +
          capitalMaximumAsk.toFixed(4) +
          "), and must be positive!",
        hideLabel: true,
      },
    ],
  ];
  const BidFieldGroups1: Field[][] = [
    [
      {
        fieldNames: ["best_bid_price_range"],
        fieldTitle: "Inner Bid Bound Price:",
        fieldType: FieldType.Output,
        prefix: "$",
        output: bestBidPriceInUSD,
        gap: true,
      },
      {
        fieldNames: ["best_bid_price_range"],
        fieldTitle: "Inner Bid Bound %",
        fieldType: FieldType.Input,
        suffix: "%",
        validation: "Must be higher than half the spread, and must be positive!",
        hideLabel: true,
      },

      {
        fieldNames: ["best_bid_order_depth"],
        fieldTitle: "Best Bid Order Depth",
        fieldType: FieldType.Input,
        prefix: "$",
        validation:
          "Cannot be higher than amount of capital available ($" +
          capitalMaximumBid.toFixed(4) +
          "), and must be positive!",
        hideLabel: true,
      },
    ],
    [
      {
        fieldNames: ["total_bid_price_range"],
        fieldTitle: "Outer Bid Bound Price:",
        fieldType: FieldType.Output,
        prefix: "$",
        output: totalBidPriceInUSD,
        gap: true,
      },
      {
        fieldNames: ["total_bid_price_range"],
        fieldTitle: "Outer Bid Bound %",
        fieldType: FieldType.Input,
        suffix: "%",
        validation: "Must be higher than Lower Best Range / Best Bid, and must be positive!",
        hideLabel: true,
      },
      {
        fieldNames: ["total_bid_order_depth"],
        fieldTitle: "Total Bid Order Depth",
        fieldType: FieldType.Input,
        prefix: "$",
        validation:
          "Cannot be higher than amount of capital available ($" +
          capitalMaximumBid.toFixed(4) +
          "), and must be positive!",
        hideLabel: true,
      },
    ],
  ];
  const AskFieldGroups2: Field[][] = [
    [
      {
        fieldNames: ["tilt_asks"],
        fieldTitle: "Order Tilt (Asks)",
        fieldType: FieldType.Input,
        validation: "Must enter a value from -5 to 5!",
        hideLabel: true,
      },
      {
        fieldNames: ["min_ask_order_usd_value"],
        fieldTitle: "Minimum Ask Order Size (USD)",
        fieldType: FieldType.Input,
        prefix: "$",
        validation: "Cannot be higher than Maximum Ask Order!",
        hideLabel: true,
      },
      {
        fieldNames: ["max_ask_order_usd_value"],
        fieldTitle: "Maximum Ask Order Size (USD)",
        fieldType: FieldType.Input,
        prefix: "$",
        validation: "Cannot be lower than Minimum Ask Order!",
        hideLabel: true,
      },
      {
        fieldNames: ["best_ask_random_walk"],
        fieldTitle: "Random Walk (Best Ask)",
        fieldType: FieldType.Select,
        hideLabel: true,
      },
      {
        fieldNames: ["total_ask_random_walk"],
        fieldTitle: "Random Walk (Total Ask)",
        fieldType: FieldType.Select,
        hideLabel: true,
      },
    ],
  ];
  const BidFieldGroups2: Field[][] = [
    [
      {
        fieldNames: ["tilt_bids"],
        fieldTitle: "Order Tilt (Bids)",
        fieldType: FieldType.Input,
        validation: "Must enter a value from -5 to 5!",
        hideLabel: true,
      },
      {
        fieldNames: ["min_bid_order_usd_value"],
        fieldTitle: "Minimum Bid Order Size (USD)",
        fieldType: FieldType.Input,
        prefix: "$",
        validation: "Cannot be higher than Maximum Bid Order!",
        hideLabel: true,
      },
      {
        fieldNames: ["max_bid_order_usd_value"],
        fieldTitle: "Maximum Bid Order Size (USD)",
        fieldType: FieldType.Input,
        prefix: "$",
        validation: "Cannot be lower than Minimum Bid Order!",
        hideLabel: true,
      },
      {
        fieldNames: ["best_bid_random_walk"],
        fieldTitle: "Random Walk (Best Bid)",
        fieldType: FieldType.Select,
        hideLabel: true,
      },
      {
        fieldNames: ["total_bid_random_walk"],
        fieldTitle: "Random Walk (Total Ask)",
        fieldType: FieldType.Select,
        hideLabel: true,
      },
    ],
  ];
  const SpreadFieldGroups1: Field[][] = [
    [
      {
        fieldNames: ["spread"],
        fieldTitle: "Price Gap",
        fieldType: FieldType.Input,
        suffix: "%",
        hideLabel: true,
        gap: true,
        extended: true,
      },
    ],
  ];
  const SpreadFieldGroups2: Field[][] = [
    [
      {
        fieldNames: ["spread"],
        fieldTitle:
          "Upper Price (" + ((configEdit.spread ? configEdit.spread : config.spread) / 2) * 100 + "% above Spot)",
        fieldType: FieldType.Output,
        prefix: "$",
        output: spreadUpperPrice,
        gap: true,
        extended: true,
      },
    ],
    [
      {
        fieldNames: ["spread"],
        fieldTitle: "Spot Price",
        fieldType: FieldType.Output,
        prefix: "$",
        output: orderBookSpotPrice,
        gap: true,
        extended: true,
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
        gap: true,
        extended: true,
      },
    ],
  ];

  useEffect(() => {
    //set initial variable and react to spot price change / actual config changes
    if (configsLoaded) {
      //update variables if spot price or config (but not config edit) changes
      setTotalAskPriceInUSD(orderBookSpotPrice * (1 + config.total_ask_price_range));
      setTotalBidPriceInUSD(orderBookSpotPrice * (1 - config.total_bid_price_range));
      setBestAskPriceInUSD(orderBookSpotPrice * (1 + config.best_ask_price_range));
      setBestBidPriceInUSD(orderBookSpotPrice * (1 - config.best_bid_price_range));
      setSpreadUpperPrice(orderBookSpotPrice * (1 + config.spread / 2));
      setSpreadLowerPrice(orderBookSpotPrice * (1 - config.spread / 2));
    }
  }, [orderBookSpotPrice, configsLoaded, config]);

  useEffect(() => {
    if (configsLoaded) {
      //reactive variables on edit
      setTotalAskPriceInUSD(orderBookSpotPrice * (1 + configEdit.total_ask_price_range));
      setTotalBidPriceInUSD(orderBookSpotPrice * (1 - configEdit.total_bid_price_range));
      setBestAskPriceInUSD(orderBookSpotPrice * (1 + configEdit.best_ask_price_range));
      setBestBidPriceInUSD(orderBookSpotPrice * (1 - configEdit.best_bid_price_range));
      setSpreadUpperPrice(orderBookSpotPrice * (1 + configEdit.spread / 2));
      setSpreadLowerPrice(orderBookSpotPrice * (1 - configEdit.spread / 2));
    }
  }, [orderBookSpotPrice, configsLoaded, config, configEdit]);

  useEffect(() => {
    websocket.send(
      JSON.stringify({
        action: "GET_CONFIG",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        project: projectName,
        account: algoAccounts[0],
      })
    );
    websocket.send(
      JSON.stringify({
        action: "GET_TEMPLATES",
        request_id: Date.now(),
        // project: projectName,
      })
    );
  }, [websocket, projectName, algoAccounts]);

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
          break;
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
        project: projectName,
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
        project: projectName,
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
        project: projectName,
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
    <div
      key={i}
      className={
        "field " +
        (f.gap ? "gap" : "col") +
        (f.extended ? " extended" : "") +
        (f.fieldNames.some((fn) => !compare[fn]) ? " highlighted" : "")
      }
    >
      {!f.hideLabel && <span>{f.fieldTitle}</span>}
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
      <OrderBookShape
        configEdit={configEdit}
        totalAskPriceInUSD={totalAskPriceInUSD}
        totalBidPriceInUSD={totalBidPriceInUSD}
        bestAskPriceInUSD={bestAskPriceInUSD}
        bestBidPriceInUSD={bestBidPriceInUSD}
        orderBookSpotPrice={orderBookSpotPrice}
      />
      <div className="order-book-depth">
        <h1>Order Book Depth</h1>
        <div className="headers ask">
          <div className="header">Offer Bounds</div>
          <div className="header"></div>
          <div className="header">% Above Spot</div>
          <div className="header">Total Offers Depth (USD)</div>
        </div>
        {AskFieldGroups1.map((fg, i) => (
          <div className="field-group" key={"fg" + i}>
            {fg.map((f, j) => renderField(f, 3 + j))}
          </div>
        ))}
        <div className="headers bid">
          <div className="header">Bid Bounds</div>
          <div className="header"></div>
          <div className="header">% Below Spot</div>
          <div className="header">Total Bids Depth (USD)</div>
        </div>
        {BidFieldGroups1.map((fg, i) => (
          <div className="field-group" key={"fg" + i}>
            {fg.map((f, j) => renderField(f, 3 + j))}
          </div>
        ))}
        <h1>Tilt, Min/Max Order Sizes, Random Walk</h1>
        <div className="headers ask">
          <div className="header">Tilt - Total Offers Depth</div>
          <div className="header">Min Order Size (USD)/Slice</div>
          <div className="header">Max Order Size (USD)/Slice</div>
          <div className="header">Inner Bound Random Walk</div>
          <div className="header">Outer Bound Random Walk</div>
        </div>
        {AskFieldGroups2.map((fg, i) => (
          <div className="field-group" key={"fg" + i}>
            {fg.map((f, j) => renderField(f, 3 + j))}
          </div>
        ))}
        <div className="headers bid">
          <div className="header">Tilt - Total Bids Depth</div>
          <div className="header">Min Order Size (USD)/Slice</div>
          <div className="header">Max Order Size (USD)/Slice</div>
          <div className="header">Inner Bound Random Walk</div>
          <div className="header">Outer Bound Random Walk</div>
        </div>
        {BidFieldGroups2.map((fg, i) => (
          <div className="field-group" key={"fg" + i}>
            {fg.map((f, j) => renderField(f, 3 + j))}
          </div>
        ))}
        <h1>Spread</h1>
        <div className="headers spread">
          <div className="header">Spread</div>
          <div className="header text-align-right">(Price Gap Allowance)</div>
        </div>
        {SpreadFieldGroups1.map((fg, i) => (
          <div className="field-group spread" key={"fg" + i}>
            {fg.map((f, j) => renderField(f, 3 + j))}
          </div>
        ))}
        <div className="headers spread">
          <div className="header"></div>
          <div className="header text-align-right">Reference Price</div>
        </div>
        {SpreadFieldGroups2.map((fg, i) => (
          <div className="field-group spread" key={"fg" + i}>
            {fg.map((f, j) => renderField(f, 3 + j))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlgoControl;
