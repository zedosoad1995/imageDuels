import { useState } from "react";
import { register } from "../../Api/auth";
import {
  Anchor,
  Button,
  Flex,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useNavigate } from "react-router";

export const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange =
    (setValue: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.value);
    };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      await register(email, password);

      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickLogin = async () => {
    navigate("/login");
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
      <Text ta="center">
        Already have have an account?{" "}
        <Anchor<"a"> fw={700} onClick={handleClickLogin}>
          Login
        </Anchor>
      </Text>
    </Flex>
  );
};
