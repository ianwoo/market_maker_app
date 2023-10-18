import { useMemo, useState } from "react";
import { AccountUpdate, OrderBookUpdate, PriceRange } from "../App";
import SweepAndPeg from "./SweepAndPeg";
import OrderBookChart from "./OrderBookChart";

type Props = {
  projectName: string;
  orderBookUpdate: OrderBookUpdate[];
  accountUpdate: AccountUpdate[];
  orderBookSpotPrice: number;
  config: any;
  cancellingPriceRanges: PriceRange[];
  setCancellingPriceRanges: React.Dispatch<React.SetStateAction<PriceRange[]>>;
  websocket: WebSocket;
};

export enum OrderType {
  Ask = "ask",
  Bid = "bid",
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
  const {
    projectName,
    orderBookUpdate,
    accountUpdate,
    orderBookSpotPrice,
    config,
    cancellingPriceRanges,
    setCancellingPriceRanges,
    websocket,
  } = props;

  console.log(config);

  const [orderType, setOrderType] = useState<OrderType>(OrderType.Ask);
  const [orderBookIdx, setOrderBookIdx] = useState<number>(0);
  const [orders, setOrders] = useState<[number, number][]>(orderBookUpdate[0].ask);
  const [externalsOnly, setExternalsOnly] = useState<boolean>(false);

  const [priceRangeInc, setPriceRangeInc] = useState<number>(0);
  const [aboveOfferRangeInc, setAboveOfferRangeInc] = useState<number>(0);

  const [activeGrouping, setActiveGrouping] = useState<ActiveGrouping>(-1);

  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>([]);
  const [highlightedGroups, setHighlightedGroups] = useState<number[]>([]);

  const [cancelAccount, setCancelAccount] = useState<string>(accountUpdate[0].account);

  const [hideChart, setHideChart] = useState<boolean>(false);
  const [chartSupplyUSD, setChartSupplyUSD] = useState<boolean>(false);
  const [logarithmic, setLogarithmic] = useState<boolean>(false);
  const [aggregate, setAggregate] = useState<boolean>(false);

  const cancelOrders = () => {
    selectedPriceRanges.forEach((pr, i) => {
      const id = Date.now();
      setCancellingPriceRanges([...cancellingPriceRanges, { ...pr, request_id: id, receivedBackend: false }]);
      websocket.send(
        JSON.stringify({
          action: "CANCEL_ORDERS",
          project: projectName,
          account: cancelAccount,
          request_id: id, //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
          from_px: pr.from,
          to_px: pr.to,
        })
      );
    });
    websocket.send(
      JSON.stringify({
        action: "ORDER_BOOK_UPDATE_REQ",
      })
    );
  };

