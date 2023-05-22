import { useEffect, useState } from "react";
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
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
      })
    );
  }, [websocket]);

  return (
    <div className="alerts">
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
