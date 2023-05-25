import { Config } from "../App";

type Props = {
  configEdit: Config;
  totalBidPriceInUSD: number | undefined;
  totalAskPriceInUSD: number | undefined;
  bestBidPriceInUSD: number | undefined;
  bestAskPriceInUSD: number | undefined;
  orderBookSpotPrice: number;
};

const OrderBookShape = (props: Props) => {
  const {
    configEdit,
    totalBidPriceInUSD,
    totalAskPriceInUSD,
    bestBidPriceInUSD,
    bestAskPriceInUSD,
    orderBookSpotPrice,
  } = props;
  return (
    <div className="order-book-shape-wrapper">
      <div
        className="outer-bounds"
        style={{
          width:
            (configEdit.total_bid_price_range < 1 ? configEdit.total_bid_price_range * 25 : 25) +
            (configEdit.best_bid_price_range < 1 ? configEdit.best_bid_price_range * 25 : 25) +
            (configEdit.best_ask_price_range < 1 ? configEdit.best_ask_price_range * 25 : 25) +
            (configEdit.total_ask_price_range < 1 ? configEdit.total_ask_price_range * 25 : 25) +
            "vw",
        }}
      >
        <div
          className="bound"
          style={{
            marginRight:
              "calc(" +
              ((configEdit.total_bid_price_range < 1 ? configEdit.total_bid_price_range * 25 : 25) +
                (configEdit.best_bid_price_range < 1 ? configEdit.best_bid_price_range * 25 : 25)) +
              "vw - 75px)",
          }}
        >
          <span>${totalBidPriceInUSD?.toFixed(2)}</span>
          <span>{configEdit.total_bid_price_range * 100}%</span>
        </div>
        <div className="bound spot">${orderBookSpotPrice.toFixed(4)}</div>
        <div
          className="bound text-align-right"
          style={{
            marginLeft:
              "calc(" +
              ((configEdit.total_ask_price_range < 1 ? configEdit.total_ask_price_range * 25 : 25) +
                (configEdit.best_ask_price_range < 1 ? configEdit.best_ask_price_range * 25 : 25)) +
              "vw - 75px)",
          }}
        >
          <span>${totalAskPriceInUSD?.toFixed(2)}</span>
          <span>{configEdit.total_ask_price_range * 100}%</span>
        </div>
      </div>
      <div className="order-book-shape">
        <div
          className="shape bids outer-bids"
          style={{
            width: configEdit.total_bid_price_range < 1 ? configEdit.total_bid_price_range * 25 + "vw" : "25vw",
          }}
        >
          <div
            className="tilt-blackout"
            style={{
              borderTop:
                configEdit.tilt_bids > 0 ? (configEdit.tilt_bids / 5) * 69 + "px solid black" : "69px solid black",
              borderLeft:
                configEdit.tilt_bids > 0
                  ? (configEdit.total_bid_price_range < 1 ? configEdit.total_bid_price_range * 25 + "vw" : "25vw") +
                    " solid transparent"
                  : 0,
              borderRight:
                configEdit.tilt_bids < 0
                  ? (configEdit.total_bid_price_range < 1 ? configEdit.total_bid_price_range * 25 + "vw" : "25vw") +
                    " solid transparent"
                  : 0,
            }}
          />
        </div>
        <div
          className="shape bids inner-bids"
          style={{ width: configEdit.best_bid_price_range < 1 ? configEdit.best_bid_price_range * 25 + "vw" : "25vw" }}
        />
        <div className="shape spot" />
        <div
          className="shape asks inner-asks"
          style={{ width: configEdit.best_ask_price_range < 1 ? configEdit.best_ask_price_range * 25 + "vw" : "25vw" }}
        />
        <div
          className="shape asks outer-asks"
          style={{
            width: configEdit.total_ask_price_range < 1 ? configEdit.total_ask_price_range * 25 + "vw" : "25vw",
          }}
        >
          <div
            className="tilt-blackout"
            style={{
              borderTop:
                configEdit.tilt_asks > 0 ? (configEdit.tilt_asks / 5) * 69 + "px solid black" : "69px solid black",
              borderRight:
                configEdit.tilt_asks > 0
                  ? (configEdit.total_ask_price_range < 1 ? configEdit.total_ask_price_range * 25 + "vw" : "25vw") +
                    " solid transparent"
                  : 0,
              borderLeft:
                configEdit.tilt_bids < 0
                  ? (configEdit.total_ask_price_range < 1 ? configEdit.total_ask_price_range * 25 + "vw" : "25vw") +
                    " solid transparent"
                  : 0,
            }}
          />
        </div>
      </div>
      <div className="inner-bounds">
        <div
          className="bound"
          style={{
            marginRight: configEdit.best_ask_price_range < 1 ? configEdit.best_ask_price_range * 25 + "vw" : "25vw",
          }}
        >
          <span>${bestBidPriceInUSD?.toFixed(2)}</span>
          <span>{configEdit.best_bid_price_range * 100}%</span>
        </div>
        <div
          className="bound text-align-right"
          style={{
            marginLeft: configEdit.best_ask_price_range < 1 ? configEdit.best_ask_price_range * 25 + "vw" : "25vw",
          }}
        >
          <span>${bestAskPriceInUSD?.toFixed(2)}</span>
          <span>{configEdit.best_ask_price_range * 100}%</span>
        </div>
      </div>
    </div>
  );
};

export default OrderBookShape;
