import { useState } from "react";
import { OrderBookUpdate } from "../App";

type Props = {
  orderBookUpdate: OrderBookUpdate[];
  spotPrice: number;
};

enum OrderType {
  Ask = 0,
  Bid = 1,
}

type Group = {
  grouping: number;
  price: string;
  supply: number;
  dev: string;
};

enum ActiveGrouping {
  None = -1,
  Percent = 0,
  Price = 1,
}

const countDecimals = function (value: number) {
  if (Math.floor(value) === value) return 0;
  return value.toString().split(".")[1].length || 0;
};

const Intervention = (props: Props) => {
  const { orderBookUpdate, spotPrice } = props;

  const [orderType, setOrderType] = useState<OrderType>(OrderType.Ask);
  const [orders, setOrders] = useState<[number, number][]>(orderBookUpdate[0].ask);

  const [priceRangeInc, setPriceRangeInc] = useState<number>(0);
  const [aboveOfferRangeInc, setAboveOfferRangeInc] = useState<number>(0);

  const [activeGrouping, setActiveGrouping] = useState<ActiveGrouping>(-1);

  return (
    <div className="intervention">
      <h1>Intervention</h1>
      <div className="flex">
        <div className="order-book">
          <button className="stop-algo">Stop Volume Algo</button>
          <div className="spot-price field col">
            <b>Spot Price</b>
            <b>{spotPrice}</b>
          </div>
          <div className="tabs">
            <div
              className={"tab" + (orderType === OrderType.Ask ? " selected" : "")}
              onClick={() => {
                setOrderType(OrderType.Ask);
                setOrders(orderBookUpdate[0].ask);
              }}
            >
              Asks
            </div>
            <div
              className={"tab" + (orderType === OrderType.Bid ? " selected" : "")}
              onClick={() => {
                setOrderType(OrderType.Bid);
                setOrders(orderBookUpdate[0].bid);
              }}
            >
              Bids
            </div>
          </div>
          <div className="range-controls">
            <div className={"field col deviation" + (activeGrouping === ActiveGrouping.Percent ? " active" : "")}>
              <span>% Above Offer Range Increment</span>
              <input
                type="number"
                onChange={(e) => {
                  setPriceRangeInc(0);
                  Number(e.target.value) > 0 ? setAboveOfferRangeInc(Number(e.target.value)) : setAboveOfferRangeInc(0);
                  setActiveGrouping(ActiveGrouping.Percent);
                }}
              />
            </div>
            <div className={"field col price" + (activeGrouping === ActiveGrouping.Price ? " active" : "")}>
              <span>$ Price Range Increment</span>
              <input
                type="number"
                onChange={(e) => {
                  setAboveOfferRangeInc(0);
                  Number(e.target.value) > 0 ? setPriceRangeInc(Number(e.target.value)) : setPriceRangeInc(0);
                  setActiveGrouping(ActiveGrouping.Price);
                }}
              />
            </div>
            <button className="supply">Cancel Orders</button>
          </div>
          <div className="headers">
            <div className="header deviation">% Above Offer</div>
            <div className="header price">Price</div>
            <div className="header supply">Supply</div>
          </div>
          {aboveOfferRangeInc === 0 && priceRangeInc === 0
            ? orders.map((o, i) => (
                <div className={"order " + (orderType ? "bid" : "ask")} key={i}>
                  <div className="deviation">{Math.floor((o[0] / spotPrice) * 100 - 100)}%</div>
                  <div className="price">{o[0]}</div>
                  <div className="supply">{o[1]}</div>
                </div>
              ))
            : orders
                .reduce((acc: Group[], next: [number, number]) => {
                  //                   tuple: [price, supply]
                  const _decimals = countDecimals(spotPrice);

                  const _grouping = Math.floor((next[0] - spotPrice) / priceRangeInc);
                  const _percentGrouping = Math.floor(
                    Math.floor((next[0] / spotPrice) * 100 - 100) / aboveOfferRangeInc
                  );

                  const _existingGroup =
                    aboveOfferRangeInc === 0
                      ? acc.find((group) => group.grouping === _grouping)
                      : acc.find((group) => group.grouping === _percentGrouping);

                  const _groupingPrice =
                    (spotPrice + _grouping * priceRangeInc).toFixed(_decimals).toString() +
                    " - " +
                    (spotPrice + (_grouping + 1) * priceRangeInc).toFixed(_decimals).toString();

                  const _percentGroupingPrice =
                    (((_percentGrouping * aboveOfferRangeInc) / 100 + 1) * spotPrice).toFixed(_decimals).toString() +
                    " - " +
                    ((((_percentGrouping + 1) * aboveOfferRangeInc) / 100 + 1) * spotPrice)
                      .toFixed(_decimals)
                      .toString();

                  const _deviation =
                    Math.floor(((next[0] - priceRangeInc) / spotPrice) * 100 - 100).toString() +
                    "% - " +
                    Math.floor((next[0] / spotPrice) * 100 - 100).toString() +
                    "%";

                  const _percentDeviation =
                    (_percentGrouping * aboveOfferRangeInc).toString() +
                    "% - " +
                    ((_percentGrouping + 1) * aboveOfferRangeInc).toString() +
                    "%";

                  _existingGroup
                    ? (_existingGroup.supply = _existingGroup.supply + next[1])
                    : acc.push({
                        grouping: aboveOfferRangeInc === 0 ? _grouping : _percentGrouping,
                        supply: next[1],
                        price: aboveOfferRangeInc === 0 ? _groupingPrice : _percentGroupingPrice,
                        dev: aboveOfferRangeInc === 0 ? _deviation : _percentDeviation,
                      });
                  return acc;
                }, [])
                .map((g, i) => (
                  <div className={"order " + (orderType ? "bid" : "ask")} key={i}>
                    <div className="deviation">{g.dev}</div>
                    <div className="price">{g.price}</div>
                    <div className="supply">{g.supply}</div>
                  </div>
                ))}
        </div>
        <div className="sweep-and-peg">
          <h2>Sweep and Peg</h2>
          <div className="tabs">
            <div className="tab selected">Buy</div>
            <div className="tab">Sell</div>
          </div>
          <div className="field">
            <b>Limit Price (Target)</b>
            <input />
          </div>
          <div className="field">
            <b>Amount</b>
            <div className="field col">
              <input />
              <select>
                <option>USD</option>
                <option>QTY</option>
              </select>
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
            <input type="checkbox" />
          </div>
          <b>Price Range</b>
          <div className="field">
            <span>From</span>
            <input />
            <span>To</span>
            <input />
          </div>
          <div className="field">
            <b>Amount</b>
            <div className="field col">
              <input />
              <select>
                <option>USD</option>
                <option>QTY</option>
              </select>
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
        </div>
      </div>
    </div>
  );
};

export default Intervention;
