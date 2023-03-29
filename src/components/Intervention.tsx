import { useState } from "react";

const orderBookDummyData = [
  { price: 0.00001466, supply: 1308.788 },
  { price: 0.00001368, supply: 803.769 },
  { price: 0.0000127, supply: 699.805 },
  { price: 0.00001221, supply: 697.907 },
  { price: 0.00001172, supply: 650.751 },
  { price: 0.00001124, supply: 153.924 },
  { price: 0.00001075, supply: 136.344 },
  { price: 0.00001055, supply: 120.578 },
  { price: 0.00001036, supply: 111.834 },
  { price: 0.00001016, supply: 76.633 },
  { price: 0.00000997, supply: 63.3 },
];

const orderBookDummySpotPrice = 0.00000977;

type Order = {
  price: number;
  supply: number;
};

type Group = {
  grouping: number;
  price: string;
  supply: number;
  dev: string;
};

const countDecimals = function (value: number) {
  if (Math.floor(value) === value) return 0;
  return value.toString().split(".")[1].length || 0;
};

const Intervention = () => {
  const [priceRangeInc, setPriceRangeInc] = useState<number>(0);
  const [aboveOfferRangeInc, setAboveOfferRangeInc] = useState<number>(0);

  return (
    <div className="intervention">
      <h1>Intervention</h1>
      <div className="flex">
        <div className="order-book">
          <button>Stop Volume Algo</button>
          <div className="spot-price field col">
            <b>Spot Price</b>
            <b>{orderBookDummySpotPrice}</b>
          </div>
          <div className="range-controls">
            <div className="field col">
              <span>% Above Offer Range Increment</span>
              <input
                type="number"
                onChange={(e) =>
                  Number(e.target.value) > 0 ? setAboveOfferRangeInc(Number(e.target.value)) : setAboveOfferRangeInc(0)
                }
              ></input>
            </div>
            <div className="field col">
              <span>Price Range Increment</span>
              <input
                type="number"
                onChange={(e) =>
                  Number(e.target.value) > 0 ? setPriceRangeInc(Number(e.target.value)) : setPriceRangeInc(0)
                }
              ></input>
            </div>
            <button>Cancel Orders</button>
          </div>
          <div className="headers">
            <div className="header">% Above Offer</div>
            <div className="header">Price</div>
            <div className="header">Supply</div>
          </div>
          {aboveOfferRangeInc === 0 && priceRangeInc === 0
            ? orderBookDummyData.map((o, i) => (
                <div className="order" key={i}>
                  <div className="deviation">{Math.floor((o.price / orderBookDummySpotPrice) * 100 - 100)}%</div>
                  <div className="price">{o.price}</div>
                  <div className="supply">{o.supply}</div>
                </div>
              ))
            : orderBookDummyData
                .reduce((acc: Group[], next: Order) => {
                  const _decimals = countDecimals(orderBookDummySpotPrice);

                  const _grouping = Math.floor((next.price - orderBookDummySpotPrice) / priceRangeInc);
                  const _percentGrouping = Math.floor(
                    Math.floor((next.price / orderBookDummySpotPrice) * 100 - 100) / aboveOfferRangeInc
                  );

                  const _existingGroup =
                    aboveOfferRangeInc === 0
                      ? acc.find((group) => group.grouping === _grouping)
                      : acc.find((group) => group.grouping === _percentGrouping);

                  const _groupingPrice =
                    (orderBookDummySpotPrice + _grouping * priceRangeInc).toFixed(_decimals).toString() +
                    " - " +
                    (orderBookDummySpotPrice + (_grouping + 1) * priceRangeInc).toFixed(_decimals).toString();

                  const _percentGroupingPrice =
                    (((_percentGrouping * aboveOfferRangeInc) / 100 + 1) * orderBookDummySpotPrice)
                      .toFixed(_decimals)
                      .toString() +
                    " - " +
                    ((((_percentGrouping + 1) * aboveOfferRangeInc) / 100 + 1) * orderBookDummySpotPrice)
                      .toFixed(_decimals)
                      .toString();

                  const _deviation =
                    Math.floor(((next.price - priceRangeInc) / orderBookDummySpotPrice) * 100 - 100).toString() +
                    "% - " +
                    Math.floor((next.price / orderBookDummySpotPrice) * 100 - 100).toString() +
                    "%";

                  const _percentDeviation =
                    (_percentGrouping * aboveOfferRangeInc).toString() +
                    "% - " +
                    ((_percentGrouping + 1) * aboveOfferRangeInc).toString() +
                    "%";

                  _existingGroup
                    ? (_existingGroup.supply = _existingGroup.supply + next.supply)
                    : acc.push({
                        grouping: aboveOfferRangeInc === 0 ? _grouping : _percentGrouping,
                        supply: next.supply,
                        price: aboveOfferRangeInc === 0 ? _groupingPrice : _percentGroupingPrice,
                        dev: aboveOfferRangeInc === 0 ? _deviation : _percentDeviation,
                      });
                  return acc;
                }, [])
                .map((g, i) => (
                  <div className="order" key={i}>
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
