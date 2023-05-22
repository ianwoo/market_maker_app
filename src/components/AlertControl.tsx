import { useEffect, useState } from "react";

type Props = {
  websocket: WebSocket;
};

type AlertCommonConfig = {
  alert_env: string; //ex. DEV
  observation_frequency: number;
  lookback_windows: number;
  enable_email_alert: boolean;
  enable_slack_alert: boolean;
  email_recipients: string[];
  slack_channels: string[];
  enable_postgresdb: boolean;
  postgres_table_list: string[];
  enable_google_sheet: boolean;
  google_sheets_map: any;
};

type Alert = {
  alert_name: string; //ex. token_inflow_outflow
  alert_id: string; //ex. token_inflow_outflow_AGIX_DEV_1
  common_config: AlertCommonConfig;
  specific_config: any;
};

const AlertControl = (props: Props) => {
  const { websocket } = props;

  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    websocket.send(
      JSON.stringify({
        action: "GET_ALERTS",
        request_id: Date.now(), //id used will be milliseconds from 1970 since request was sent, which conveniently provides us with timestamp
      })
    );
  }, [websocket]);

  <div className="alerts"></div>;
};

export default AlertControl;
