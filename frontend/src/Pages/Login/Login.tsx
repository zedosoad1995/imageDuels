import { useContext, useState } from "react";
import { login } from "../../Api/auth";
import { useNavigate } from "react-router";
import {
  Anchor,
  Button,
  Flex,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { UserContext } from "../../Contexts/UserContext";

export const Login = () => {
  const navigate = useNavigate();
  const { setLoggedIn } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(false);
  const [emailUsername, setEmailUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleChange =
    (setValue: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.value);
    };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      await login(emailUsername, password);
      setLoggedIn(true);

      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickRegister = async () => {
    navigate("/register");
  };

  return (
    <Flex
      gap="md"
      justify="center"
      direction="column"
      style={{ height: "100%" }}
    >
      <TextInput
        label="Email or Username"
        placeholder="Email or Username"
        value={emailUsername}
        onChange={handleChange(setEmailUsername)}
        type="text"
        autoComplete="username"
        inputMode="text"
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
      <Text ta="center">
        Don&apos;t have an account?{" "}
        <Anchor<"a"> fw={700} onClick={handleClickRegister}>
          Register
        </Anchor>
      </Text>
    </Flex>
  );
};
