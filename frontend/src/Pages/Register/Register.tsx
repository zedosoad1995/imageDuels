import { useState } from "react";
import styles from "./Register.module.css";
import { register } from "../../Api/auth";

export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleChange =
    (setValue: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.value);
    };

  const handleSubmit = () => {
    register(email, password);
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
      <button onClick={handleSubmit}>Register</button>
    </div>
  );
};
