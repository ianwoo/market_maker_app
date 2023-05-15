import { useEffect, useState } from "react";
import AlgoControl from "./components/AlgoControl";
import HomePanel from "./components/HomePanel";
import Intervention from "./components/Intervention";
import "./global.scss";
import Login from "./components/Login";

export type AccountUpdate = {
  account: string;
  coin: string;
  exchange: string;
  total: string;
  free: string;
  locked: string;
  price: number;
};

export type OrderBookUpdate = {
  exchange?: string;
  obtype: string;
  account?: string;
  bid: [number, number][]; //tuple: [price, supply]
  ask: [number, number][]; //tuple: [price, supply]
  external_bid?: [number, number][]; //tuple: [price, supply]
  external_ask?: [number, number][]; //tuple: [price, supply]
};

export type PriceRange = {
  from: number;
  to: number;
  supply: number;
  request_id?: number;
};

export type Config = {
  mm_engine_status: boolean;
  self_trade_status: boolean;
  vol_trade_per_hour: number;
  min_trade: number;
  max_trade: number;
  random_walk_degree: string;
  spread: number;
  total_ask_price_range: number;
  total_ask_order_depth: number;
  total_ask_random_walk: string;
  best_ask_price_range: number;
  best_ask_order_depth: number;
  best_ask_random_walk: string;
  tilt_asks: number;
  tilt_bids: number;
  best_bid_price_range: number;
  best_bid_order_depth: number;
  best_bid_random_walk: string;
  total_bid_price_range: number;
  total_bid_order_depth: number;
  total_bid_random_walk: string;
};

export type Template = {
  template_name: string;
  update_params: Config;
};

const tabs = ["Home Panel", "Algos Control", "Intervention Control"];

const websocket = new WebSocket("ws://192.168.1.43:8055");

function App() {
  const [socketOpen, setSocketOpen] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const [selectedTabIdx, setSelectedTabIdx] = useState<number>(0);
  const [accountUpdate, setAccountUpdate] = useState<AccountUpdate[]>([]);
  const [orderBookUpdate, setOrderBookUpdate] = useState<OrderBookUpdate[]>([]);

  const [cancellingPriceRanges, setCancellingPriceRanges] = useState<PriceRange[]>([]);

  const [configsLoaded, setConfigsLoaded] = useState<boolean>(false);
  const [config, setConfig] = useState<any>({});
  const [configEdit, setConfigEdit] = useState<any>({});

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>();

  websocket.addEventListener("open", () => {
    setSocketOpen(true);
  });

  websocket.onmessage = (event) => {
    console.log("on message event happening in App");
    const message = JSON.parse(event.data);
    message.type === "ACCOUNT_UPDATE_REQ" && setAccountUpdate(JSON.parse(message.content));
    message.type === "ORDER_BOOK_UPDATE_REQ" && setOrderBookUpdate(JSON.parse(message.content));
    message.type === "ACCOUNT_UPDATE" && setAccountUpdate(JSON.parse(message.content));
    message.type === "ORDER_BOOK_UPDATE" && setOrderBookUpdate(JSON.parse(message.content));
    message.type === "CANCEL_ORDERS" &&
      setCancellingPriceRanges(cancellingPriceRanges.filter((pr) => pr.request_id === message.request_id));
    if (message.action === "2FA" && message.result) {
      console.log("success!");
      setLoggedIn(true);
      websocket.send(
        JSON.stringify({
          action: "ORDER_BOOK_UPDATE_REQ",
        })
      );
      websocket.send(
        JSON.stringify({
          action: "ACCOUNT_UPDATE_REQ",
        })
      );
    }
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
    if (message.action === "GET_TEMPLATES") {
      setTemplates(JSON.parse(message.result));
      setSelectedTemplate(
        JSON.parse(message.result)[0].template_name ? JSON.parse(message.result)[0].template_name : ""
      );
    }
  };

  useEffect(() => {
    console.log(orderBookUpdate);
  }, [orderBookUpdate]);

  return (
    <div className="App">
      <div className="tabs">
        {loggedIn &&
          tabs.map((tab, i) => (
            <div
              key={i}
              className={"tab" + (selectedTabIdx === i ? " selected" : "")}
              // conditions are to ensure websocket packages are received before switching component
              onClick={() => accountUpdate.length > 0 && orderBookUpdate.length > 0 && setSelectedTabIdx(i)}
            >
              <span>{tab}</span>
            </div>
          ))}
      </div>
      <div className="component">
        {!loggedIn && socketOpen && <Login websocket={websocket} />}
        {loggedIn &&
          [
            <HomePanel key="home" accountUpdate={accountUpdate} />,
            // note: taking upper price (first price above spot) and lower price (first price below spot) from EXTERNAL orderbook which is always index 0
            <AlgoControl
              key="control"
              websocket={websocket}
              orderBook={orderBookUpdate[1]} //this needs to change once we activate more than just one mm account
              accountUpdate={accountUpdate}
              configsLoaded={configsLoaded}
              config={config}
              configEdit={configEdit}
              setConfigEdit={setConfigEdit}
              templates={templates}
              selectedTemplate={selectedTemplate ? selectedTemplate : ""}
              setSelectedTemplate={setSelectedTemplate}
            />,
            <Intervention
              key="intervention"
              orderBookUpdate={orderBookUpdate}
              accountUpdate={accountUpdate}
              cancellingPriceRanges={cancellingPriceRanges}
              setCancellingPriceRanges={setCancellingPriceRanges}
              websocket={websocket}
            />,
          ][selectedTabIdx]}
      </div>
    </div>
  );
}

export default App;
