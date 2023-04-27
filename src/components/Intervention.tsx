import { useState } from "react";
import { OrderBookUpdate } from "../App";
import SweepAndPeg from "./SweepAndPeg";

type Props = {
  orderBookUpdate: OrderBookUpdate[];
  spotPrice: number;
  websocket: WebSocket;
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

type PriceRange = {
  from: number;
  to: number;
  supply: number;
  request_id?: number;
};

const countDecimals = function (value: number) {
  if (Math.floor(value) === value) return 0;
  return value.toString().split(".")[1].length || 0;
};

const Intervention = (props: Props) => {
  const { orderBookUpdate, spotPrice, websocket } = props;

  const [orderType, setOrderType] = useState<OrderType>(OrderType.Ask);
  const [orderBookIdx, setOrderBookIdx] = useState<number>(0);
  const [orders, setOrders] = useState<[number, number][]>(orderBookUpdate[0].ask);

  const [priceRangeInc, setPriceRangeInc] = useState<number>(0);
  const [aboveOfferRangeInc, setAboveOfferRangeInc] = useState<number>(0);

  const [activeGrouping, setActiveGrouping] = useState<ActiveGrouping>(-1);

  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>([]);
  const [highlightedGroups, setHighlightedGroups] = useState<number[]>([]);

  const [cancellingPriceRanges, setCancellingPriceRanges] = useState<PriceRange[]>([]);

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    setCancellingPriceRanges(cancellingPriceRanges.filter((pr) => pr.request_id === message.request_id));
  };

  const cancelOrders = () => {
    console.log(selectedPriceRanges);
    selectedPriceRanges.forEach((pr, i) => {
      const id = Date.now();
      setCancellingPriceRanges([...cancellingPriceRanges, { ...pr, request_id: id }]);
      websocket.send(
        JSON.stringify({
          action: "CANCEL_ORDERS",
          request_id: id, //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
          from_px: pr.from,
          to_px: pr.to,
        })
      );
    });
    //to do: create state for handling confirmation of order cancellation
    //basically just match request_id and then show feedback of order cancellations still processing
  };

  return (
    <div className="intervention">
      <h1>Intervention</h1>
      <div className="flex">
        <div className="order-book">
          <div className="spot-price field col">
            <b>Spot Price</b>
            <b>{spotPrice}</b>
          </div>
          <div className="tabs">
            {orderBookUpdate.map((obu, i) => [
              <div
                key={"obu" + i + 0}
                className={"tab" + (orderType === OrderType.Ask && orderBookIdx === i ? " selected" : "")}
                onClick={() => {
                  setSelectedPriceRanges([]);
                  setHighlightedGroups([]);
                  setOrderType(OrderType.Ask);
                  setOrderBookIdx(i);
                  setOrders(obu.ask);
                }}
              >
                {obu.obtype === "total" ? obu.exchange + " Total" : obu.account} Asks
              </div>,
              <div
                key={"obu" + i + 1}
                className={"tab" + (orderType === OrderType.Bid && orderBookIdx === i ? " selected" : "")}
                onClick={() => {
                  setSelectedPriceRanges([]);
                  setHighlightedGroups([]);
                  setOrderType(OrderType.Bid);
                  setOrderBookIdx(i);
                  setOrders(obu.bid);
                }}
              >
                {obu.obtype === "total" ? obu.exchange + " Total" : obu.account} Bids
              </div>,
            ])}
          </div>
          <div className="range-controls">
            <div className={"field col deviation" + (activeGrouping === ActiveGrouping.Percent ? " active" : "")}>
              <span>% Above Offer Range Increment</span>
              <input
                type="number"
                onChange={(e) => {
                  setSelectedPriceRanges([]);
                  setHighlightedGroups([]);
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
                  setSelectedPriceRanges([]);
                  setHighlightedGroups([]);
                  setAboveOfferRangeInc(0);
                  Number(e.target.value) > 0 ? setPriceRangeInc(Number(e.target.value)) : setPriceRangeInc(0);
                  setActiveGrouping(ActiveGrouping.Price);
                }}
              />
            </div>
            <div className="field col">
              {orderBookIdx !== 0 ? (
                <button
                  className="supply cancel-btn"
                  onClick={cancelOrders}
                  disabled={selectedPriceRanges.length === 0}
                >
                  Cancel Orders
                </button>
              ) : (
                <div className="supply">Cannot Cancel External Orders</div>
              )}
              {cancellingPriceRanges.map((cpr, i) => (
                <div key={"cpr" + i} className="cancel">
                  Cancelling all orders {cpr.from} to {cpr.to}
                </div>
              ))}
            </div>
          </div>
          <div className="headers">
            <div className="header deviation col">
              <b>% Above Offer</b>
            </div>
            <div className="header price col">
              <b>Price</b>
            </div>
            <div className="header supply col">
              <span className="subheader">
                Total Supply: {orders.reduce((acc, next) => acc + next[1], 0).toFixed(4)}
              </span>
              {selectedPriceRanges.length > 0 ? (
                <b className="subheader">
                  Selected Supply: {selectedPriceRanges.reduce((acc, next) => acc + next.supply, 0).toFixed(4)}
                </b>
              ) : null}
              <b>Supply</b>
            </div>
          </div>
          {aboveOfferRangeInc === 0 && priceRangeInc === 0
            ? orders.map((o, i) => (
                <div
                  key={"o" + i}
                  className={
                    "order " + (orderType ? "bid" : "ask") + (highlightedGroups.includes(i) ? " selected" : "")
                  }
                  onClick={() => {
                    //if $ value price range increment...
                    if (!highlightedGroups.includes(i)) {
                      setSelectedPriceRanges([
                        ...selectedPriceRanges,
                        {
                          from: o[0],
                          to: o[0],
                          supply: o[1],
                        },
                      ]);
                      setHighlightedGroups([...highlightedGroups, i]);
                    } else if (highlightedGroups.includes(i)) {
                      const _priceRangesTargetRemoved = selectedPriceRanges.filter((r) => r.from !== o[0]);
                      setSelectedPriceRanges(_priceRangesTargetRemoved);
                      setHighlightedGroups(highlightedGroups.filter((hg) => hg !== i));
                    }
                  }}
                >
                  <div className="deviation">{Math.floor((o[0] / spotPrice) * 100 - 100)}%</div>
                  <div className="price">${o[0]}</div>
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
                    "$" +
                    (spotPrice + _grouping * priceRangeInc).toFixed(_decimals).toString() +
                    " - $" +
                    (spotPrice + (_grouping + 1) * priceRangeInc).toFixed(_decimals).toString();

                  const _percentGroupingPrice =
                    "$" +
                    (((_percentGrouping * aboveOfferRangeInc) / 100 + 1) * spotPrice).toFixed(_decimals).toString() +
                    " - $" +
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
                  <div
                    className={
                      "order " +
                      (orderType ? "bid" : "ask") +
                      (highlightedGroups.includes(g.grouping) ? " selected" : "")
                    }
                    key={i}
                    onClick={() => {
                      //if $ value price range increment...
                      if (aboveOfferRangeInc === 0 && !highlightedGroups.includes(g.grouping)) {
                        setSelectedPriceRanges([
                          ...selectedPriceRanges,
                          {
                            from: spotPrice + g.grouping * priceRangeInc,
                            to: spotPrice + (g.grouping + 1) * priceRangeInc,
                            supply: g.supply,
                          },
                        ]);
                        setHighlightedGroups([...highlightedGroups, g.grouping]);
                      } else if (priceRangeInc === 0 && !highlightedGroups.includes(g.grouping)) {
                        //if % value price range increment...
                        setSelectedPriceRanges([
                          ...selectedPriceRanges,
                          {
                            from: ((g.grouping * aboveOfferRangeInc) / 100 + 1) * spotPrice,
                            to: (((g.grouping + 1) * aboveOfferRangeInc) / 100 + 1) * spotPrice,
                            supply: g.supply,
                          },
                        ]);
                        setHighlightedGroups([...highlightedGroups, g.grouping]);
                      } else if (aboveOfferRangeInc === 0 && highlightedGroups.includes(g.grouping)) {
                        const _targetFromPrice = spotPrice + g.grouping * priceRangeInc;
                        const _priceRangesTargetRemoved = selectedPriceRanges.filter(
                          (r) => r.from !== _targetFromPrice
                        );
                        setSelectedPriceRanges(_priceRangesTargetRemoved);
                        setHighlightedGroups(highlightedGroups.filter((hg) => hg !== g.grouping));
                      } else if (priceRangeInc === 0 && highlightedGroups.includes(g.grouping)) {
                        const _targetFromPrice = ((g.grouping * aboveOfferRangeInc) / 100 + 1) * spotPrice;
                        const _priceRangesTargetRemoved = selectedPriceRanges.filter(
                          (r) => r.from !== _targetFromPrice
                        );
                        setSelectedPriceRanges(_priceRangesTargetRemoved);
                        setHighlightedGroups(highlightedGroups.filter((hg) => hg !== g.grouping));
                      }
                    }}
                  >
                    <div className="deviation">{g.dev}</div>
                    <div className="price">{g.price}</div>
                    <div className="supply">{g.supply}</div>
                  </div>
                ))}
        </div>
        <SweepAndPeg websocket={websocket} />
      </div>
    </div>
  );
};

export default Intervention;
