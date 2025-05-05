import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import {
  Anchor,
  Button,
  Container,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { UserContext } from "../../Contexts/UserContext";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

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

      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickRegister = async () => {
    navigate("/register");
  };

  return (
    <Container size={400} my={40} px={0}>
      <Stack gap="md">
        <Title ta="center" fw={900}>
          Welcome back!
        </Title>
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
            Create Account
          </Anchor>
        </Text>
      </Stack>
    </Container>
  );
};