  const renderedBook = useMemo(
    () =>
      aboveOfferRangeInc === 0 && priceRangeInc === 0
        ? orders.map((o, i) => (
            <div
              key={"o" + i}
              className={"order " + orderType + (highlightedGroups.includes(i) ? " selected" : "")}
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
              <div className="deviation">{Math.floor((o[0] / orderBookSpotPrice) * 100 - 100)}%</div>
              <div className="price">${o[0].toFixed(4)}</div>
              <div className="supply">{o[1]}</div>
              <div className="usd-value">${(o[1] * orderBookSpotPrice).toFixed(2)}</div>
            </div>
          ))
        : orders
            .reduce((acc: Group[], next: [number, number]) => {
              //                   tuple: [price, supply]
              const _decimals = countDecimals(orderBookSpotPrice); //2 decimals is not enough to differentiate price ranges

              const _grouping = Math.floor((next[0] - orderBookSpotPrice) / priceRangeInc);
              const _percentGrouping = Math.floor(
                Math.floor((next[0] / orderBookSpotPrice) * 100 - 100) / aboveOfferRangeInc
              );

              const _existingGroup =
                aboveOfferRangeInc === 0
                  ? acc.find((group) => group.grouping === _grouping)
                  : acc.find((group) => group.grouping === _percentGrouping);

              const _groupingPrice =
                "$" +
                (orderBookSpotPrice + _grouping * priceRangeInc).toFixed(_decimals).toString() +
                " - $" +
                (orderBookSpotPrice + (_grouping + 1) * priceRangeInc).toFixed(_decimals).toString();

              const _percentGroupingPrice =
                "$" +
                (((_percentGrouping * aboveOfferRangeInc) / 100 + 1) * orderBookSpotPrice)
                  .toFixed(_decimals)
                  .toString() +
                " - $" +
                ((((_percentGrouping + 1) * aboveOfferRangeInc) / 100 + 1) * orderBookSpotPrice)
                  .toFixed(_decimals)
                  .toString();

              const _deviation =
                Math.floor(((next[0] - priceRangeInc) / orderBookSpotPrice) * 100 - 100).toString() +
                "% - " +
                Math.floor((next[0] / orderBookSpotPrice) * 100 - 100).toString() +
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
                className={"order " + orderType + (highlightedGroups.includes(g.grouping) ? " selected" : "")}
                key={i}
                onClick={() => {
                  //if $ value price range increment...
                  if (aboveOfferRangeInc === 0 && !highlightedGroups.includes(g.grouping)) {
                    setSelectedPriceRanges([
                      ...selectedPriceRanges,
                      {
                        from: orderBookSpotPrice + g.grouping * priceRangeInc,
                        to: orderBookSpotPrice + (g.grouping + 1) * priceRangeInc,
                        supply: g.supply,
                      },
                    ]);
                    setHighlightedGroups([...highlightedGroups, g.grouping]);
                  } else if (priceRangeInc === 0 && !highlightedGroups.includes(g.grouping)) {
                    //if % value price range increment...
                    setSelectedPriceRanges([
                      ...selectedPriceRanges,
                      {
                        from: ((g.grouping * aboveOfferRangeInc) / 100 + 1) * orderBookSpotPrice,
                        to: (((g.grouping + 1) * aboveOfferRangeInc) / 100 + 1) * orderBookSpotPrice,
                        supply: g.supply,
                      },
                    ]);
                    setHighlightedGroups([...highlightedGroups, g.grouping]);
                  } else if (aboveOfferRangeInc === 0 && highlightedGroups.includes(g.grouping)) {
                    const _targetFromPrice = orderBookSpotPrice + g.grouping * priceRangeInc;
                    const _priceRangesTargetRemoved = selectedPriceRanges.filter((r) => r.from !== _targetFromPrice);
                    setSelectedPriceRanges(_priceRangesTargetRemoved);
                    setHighlightedGroups(highlightedGroups.filter((hg) => hg !== g.grouping));
                  } else if (priceRangeInc === 0 && highlightedGroups.includes(g.grouping)) {
                    const _targetFromPrice = ((g.grouping * aboveOfferRangeInc) / 100 + 1) * orderBookSpotPrice;
                    const _priceRangesTargetRemoved = selectedPriceRanges.filter((r) => r.from !== _targetFromPrice);
                    setSelectedPriceRanges(_priceRangesTargetRemoved);
                    setHighlightedGroups(highlightedGroups.filter((hg) => hg !== g.grouping));
                  }
                }}
              >
                <div className="deviation">{g.dev}</div>
                <div className="price">{g.price}</div>
                <div className="supply">{g.supply.toFixed(4)}</div>
                <div className="usd-value">{(g.supply * orderBookSpotPrice).toFixed(2)}</div>
              </div>
            )),
    [orderBookSpotPrice, aboveOfferRangeInc, highlightedGroups, orderType, orders, priceRangeInc, selectedPriceRanges]
  );

  const aggregateAsks = useMemo(
    () =>
      orderBookUpdate[orderBookIdx][OrderType.Ask].map((o, i) =>
        orderBookUpdate[orderBookIdx][OrderType.Ask].reduce(
          (acc: [number, number], next: [number, number], j: number) => {
            const price = next[0];
            const supply = next[1];
            return [o[0], price <= o[0] ? supply + acc[1] : acc[1]];
          },
          [o[0], o[1]]
        )
      ),
    [orderBookIdx, orderBookUpdate]
  );

  const aggregateBids = useMemo(
    () =>
      orderBookUpdate[orderBookIdx][OrderType.Bid].map((o, i) =>
        orderBookUpdate[orderBookIdx][OrderType.Bid].reduce(
          (acc: [number, number], next: [number, number], j: number) => {
            const price = next[0];
            const supply = next[1];
            return [o[0], price >= o[0] ? supply + acc[1] : acc[1]];
          },
          [o[0], o[1]]
        )
      ),
    [orderBookIdx, orderBookUpdate]
  );

  const concatenated = useMemo(
    () => orderBookUpdate[orderBookIdx][OrderType.Bid].concat(orderBookUpdate[orderBookIdx][OrderType.Ask]),
    [orderBookUpdate, orderBookIdx]
  );

