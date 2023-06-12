import { useEffect, useState } from "react";
import { Alert } from "../App";

type Props = {
  websocket: WebSocket;
  alerts: Alert[];
  projectName: string;
  selectedAccount: string;
};

const AlertControl = (props: Props) => {
  const { websocket, alerts, projectName, selectedAccount } = props;

  const [editingAlertIdx, setEditingAlertIdx] = useState<number>(-1);
  const [editingAlert, setEditingAlert] = useState<Alert | undefined>();

  useEffect(() => {
    websocket.send(
      JSON.stringify({
        action: "GET_ALERTS",
        project: projectName,
        account: selectedAccount,
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
      })
    );
  }, [websocket, projectName, selectedAccount]);

  //start/stop ALL alerts in account
  const startAlerts = () => {
    websocket.send(
      JSON.stringify({
        action: "START_STOP_ALERT",
        project: projectName,
        account: selectedAccount,
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        status: true,
      })
    );
  };

  //start/stop ALL alerts in account
  const stopAlerts = () => {
    websocket.send(
      JSON.stringify({
        action: "START_STOP_ALERT",
        project: projectName,
        account: selectedAccount,
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        status: false,
      })
    );
  };

  const startAlert = (alertId: number) => {
    websocket.send(
      JSON.stringify({
        action: "START_STOP_ALERT",
        project: projectName,
        alert_id: alertId,
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        status: true,
      })
    );
  };

  const stopAlert = (alertId: number) => {
    websocket.send(
      JSON.stringify({
        action: "START_STOP_ALERT",
        project: projectName,
        alert_id: alertId,
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
        status: false,
      })
    );
  };

  const setAlert = (alertId: string) => {
    if (!editingAlert) return;
    websocket.send(
      JSON.stringify({
        action: "SET_ALERT",
        project: projectName,
        alert_id: alertId,
        alert: editingAlert,
      })
    );
    websocket.send(
      JSON.stringify({
        action: "GET_ALERTS",
        project: projectName,
        account: selectedAccount,
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
      })
    );
  };

  return (
    <div className="alerts">
      <div className="fixed-buttons">
        <button className="stop-alerts" onClick={() => stopAlerts()}>
          STOP ALERTS
        </button>
        <button className="start-alerts" onClick={() => startAlerts()}>
          START ALERTS
        </button>
      </div>
      {alerts.map((a, i) => (
        <div className="alert" key={i}>
          {editingAlertIdx !== i
            ? [
                <h4>Common Configurations</h4>,
                Object.entries(a.common_config).map((cc, j) => (
                  <div className="config common-config" key={j}>
                    {cc[0] + " : " + (cc[0] === "google_sheets_map" ? JSON.stringify(cc[1]) : cc[1])}
                  </div>
                )),
                <h4>Specific Configurations</h4>,
                Object.entries(a.specific_config).map((cc, j) => (
                  <div className="config specific-config" key={j}>
                    {cc[0] + " : " + cc[1]}
                  </div>
                )),
              ]
            : editingAlert !== undefined
            ? [
                <h4>Common Configurations</h4>,
                Object.entries(editingAlert.common_config).map((cc, j) => (
                  <div className={"config common-config editing " + cc[0]} key={j}>
                    <span>{cc[0]}</span>
                    {cc[0] !== "google_sheets_map" ? (
                      <input
                        defaultValue={cc[1]}
                        onChange={(e) => setEditingAlert({ ...editingAlert, [cc[0]]: e.target.value })}
                      />
                    ) : (
                      <div className="google_sheets_map">
                        {Object.entries(cc[1]).map((gsm: [string, any], k) => [
                          <span key={"prop" + k}>{gsm[0]}</span>,
                          <input
                            defaultValue={gsm[1]}
                            key={"val" + k}
                            onChange={(e) =>
                              setEditingAlert({
                                ...editingAlert,
                                common_config: {
                                  ...editingAlert.common_config,
                                  google_sheets_map: {
                                    ...editingAlert.common_config.google_sheets_map,
                                    [gsm[0]]: e.target.value,
                                  },
                                },
                              })
                            }
                          />,
                        ])}
                      </div>
                    )}
                  </div>
                )),
                <h4>Specific Configurations</h4>,
                Object.entries(editingAlert.specific_config).map((sc: [string, any], i) => (
                  <div className={"config specific-config editing " + sc[0]} key={i}>
                    <span>{sc[0]}</span>
                    <input
                      defaultValue={sc[1]}
                      onChange={(e) =>
                        setEditingAlert({
                          ...editingAlert,
                          specific_config: { ...editingAlert.specific_config, [sc[0]]: e.target.value },
                        })
                      }
                    />
                  </div>
                )),
              ]
            : null}
          {editingAlertIdx === -1 && (
            <button
              onClick={() => {
                setEditingAlertIdx(i);
                setEditingAlert(alerts[i]);
              }}
            >
              EDIT
            </button>
          )}
          {editingAlertIdx === i && editingAlert && (
            <button
              onClick={() => {
                setAlert(editingAlert.alert_id);
                setEditingAlertIdx(-1);
                setEditingAlert(undefined);
              }}
            >
              SAVE
            </button>
          )}
          {editingAlertIdx === i && (
            <button
              onClick={() => {
                setEditingAlertIdx(-1);
                setEditingAlert(undefined);
              }}
            >
              CANCEL
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AlertControl;
