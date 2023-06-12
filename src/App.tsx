import { useMemo, useState } from "react";
import AlgoControl from "./components/AlgoControl";
import HomePanel from "./components/HomePanel";
import Intervention from "./components/Intervention";
import "./global.scss";
import Login from "./components/Login";
import AlertControl from "./components/AlertControl";

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
  receivedBackend?: boolean;
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

export type AlertCommonConfig = {
  alert_env: string; //ex. DEV
  observation_frequency: number;
  lookback_windows: number;
  enable_email_alert: boolean;
  enable_slack_alert: boolean;
  email_recipients: string[];
  slack_channels: string[];
  enable_postgresdb: boolean;
  postgres_table_list: string[];
  enable_google_sheet: boolean;
  google_sheets_map: any;
};

export type Alert = {
  alert_name: string; //ex. token_inflow_outflow
  alert_id: string; //ex. token_inflow_outflow_AGIX_DEV_1
  common_config: AlertCommonConfig;
  specific_config: any;
};

const tabs = ["Home Panel", "Algos Control", "Intervention Control", "Alert Control"];

const websocket = new WebSocket("ws://192.168.10.101:8055");

function App() {
  const [socketOpen, setSocketOpen] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const [projectName, setProjectName] = useState<string>("");
  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [algoAccounts, setAlgoAccounts] = useState<string[]>([]);
  const [manualAccounts, setManualAccounts] = useState<string[]>([]);

  const [selectedTabIdx, setSelectedTabIdx] = useState<number>(0);

  const [allAccountUpdates, setAllAccountUpdates] = useState<any>();
  const [allOrderBookUpdates, setAllOrderBookUpdates] = useState<any>();

  const [collapsed, setCollapsed] = useState<boolean>(false);

  const [cancellingPriceRanges, setCancellingPriceRanges] = useState<PriceRange[]>([]);

  const [configsLoaded, setConfigsLoaded] = useState<boolean>(false);
  const [config, setConfig] = useState<any>({});
  const [configEdit, setConfigEdit] = useState<any>({});

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>();

  const [alerts, setAlerts] = useState<Alert[]>([]);

  const orderBookSpotPrice = useMemo(
    () =>
      projectName !== ""
        ? allOrderBookUpdates[projectName].length > 0
          ? (allOrderBookUpdates[projectName][0].ask.sort(
              (a: [number, number], b: [number, number]) => a[0] - b[0]
            )[0][0] +
              allOrderBookUpdates[projectName][0].bid.sort(
                (a: [number, number], b: [number, number]) => b[0] - a[0]
              )[0][0]) /
            2
          : 0
        : 0,
    [allOrderBookUpdates, projectName]
  );

  websocket.addEventListener("open", () => {
    setSocketOpen(true);
  });

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    //type
    message.type === "ACCOUNT_UPDATE_REQ" && setAllAccountUpdates(JSON.parse(message.content));
    message.type === "ORDER_BOOK_UPDATE_REQ" && setAllOrderBookUpdates(JSON.parse(message.content));
    message.type === "ACCOUNT_UPDATE" && setAllAccountUpdates(JSON.parse(message.content));
    message.type === "ORDER_BOOK_UPDATE" && setAllOrderBookUpdates(JSON.parse(message.content));

    //action
    if (message.action === "CANCEL_ORDERS") {
      const priceRangesCopy = [...cancellingPriceRanges];
      priceRangesCopy.forEach((pr) => {
        if (pr.request_id === message.request_id) {
          pr.receivedBackend = true;
        }
      });
      setCancellingPriceRanges(priceRangesCopy);
    }
    if (message.action === "2FA" && message.result) {
      setAllProjects(message.projects);
      setProjectName(message.projects[0]);
      websocket.send(
        JSON.stringify({
          action: "GET_PROJECT_INFO",
          request_id: Date.now(),
          project: message.projects[0],
        })
      );
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
    if (message.action === "GET_PROJECT_INFO") {
      setAlgoAccounts(message.algo_account);
      setManualAccounts(message.manual_account);
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
    if (message.action === "GET_ALERTS") {
      console.log(message);
      setAlerts(JSON.parse(message.result));
    }
  };

  const components = useMemo(
    () =>
      projectName
        ? [
            <HomePanel
              key="home"
              accountUpdate={allAccountUpdates[projectName]}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              projectName={projectName}
              allProjects={allProjects}
            />,
            // note: taking upper price (first price above spot) and lower price (first price below spot) from EXTERNAL orderbook which is always index 0
            <AlgoControl
              key="control"
              websocket={websocket}
              projectName={projectName}
              algoAccounts={algoAccounts}
              orderBook={allOrderBookUpdates[projectName][1]} //this needs to change once we activate more than just one mm account
              orderBookSpotPrice={orderBookSpotPrice}
              accountUpdate={allAccountUpdates[projectName]}
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
              projectName={projectName}
              orderBookUpdate={allOrderBookUpdates[projectName]}
              accountUpdate={allAccountUpdates[projectName]}
              orderBookSpotPrice={orderBookSpotPrice}
              cancellingPriceRanges={cancellingPriceRanges}
              setCancellingPriceRanges={setCancellingPriceRanges}
              websocket={websocket}
            />,
            <AlertControl
              websocket={websocket}
              alerts={alerts}
              projectName={projectName}
              selectedAccount={algoAccounts[0]}
            />,
          ]
        : [],
    [
      allAccountUpdates,
      allOrderBookUpdates,
      allProjects,
      projectName,
      orderBookSpotPrice,
      collapsed,
      cancellingPriceRanges,
      configsLoaded,
      config,
      configEdit,
      templates,
      selectedTemplate,
      alerts,
      algoAccounts,
    ]
  );

  return (
    <div className="App">
      <div className="tabs">
        {loggedIn &&
          tabs.map((tab, i) => (
            <div
              key={i}
              className={"tab" + (selectedTabIdx === i ? " selected" : "")}
              // conditions are to ensure websocket packages are received before switching component
              onClick={() =>
                allAccountUpdates[projectName].length > 0 &&
                allOrderBookUpdates[projectName].length > 0 &&
                setSelectedTabIdx(i)
              }
            >
              <span>{tab}</span>
            </div>
          ))}
      </div>
      {selectedTabIdx !== 0 && (
        <div className={"project" + (collapsed ? " collapsed" : "")}>
          <div className="project-dropdown-wrapper">
            <select className="project-dropdown">
              {allProjects.map((p, i) => (
                <option key={i}>{p}</option>
              ))}
            </select>
            <select className="project-dropdown account">
              {algoAccounts.concat(manualAccounts).map((a, i) => (
                <option key={i}>{a}</option>
              ))}
            </select>
          </div>
          {collapsed && (
            <div className="collapse" onClick={() => setCollapsed(false)}>
              &#9660;
            </div>
          )}
          {!collapsed && (
            <div className="collapse" onClick={() => setCollapsed(true)}>
              &#9650;
            </div>
          )}
        </div>
      )}
      <div className="component">
        {!loggedIn && socketOpen && <Login websocket={websocket} />}
        {loggedIn && components[selectedTabIdx]}
      </div>
    </div>
  );
}

export default App;