  const yDomain: [number, number] = useMemo(
    () => [
      (aggregate ? aggregateBids : concatenated).sort((a, b) => a[1] - b[1])[0][1],
      (aggregate ? aggregateAsks : concatenated).sort((a, b) => b[1] - a[1])[0][1],
    ],
    [aggregate, aggregateAsks, aggregateBids, concatenated]
  );

  const cancellations = useMemo(
    () =>
      cancellingPriceRanges.map((cpr, i) => (
        <div key={"cpr" + i} className="field gap cancel">
          <span>
            {!cpr.receivedBackend
              ? "Cancelling all orders " + cpr.from + " to " + cpr.to
              : "Backend received cancellation from " + cpr.from + " to " + cpr.to}
          </span>
          <div
            className="clear-feedback"
            onClick={() =>
              setCancellingPriceRanges(cancellingPriceRanges.filter((pr) => pr.request_id !== cpr.request_id))
            }
          >
            X
          </div>
        </div>
      )),
    [setCancellingPriceRanges, cancellingPriceRanges]
  );

  return (
    <div className="intervention">
      <h1>Intervention</h1>
      <div className="flex">
        <div className="order-book">
          {orderBookIdx === 0 && (
            <div className="toggle-external-only">
              <input
                type="checkbox"
                checked={externalsOnly}
                onChange={() => {
                  if (!externalsOnly) {
                    orderType === OrderType.Ask &&
                      orderBookUpdate[0].external_ask &&
                      setOrders(orderBookUpdate[0].external_ask);
                    orderType === OrderType.Bid &&
                      orderBookUpdate[0].external_bid &&
                      setOrders(orderBookUpdate[0].external_bid);
                  } else {
                    orderType === OrderType.Ask && setOrders(orderBookUpdate[0].ask);
                    orderType === OrderType.Bid && setOrders(orderBookUpdate[0].bid);
                  }

                  setExternalsOnly(!externalsOnly);
                }}
              />
              <span>See only external asks and bids</span>
            </div>
          )}
          <div className="spot-price field col">
            <b>Spot Price</b>
            <b className="spot-price-value">{orderBookSpotPrice}</b>
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
                  obu.account && setCancelAccount(obu.account);
                  externalsOnly && orderBookUpdate[0].external_ask && orderBookIdx === 0
                    ? setOrders(orderBookUpdate[0].external_ask)
                    : setOrders(obu.ask);
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
                  obu.account && setCancelAccount(obu.account);
                  externalsOnly && orderBookUpdate[0].external_bid && orderBookIdx === 0
                    ? setOrders(orderBookUpdate[0].external_bid)
                    : setOrders(obu.bid);
                }}
              >
                {obu.obtype === "total" ? obu.exchange + " Total" : obu.account} Bids
              </div>,
            ])}
          </div>
          <div className="chart">
            <div className="chart-controls">
              <div className="field gap">
                <span>Hide Chart</span>
                <input type="checkbox" onChange={() => setHideChart(!hideChart)} />
              </div>
              <div className="field gap">
                <span>Supply in USD Value</span>
                <input type="checkbox" onChange={() => setChartSupplyUSD(!chartSupplyUSD)} />
              </div>
              <div className="field gap">
                <span>Logarithmic Scaling</span>
                <input type="checkbox" onChange={() => setLogarithmic(!logarithmic)} />
              </div>
              <div className="field gap">
                <span>Aggregated Supply At Price</span>
                <input type="checkbox" onChange={() => setAggregate(!aggregate)} />
              </div>
            </div>
            {!hideChart && (
              <OrderBookChart
                logarithmic={logarithmic}
                aggregate={aggregate}
                yDomain={yDomain}
                orderBookUpdate={orderBookUpdate}
                aggregateAsks={aggregateAsks}
                aggregateBids={aggregateBids}
                chartSupplyUSD={chartSupplyUSD}
                orderBookIdx={orderBookIdx}
                orderBookSpotPrice={orderBookSpotPrice}
              />
            )}
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
              {cancellations}
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
            <div className="header usd-value col">
              <b>USD Value</b>
            </div>
          </div>
          {renderedBook}
        </div>
        <SweepAndPeg websocket={websocket} accountUpdate={accountUpdate} projectName={projectName} />
      </div>
    </div>
  );
};

export default Intervention;
