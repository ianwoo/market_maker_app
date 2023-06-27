import { VictoryAxis, VictoryBar, VictoryChart } from "victory";

type Props = {
  accountUpdate: any;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  allProjects: string[];
  setProjectName: React.Dispatch<React.SetStateAction<string>>;
};

const dummyData = [
  [1, 420],
  [2, 69],
  [3, 4200],
  [4, 6900],
];

const HomePanel = (props: Props) => {
  const { accountUpdate, collapsed, setCollapsed, allProjects, setProjectName } = props;

  return (
    <div className="home">
      <div className={"project-select" + (collapsed ? " collapsed" : "")}>
        <div className="project-dropdown-wrapper">
          <select className="project-dropdown" onChange={(e) => setProjectName(e.target.value)}>
            {allProjects.map((p, i) => (
              <option key={i} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        {collapsed && (
          <div className="collapse" onClick={() => setCollapsed(false)}>
            &#9660;
          </div>
        )}
        {!collapsed && (
          <div className="collapse" onClick={() => setCollapsed(true)}>
            &#9650;
          </div>
        )}
      </div>
      <div className="balancesAndQuantityCharts">
        <div className="balanceSummary third">
          <h1>Balance Summary</h1>
          <div className="coins-header">
            <span>{accountUpdate[0].coin}</span>
            <span>{accountUpdate[1].coin}</span>
          </div>
          <div className="columns">
            <div className="column labels">
              <span>Quantity</span>
              <span>Spot USD Value</span>
            </div>
            <div className="column coin1">
              <span>
                {accountUpdate
                  .reduce((acc: number, next: any) => {
                    return acc + (next.coin === accountUpdate[0].coin ? Number(next.total) : 0);
                  }, 0)
                  .toFixed(4)}
              </span>
              <span>
                $
                {(
                  accountUpdate.reduce((acc: number, next: any) => {
                    return acc + (next.coin === accountUpdate[0].coin ? Number(next.total) : 0);
                  }, 0) * accountUpdate[0].price
                ).toFixed(4)}
              </span>
            </div>
            <div className="column coin1">
              <span>
                {accountUpdate
                  .reduce((acc: number, next: any) => {
                    return acc + (next.coin === accountUpdate[1].coin ? Number(next.total) : 0);
                  }, 0)
                  .toFixed(4)}
              </span>
              <span>
                $
                {accountUpdate
                  .reduce((acc: number, next: any) => {
                    return acc + (next.coin === accountUpdate[1].coin ? Number(next.total) : 0);
                  }, 0)
                  .toFixed(4) * accountUpdate[1].price}
              </span>
            </div>
          </div>
        </div>
        <div className="qChart">
          <VictoryChart>
            <VictoryBar
              style={{ data: { fill: "white" } }}
              data={dummyData.map((o, i) => ({
                x: o[0],
                y: o[1],
              }))}
            />
            <VictoryAxis
              style={{
                tickLabels: { fill: "#ffffff", fontSize: 8 },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: "#ffffff" },
                grid: { stroke: "darkgrey", strokeWidth: 0.5 },
                ticks: { stroke: "#ffffff" },
                tickLabels: { fill: "#ffffff" },
              }}
            />
          </VictoryChart>
        </div>
        <div className="qChart">
          <VictoryChart>
            <VictoryBar
              style={{ data: { fill: "white" } }}
              data={dummyData.map((o, i) => ({
                x: o[0],
                y: o[1],
              }))}
            />
            <VictoryAxis
              style={{
                tickLabels: { fill: "#ffffff", fontSize: 8 },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: "#ffffff" },
                grid: { stroke: "darkgrey", strokeWidth: 0.5 },
                ticks: { stroke: "#ffffff" },
                tickLabels: { fill: "#ffffff" },
              }}
            />
          </VictoryChart>
        </div>
      </div>
      <div className="currentCapitalBalance">
        <h1>Current Capital Balance</h1>
        <div className="accounts">
          <div className="labels">
            <b>Exchange Name</b>
            <b>Account Name</b>
            <b>Coin</b>
            <b>Free</b>
            <b>Locked</b>
            <b>Total</b>
            <b>MTM Price</b>
            <b>Total (USD)</b>
          </div>
          {accountUpdate.length === 0 && <div className="loading">Loading...</div>}
          {accountUpdate.map((acc: any, i: number) => (
            <div className="account" key={i}>
              <span>{acc.exchange}</span>
              <span>{acc.account}</span>
              <span>{acc.coin}</span>
              <span>{Number(acc.free).toFixed(4)}</span>
              <span>{Number(acc.locked).toFixed(4)}</span>
              <span>{Number(acc.total).toFixed(4)}</span>
              <span>${Number(acc.price).toFixed(4)}</span>
              <span>${(Number(acc.total) * Number(acc.price)).toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="reports">
        <div className="report">
          <span>Client Progress Reports</span>
          <button>Generate</button>
        </div>
        <div className="report">
          <span>Historical Account Balances</span>
          <button>Generate</button>
        </div>
        <div className="report">
          <span>MM Activity Logs</span>
          <button>Generate</button>
        </div>
      </div>
    </div>
  );
};

export default HomePanel;
