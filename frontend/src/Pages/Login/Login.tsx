import { useState } from "react";
import styles from "./Login.module.css";
import { login } from "../../Api/auth";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleChange =
    (setValue: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.value);
    };

  const handleSubmit = async () => {
    const { token } = await login(email, password);

    localStorage.setItem("token", token);
  };

  return (
    <div className={styles.box}>
      <input
        placeholder="email"
        type="email"
        value={email}
        onChange={handleChange(setEmail)}
      />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={handleChange(setPassword)}
      />
      <button onClick={handleSubmit}>Login</button>
    </div>
  );
};
