import { VictoryAxis, VictoryBar, VictoryChart } from "victory";
import { OrderType } from "./Intervention";
import { OrderBookUpdate } from "../App";

type Props = {
  logarithmic: boolean;
  aggregate: boolean;
  yDomain: [number, number];
  orderBookUpdate: OrderBookUpdate[];
  aggregateAsks: [number, number][];
  aggregateBids: [number, number][];
  chartSupplyUSD: boolean;
  orderBookIdx: number;
  orderBookSpotPrice: number;
};

const OrderBookChart = (props: Props) => {
  const {
    logarithmic,
    aggregate,
    yDomain,
    orderBookUpdate,
    aggregateAsks,
    aggregateBids,
    chartSupplyUSD,
    orderBookIdx,
    orderBookSpotPrice,
  } = props;

  return (
    <VictoryChart
      scale={logarithmic ? { y: "log" } : undefined}
      domain={
        logarithmic
          ? {
              y: yDomain,
            }
          : undefined
      }
    >
      <VictoryBar
        barWidth={2}
        style={{ data: { fill: "red" } }}
        data={(aggregate ? aggregateAsks : orderBookUpdate[orderBookIdx][OrderType.Ask]).map((o, i) => ({
          x: o[0],
          y: chartSupplyUSD ? o[1] * o[0] : o[1],
        }))}
      />
      <VictoryBar
        barWidth={2}
        style={{ data: { fill: "blue" } }}
        data={(aggregate ? aggregateBids : orderBookUpdate[orderBookIdx][OrderType.Bid]).map((o, i) => ({
          x: o[0],
          y: chartSupplyUSD ? o[1] * o[0] : o[1],
        }))}
      />
      <VictoryAxis
        dependentAxis
        tickFormat={(t) => (chartSupplyUSD ? "$" : "") + t}
        style={{
          axis: { stroke: "#ffffff" },
          grid: { stroke: "darkgrey", strokeWidth: 0.5 },
          ticks: { stroke: "#ffffff" },
          tickLabels: { fill: "#ffffff", fontSize: logarithmic ? 5 : 8 },
        }}
      />
      <VictoryAxis
        dependentAxis
        axisValue={orderBookSpotPrice}
        tickFormat={() => ""}
        style={{
          axis: { stroke: "orange", strokeWidth: 2 },
          grid: { strokeWidth: 0 },
          axisLabel: { fill: "#ffffff" },
        }}
      />
      <VictoryAxis
        tickFormat={(t) => "$" + t}
        style={{
          tickLabels: { fill: "#ffffff", fontSize: 8 },
        }}
      />
    </VictoryChart>
  );
};

export default OrderBookChart;
