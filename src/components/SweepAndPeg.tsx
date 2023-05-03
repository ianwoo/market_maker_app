import { useEffect, useState } from "react";
import { AccountUpdate } from "../App";

type Props = {
  websocket: WebSocket;
  accountUpdate: AccountUpdate[];
};

enum Side {
  Buy = "BUY",
  Sell = "SELL",
}

type SweepAndPegCall = {
  action: string;
  request_id: number;
  side: Side; //BUY or SELL
  add_from_px: number;
  add_to_px: number;
  add_num_of_orders: number;
  peg_amt: number;
  target_px?: number;
  add_usd?: number;
};

const SweepAndPeg = (props: Props) => {
  const { websocket, accountUpdate } = props;

  // const [selected, setSelected] = useState<Tab>(0);
  const [pegAdditionalOrders, setPegAdditionalOrders] = useState<boolean>(false);

  const [targetPrice, setTargetPrice] = useState<number>();
  const [addUSD, setAddUSD] = useState<number>();

  const [addFromPrice, setAddFromPrice] = useState<number>();
  const [addToPrice, setAddToPrice] = useState<number>();
  const [addNumberOrders, setAddNumberOrders] = useState<number>();
  const [pegAmount, setPegAmount] = useState<number>();

  const [validations, setValidations] = useState<any>({});

  useEffect(() => {
    let validations: any = {};
    validations.targetPrice = !(targetPrice !== undefined && targetPrice <= 0);
    validations.addUSD = !(addUSD !== undefined && addUSD <= 0);
    validations.addFromPrice = !(
      addFromPrice === undefined ||
      (addFromPrice !== undefined && addFromPrice <= 0) ||
      (addFromPrice !== undefined && addToPrice !== undefined && addFromPrice > addToPrice)
    );
    validations.addToPrice = !(
      addToPrice === undefined ||
      (addToPrice !== undefined && addToPrice <= 0) ||
      (addFromPrice !== undefined && addToPrice !== undefined && addFromPrice > addToPrice)
    );
    validations.addNumberOrders = !(addNumberOrders !== undefined && addNumberOrders <= 0);
    validations.pegAmount = !(pegAmount !== undefined && pegAmount <= 0);
    setValidations(validations);
  }, [targetPrice, addUSD, addFromPrice, addToPrice, addNumberOrders, pegAmount]);

  const handleSweepAndPeg = (side: Side) => {
    if (!addFromPrice || !addToPrice || !addNumberOrders || !pegAmount) return;
    let payload: SweepAndPegCall = {
      action: "SWEEP_AND_PEG",
      side: side,
      request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
      add_from_px: addFromPrice,
      add_to_px: addToPrice,
      add_num_of_orders: addNumberOrders,
      peg_amt: pegAmount,
    };
    if (targetPrice) {
      payload.target_px = targetPrice;
    }
    if (addUSD) {
      payload.add_usd = addUSD;
    }
    websocket.send(
      JSON.stringify({
        action: "SWEEP_AND_PEG",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        target_px: targetPrice,
        add_usd: addUSD,
        add_from_px: addFromPrice,
        add_to_px: addToPrice,
        add_num_of_orders: addNumberOrders,
        peg_amt: pegAmount,
      })
    );
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

  return (
    <div className="sweep-and-peg">
      <h2>Sweep and Peg</h2>
      <p>
        Currently using <b>bybit_dev_mm1</b>
      </p>
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
        <b>Target Limit Price (Optional)</b>
        <input type="number" onChange={(e) => setTargetPrice(Number(e.target.value))} />
        {!validations.targetPrice && <span className="validation">Must enter positive or non-zero value!</span>}
      </div>
      <div className="field col">
        <b>Sweep Amount in USD (Optional)</b>
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
            <span className="validation">
              From price must be lower than To price, and both must be positive and non-zero!
            </span>
          )}
          <div className="field col">
            <b>Number Of Peg Orders</b>
            <input type="number" onChange={(e) => setAddNumberOrders(Number(e.target.value))} />
            {!validations.addNumberOrders && <span className="validation">Must enter positive or non-zero value!</span>}
          </div>
          <div className="field col">
            <b>Peg Amount in USD</b>
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
    </div>
  );
};

export default SweepAndPeg;
