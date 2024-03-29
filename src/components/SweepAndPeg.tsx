import { useEffect, useState } from "react";
import { AccountUpdate } from "../App";

type Props = {
  websocket: WebSocket;
  accountUpdate: AccountUpdate[];
  projectName: string;
  config: any;
};

enum Side {
  Buy = "BUY",
  Sell = "SELL",
}

type SweepAndPegCall = {
  action: string;
  project: string;
  request_id: number;
  side: Side; //BUY or SELL
  account: string;
  add_from_px?: number;
  add_to_px?: number;
  add_num_of_orders?: number;
  peg_amt?: number;
  target_px?: number;
  add_usd?: number;
};

const SweepAndPeg = (props: Props) => {
  const { websocket, accountUpdate, projectName, config } = props;

  // const [selected, setSelected] = useState<Tab>(0);
  const [pegAdditionalOrders, setPegAdditionalOrders] = useState<boolean>(false);

  const [targetPrice, setTargetPrice] = useState<number>();
  const [addUSD, setAddUSD] = useState<number>();
  const [SPAccount, setSPAccount] = useState<string>(accountUpdate[0].account);

  const [addFromPrice, setAddFromPrice] = useState<number>();
  const [addToPrice, setAddToPrice] = useState<number>();
  const [addNumberOrders, setAddNumberOrders] = useState<number>();
  const [pegAmount, setPegAmount] = useState<number>();

  const [validations, setValidations] = useState<any>({});

  useEffect(() => {
    let validations: any = {};
    validations.targetPrice = !(
      (pegAdditionalOrders
        ? targetPrice !== undefined && targetPrice !== 0
          ? targetPrice <= 0
          : false //A
        : targetPrice !== undefined
        ? targetPrice <= 0
        : true) //B
    );
    // validations.targetPrice = !(targetPrice !== undefined ? targetPrice <= 0 : pegAdditionalOrders ? false : true);
    validations.addUSD = !(
      (pegAdditionalOrders
        ? addUSD !== undefined && targetPrice !== 0
          ? addUSD <= 0
          : false //A
        : addUSD !== undefined
        ? addUSD <= 0
        : true) //B
    );
    // validations.addUSD = !(addUSD !== undefined ? addUSD <= 0 : pegAdditionalOrders ? false : true);
    validations.addFromPrice = !(!pegAdditionalOrders
      ? false
      : addFromPrice === undefined || (addFromPrice !== undefined && addFromPrice <= 0));
    validations.addToPrice = !(!pegAdditionalOrders
      ? false
      : addToPrice === undefined || (addToPrice !== undefined && addToPrice <= 0));
    validations.addNumberOrders = !(!pegAdditionalOrders
      ? false
      : addNumberOrders !== undefined && addNumberOrders <= 0);
    validations.pegAmount = !(!pegAdditionalOrders ? false : pegAmount !== undefined && pegAmount <= 0);
    setValidations(validations);
  }, [targetPrice, addUSD, addFromPrice, addToPrice, addNumberOrders, pegAmount, pegAdditionalOrders]);

  const handleSweepAndPeg = (side: Side) => {
    if (pegAdditionalOrders && (!addFromPrice || !addToPrice || !addNumberOrders || !pegAmount)) return;
    let payload: SweepAndPegCall = {
      action: "SWEEP_AND_PEG",
      project: projectName,
      side: side,
      request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
      account: SPAccount,
    };
    if (targetPrice) {
      payload.target_px = targetPrice;
    }
    if (addUSD) {
      payload.add_usd = addUSD;
    }
    if (addFromPrice) {
      payload.add_from_px = addFromPrice;
    }
    if (addToPrice) {
      payload.add_to_px = addToPrice;
    }
    if (addNumberOrders) {
      payload.add_num_of_orders = addNumberOrders;
    }
    if (pegAmount) {
      payload.peg_amt = pegAmount;
    }
    websocket.send(JSON.stringify(payload));
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

  const selectDynamicLogic = (logic: string) => {
    websocket.send(
      JSON.stringify({
        action: "SELECT_DYNAMIC_LOGIC",
        project: projectName,
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        command: logic,
      })
    );
  };

  const common = [];
  const logic1 = [];
  const logic2 = [];

  for (const prop in config) {
    if (prop.slice(0, 8) === "logic_1_") {
      logic1.push([prop, config[prop]]);
    } else if (prop.slice(0, 8) === "logic_2_") {
      logic2.push([prop, config[prop]]);
    } else {
      common.push([prop, config[prop]]);
    }
  }

  return (
    <div className="sweep-and-peg">
      <h2>Sweep and Peg</h2>
      <div className="info">
        <div className="inforow">
          <span className="account">Account</span>
          <span className="coin">Coin</span>
          <span>Free</span>
          <span>Locked</span>
          <span>Total</span>
        </div>
        {accountUpdate.map((a, i) => (
          <div className="inforow" key={i}>
            <span className="account">{a.account}</span>
            <span className="coin">{a.coin}</span>
            <span>{Number(a.free).toFixed(4)}</span>
            <span>{Number(a.locked).toFixed(4)}</span>
            <span>{Number(a.total).toFixed(4)}</span>
          </div>
        ))}
      </div>
      <div className="field col">
        <b>Account</b>
        <select onChange={(e) => setSPAccount(e.target.value)} defaultValue={accountUpdate[0].account}>
          {accountUpdate.map(
            (a, i) =>
              a.coin === "USDT" && (
                <option key={i} value={a.account}>
                  {a.account}
                </option>
              )
          )}
        </select>
      </div>
      <div className="field col">
        <b>Target Limit Price {pegAdditionalOrders && "(Optional)"}</b>
        <input type="number" onChange={(e) => setTargetPrice(Number(e.target.value))} />
        {!validations.targetPrice && <span className="validation">Must enter positive or non-zero value!</span>}
      </div>
      <div className="field col">
        <b>Sweep Amount in USD {pegAdditionalOrders && "(Optional)"}</b>
        <input type="number" onChange={(e) => setAddUSD(Number(e.target.value))} />
        {!validations.addUSD && <span className="validation">Must enter positive or non-zero value!</span>}
      </div>
      {/* <div className="field">
        <b>Aggressiveness / Timing</b>
        <select>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div> */}
      <div className="field gap">
        <b>Peg Additional Orders</b>
        <input
          type="checkbox"
          checked={pegAdditionalOrders}
          onChange={() => setPegAdditionalOrders(!pegAdditionalOrders)}
        />
      </div>
      {pegAdditionalOrders ? (
        <div className="peg-fields">
          <b>Peg Price Range</b>
          <div className="field gap">
            <span>From</span>
            <input className="grow" type="number" onChange={(e) => setAddFromPrice(Number(e.target.value))} />

            <span>To</span>
            <input className="grow" type="number" onChange={(e) => setAddToPrice(Number(e.target.value))} />
          </div>
          {(!validations.addFromPrice || !validations.addToPrice) && (
            <span className="validation">Both values must be positive and non-zero!</span>
          )}
          <div className="field col">
            <b>Number Of Peg Orders</b>
            <input type="number" onChange={(e) => setAddNumberOrders(Number(e.target.value))} />
            {!validations.addNumberOrders && <span className="validation">Must enter positive or non-zero value!</span>}
          </div>
          <div className="field col">
            <b>Total Peg Amount in QTY</b>
            <input type="number" onChange={(e) => setPegAmount(Number(e.target.value))} />
            {!validations.pegAmount && <span className="validation">Must enter positive or non-zero value!</span>}
          </div>
        </div>
      ) : null}
      <button className="buy" disabled={!checkValidations()} onClick={() => handleSweepAndPeg(Side.Buy)}>
        BUY
      </button>
      <button className="sell" disabled={!checkValidations()} onClick={() => handleSweepAndPeg(Side.Sell)}>
        SELL
      </button>
      <div className="field col" style={{ marginTop: 69 }}>
        <b>Dynamic Logic</b>
        <b>Current Values:</b>
        {/* <button onClick={() => selectDynamicLogic("common")}>Set to Common</button> */}
        {common.map((l) => (
          <span>{l[0] + " : " + l[1]}</span>
        ))}
        <button onClick={() => selectDynamicLogic("logic_1")}>Set to Logic 1</button>
        {logic1.map((l) => (
          <span>{l[0] + " : " + l[1]}</span>
        ))}
        <button onClick={() => selectDynamicLogic("logic_2")}>Set to Logic 2</button>
        {logic2.map((l) => (
          <span>{l[0] + " : " + l[1]}</span>
        ))}
      </div>
    </div>
  );
};

export default SweepAndPeg;
