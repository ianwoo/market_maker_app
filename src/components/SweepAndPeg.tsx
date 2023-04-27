import { useEffect, useState } from "react";

type Props = {
  websocket: WebSocket;
};

// enum Tab {
//   Buy = 0,
//   Sell = 1,
// }

const SweepAndPeg = (props: Props) => {
  const { websocket } = props;

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
    validations.addFromPrice = !(addFromPrice !== undefined && addFromPrice <= 0);
    validations.addToPrice = !(addToPrice !== undefined && addToPrice <= 0);
    validations.addNumberOrders = !(addNumberOrders !== undefined && addNumberOrders <= 0);
    validations.pegAmount = !(pegAmount !== undefined && pegAmount <= 0);
    setValidations(validations);
  }, [targetPrice, addUSD, addFromPrice, addToPrice, addNumberOrders, pegAmount]);

  const handleSweepAndPeg = () => {
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
      {/* <div className="tabs">
        <div className={"tab" + (selected === Tab.Buy ? " selected" : "")} onClick={() => setSelected(Tab.Buy)}>
          Buy
        </div>
        <div className={"tab" + (selected === Tab.Sell ? " selected" : "")} onClick={() => setSelected(Tab.Sell)}>
          Sell
        </div>
      </div> */}
      <div className="field col">
        <b>Limit Price (Target)</b>
        <input type="number" onChange={(e) => setTargetPrice(Number(e.target.value))} />
        {!validations.targetPrice && <span className="validation">Must enter positive or non-zero value!</span>}
      </div>
      <div className="field col">
        <b>Amount in USD</b>
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
          <b>Price Range</b>
          <div className="field gap">
            <span>From</span>
            <input className="grow" type="number" onChange={(e) => setAddFromPrice(Number(e.target.value))} />
            {!validations.addFromPrice && <span className="validation">Must enter positive or non-zero value!</span>}
            <span>To</span>
            <input className="grow" type="number" onChange={(e) => setAddToPrice(Number(e.target.value))} />
            {!validations.addToPrice && <span className="validation">Must enter positive or non-zero value!</span>}
          </div>
          <div className="field col">
            <b>Add Number of Orders</b>
            <input type="number" onChange={(e) => setAddNumberOrders(Number(e.target.value))} />
            {!validations.addNumberOrders && <span className="validation">Must enter positive or non-zero value!</span>}
          </div>
          <div className="field col">
            <b>Peg Amount</b>
            <input type="number" onChange={(e) => setPegAmount(Number(e.target.value))} />
            {!validations.sweepAmount && <span className="validation">Must enter positive or non-zero value!</span>}
          </div>
        </div>
      ) : null}
      <button disabled={!checkValidations()} onClick={handleSweepAndPeg}>
        Execute
      </button>
    </div>
  );
};

export default SweepAndPeg;
