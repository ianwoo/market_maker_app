import { Config } from "../App";

type Props = {
  config: Config;
  totalBidPriceInUSD: number | undefined;
  totalAskPriceInUSD: number | undefined;
  bestBidPriceInUSD: number | undefined;
  bestAskPriceInUSD: number | undefined;
  orderBookSpotPrice: number;
};

const OrderBookShape = (props: Props) => {
  const { config, totalBidPriceInUSD, totalAskPriceInUSD, bestBidPriceInUSD, bestAskPriceInUSD, orderBookSpotPrice } =
    props;
  return (
    <div className="order-book-shape-wrapper">
      <div
        className="outer-bounds"
        style={{
          width:
            (config.total_bid_price_range < 1 ? config.total_bid_price_range * 25 : 25) +
            (config.best_bid_price_range < 1 ? config.best_bid_price_range * 25 : 25) +
            (config.best_ask_price_range < 1 ? config.best_ask_price_range * 25 : 25) +
            (config.total_ask_price_range < 1 ? config.total_ask_price_range * 25 : 25) +
            "vw",
        }}
      >
        <div
          className="bound"
          style={{
            marginRight:
              "calc(" +
              ((config.total_bid_price_range < 1 ? config.total_bid_price_range * 25 : 25) +
                (config.best_bid_price_range < 1 ? config.best_bid_price_range * 25 : 25)) +
              "vw - 75px)",
          }}
        >
          <span>${totalBidPriceInUSD?.toFixed(2)}</span>
          <span>{config.total_bid_price_range * 100}%</span>
        </div>
        <div className="bound spot">${orderBookSpotPrice}</div>
        <div
          className="bound text-align-right"
          style={{
            marginLeft:
              "calc(" +
              ((config.total_ask_price_range < 1 ? config.total_ask_price_range * 25 : 25) +
                (config.best_ask_price_range < 1 ? config.best_ask_price_range * 25 : 25)) +
              "vw - 75px)",
          }}
        >
          <span>${totalAskPriceInUSD?.toFixed(2)}</span>
          <span>{config.total_ask_price_range * 100}%</span>
        </div>
      </div>
      <div className="order-book-shape">
        <div
          className="shape bids outer-bids"
          style={{
            width: config.total_bid_price_range < 1 ? config.total_bid_price_range * 25 + "vw" : "25vw",
          }}
        >
          <div
            className="tilt-blackout"
            style={{
              borderTop: config.tilt_bids > 0 ? (config.tilt_bids / 5) * 69 + "px solid black" : "69px solid black",
              borderLeft:
                config.tilt_bids > 0
                  ? (config.total_bid_price_range < 1 ? config.total_bid_price_range * 25 + "vw" : "25vw") +
                    " solid transparent"
                  : 0,
              borderRight:
                config.tilt_bids < 0
                  ? (config.total_bid_price_range < 1 ? config.total_bid_price_range * 25 + "vw" : "25vw") +
                    " solid transparent"
                  : 0,
            }}
          />
        </div>
        <div
          className="shape bids inner-bids"
          style={{ width: config.best_bid_price_range < 1 ? config.best_bid_price_range * 25 + "vw" : "25vw" }}
        />
        <div className="shape spot" />
        <div
          className="shape asks inner-asks"
          style={{ width: config.best_ask_price_range < 1 ? config.best_ask_price_range * 25 + "vw" : "25vw" }}
        />
        <div
          className="shape asks outer-asks"
          style={{
            width: config.total_ask_price_range < 1 ? config.total_ask_price_range * 25 + "vw" : "25vw",
          }}
        >
          <div
            className="tilt-blackout"
            style={{
              borderTop: config.tilt_asks > 0 ? (config.tilt_asks / 5) * 69 + "px solid black" : "69px solid black",
              borderRight:
                config.tilt_asks > 0
                  ? (config.total_ask_price_range < 1 ? config.total_ask_price_range * 25 + "vw" : "25vw") +
                    " solid transparent"
                  : 0,
              borderLeft:
                config.tilt_bids < 0
                  ? (config.total_ask_price_range < 1 ? config.total_ask_price_range * 25 + "vw" : "25vw") +
                    " solid transparent"
                  : 0,
            }}
          />
        </div>
      </div>
      <div className="inner-bounds">
        <div
          className="bound"
          style={{ marginRight: config.best_ask_price_range < 1 ? config.best_ask_price_range * 25 + "vw" : "25vw" }}
        >
          <span>${bestBidPriceInUSD?.toFixed(2)}</span>
          <span>{config.best_bid_price_range * 100}%</span>
        </div>
        <div
          className="bound text-align-right"
          style={{ marginLeft: config.best_ask_price_range < 1 ? config.best_ask_price_range * 25 + "vw" : "25vw" }}
        >
          <span>${bestAskPriceInUSD?.toFixed(2)}</span>
          <span>{config.best_ask_price_range * 100}%</span>
        </div>
      </div>
    </div>
  );
};

export default OrderBookShape;
