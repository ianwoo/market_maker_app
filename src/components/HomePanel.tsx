const dummyData = {
  exchanges: [
    {
      exchangeName: "ByBit",
      accounts: [
        {
          accountName: "Account 1",
          tokenBalance: 100,
          usdcBalance: 100,
          btcBalance: 100,
          mtm: 300,
        },
        {
          accountName: "Account 2",
          tokenBalance: 100,
          usdcBalance: 100,
          btcBalance: 100,
          mtm: 300,
        },
      ],
    },
    {
      exchangeName: "Uniswap",
      accounts: [
        {
          accountName: "Account 3",
          tokenBalance: 100,
          usdcBalance: 100,
          btcBalance: 100,
          mtm: 300,
        },
      ],
    },
  ],
  totals: {
    tokenBalanceTotal: 300,
    usdcBalanceTotal: 300,
    btcBalanceTotal: 300,
  },
};

const HomePanel = () => {
  return (
    <div className="home">
      <div className="currentCapitalBalance">
        <h1>Current Capital Balance</h1>
        <div className="exchanges">
          <div className="labels">
            <span>Exchange Name</span>
            <span>Account Name</span>
            <span>Token Balance</span>
            <span>USDC Balance</span>
            <span>BTC Balance</span>
            <span>MTM</span>
          </div>
          {dummyData.exchanges.map((ex, i) => (
            <div className="exchange">
              <span>{ex.exchangeName}</span>
              <div className="accounts">
                {ex.accounts.map((acc, i) => (
                  <div className="account">
                    <span>{acc.accountName}</span>
                    <span>{acc.tokenBalance}</span>
                    <span>{acc.usdcBalance}</span>
                    <span>{acc.btcBalance}</span>
                    <span>{acc.mtm}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="total">
            <span>Total</span>
            <span>-</span>
            <span>{dummyData.totals.tokenBalanceTotal}</span>
            <span>{dummyData.totals.usdcBalanceTotal}</span>
            <span>{dummyData.totals.btcBalanceTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePanel;
