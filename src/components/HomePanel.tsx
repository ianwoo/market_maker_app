type Props = {
  accountUpdate: any;
};

const HomePanel = (props: Props) => {
  const { accountUpdate } = props;

  return (
    <div className="home">
      <div className="currentCapitalBalance">
        <h1>Current Capital Balance</h1>
        <div className="accounts">
          <div className="labels">
            <span>Exchange Name</span>
            <span>Account Name</span>
            <span>Coin</span>
            <span>Free</span>
            <span>Locked</span>
            <span>Total</span>
            <span>MTM Price</span>
          </div>
          {accountUpdate &&
            accountUpdate.map((acc: any, i: number) => (
              <div className="account" key={i}>
                <span>{acc.exchange}</span>
                <span>{acc.account}</span>
                <span>{acc.coin}</span>
                <span>{Number(acc.free).toFixed(4)}</span>
                <span>{Number(acc.locked).toFixed(4)}</span>
                <span>{Number(acc.total).toFixed(4)}</span>
                <span>${Number(acc.price).toFixed(4)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HomePanel;
