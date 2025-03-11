import { useContext, useState } from "react";
import { login } from "../../Api/auth";
import { useNavigate } from "react-router";
import { Button, Flex, PasswordInput, TextInput } from "@mantine/core";
import { UserContext } from "../../Contexts/UserContext";

export const Login = () => {
  const navigate = useNavigate();
  const { setLoggedIn } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleChange =
    (setValue: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.value);
    };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      await login(email, password);
      setLoggedIn(true);

      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      gap="md"
      justify="center"
      direction="column"
      style={{ height: "100%" }}
    >
      <TextInput
        label="Email"
        placeholder="Email"
        value={email}
        onChange={handleChange(setEmail)}
        type="email"
        autoComplete="email"
        inputMode="email"
      />
      <PasswordInput
        label="Password"
        placeholder="Password"
        value={password}
        onChange={handleChange(setPassword)}
        type="password"
      />
      <Button
        onClick={handleSubmit}
        loaderProps={{ type: "dots" }}
        loading={isLoading}
      >
        Login
      </Button>
    </Flex>
  );
};
