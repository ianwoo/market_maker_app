type Props = {
  accountUpdate: any;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const HomePanel = (props: Props) => {
  const { accountUpdate, collapsed, setCollapsed } = props;

  return (
    <div className="home">
      <div className={"project" + (collapsed ? " collapsed" : "")}>
        <div className="project-dropdown-wrapper">
          <select className="project-dropdown">
            <option>Project 1</option>
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
    </div>
  );
};

export default HomePanel;
