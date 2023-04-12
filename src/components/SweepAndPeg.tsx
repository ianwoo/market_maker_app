import { useState } from "react";

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
  const [sweepAmount, setSweepAmount] = useState<number>();

  const handleSweepAndPeg = () => {
    websocket.send(
      JSON.stringify({
        action: "CANCEL_ORDERS",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        target_px: targetPrice,
        add_usd: addUSD,
        add_from_px: addFromPrice,
        add_to_px: addToPrice,
        add_num_of_orders: addNumberOrders,
        sweep_amt: sweepAmount,
      })
    );
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
      <div className="field">
        <b>Limit Price (Target)</b>
        <input type="number" onChange={(e) => setTargetPrice(Number(e.target.value))} />
      </div>
      <div className="field">
        <b>Amount</b>
        <div className="field col">
          <input type="number" onChange={(e) => setAddUSD(Number(e.target.value))} />
          {/* TODO: change control from Add USD and Add Quantity once we figure out what field for Add Quantity
          
          <select>
            <option>USD</option>
            <option>QTY</option>
          </select> */}
        </div>
      </div>
      <div className="field">
        <b>Aggressiveness / Timing</b>
        <select>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
      <div className="field">
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
          <div className="field">
            <span>From</span>
            <input type="number" onChange={(e) => setAddFromPrice(Number(e.target.value))} />
            <span>To</span>
            <input type="number" onChange={(e) => setAddToPrice(Number(e.target.value))} />
          </div>
          <div className="field">
            <b>Add Number of Orders</b>
            <input type="number" onChange={(e) => setAddNumberOrders(Number(e.target.value))} />
          </div>
          <div className="field">
            <b>Sweep Amount</b>
            <input type="number" onChange={(e) => setSweepAmount(Number(e.target.value))} />
          </div>
        </div>
      ) : null}
      <button onClick={handleSweepAndPeg}>Execute</button>
    </div>
  );
};

export default SweepAndPeg;
