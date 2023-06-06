import { useEffect } from "react";
import { Alert } from "../App";

type Props = {
  websocket: WebSocket;
  alerts: Alert[];
};

const AlertControl = (props: Props) => {
  const { websocket, alerts } = props;

  useEffect(() => {
    websocket.send(
      JSON.stringify({
        action: "GET_ALERTS",
        account: "bybit_dev_mm1", //HARDCODED
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
      })
    );
  }, [websocket]);

  const startAlert = () => {
    websocket.send(
      JSON.stringify({
        action: "START_STOP_ALERT",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        status: true,
      })
    );
  };

  const stopAlert = () => {
    websocket.send(
      JSON.stringify({
        action: "START_STOP_ALERT",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        status: false,
      })
    );
  };

  console.log(alerts);

  return (
    <div className="alerts">
      <div className="fixed-buttons">
        <button className="stop-alerts" onClick={() => stopAlert()}>
          STOP ALERTS
        </button>
        <button className="start-alerts" onClick={() => startAlert()}>
          START ALERTS
        </button>
      </div>
      {alerts.map((a, i) => (
        <div className="alert" key={i}>
          {Object.entries(a.common_config).map((cc, j) => (
            <div className="common-config" key={j}>
              {cc[0] + ":" + cc[1]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AlertControl;
