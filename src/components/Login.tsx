import { useState } from "react";

type Props = {
  websocket: WebSocket;
};

const Login = (props: Props) => {
  const { websocket } = props;

  const [username, setUsername] = useState<string>();
  const [authenticationCode, setAuthenticationCode] = useState<string>();

  const authenticate = () => {
    websocket.send(
      JSON.stringify({
        action: "2FA",
        request_id: Date.now(),
        user_id: username,
        "2fa": authenticationCode,
      })
    );
  };

  return (
    <div className="login">
      <span>Username</span>
      <input className="user-name" onChange={(e) => setUsername(e.target.value)} />
      <span>Authentication Code</span>
      <input className="2fa" onChange={(e) => setAuthenticationCode(e.target.value)} />
      <button onClick={authenticate}>Login</button>
    </div>
  );
};

export default Login;
