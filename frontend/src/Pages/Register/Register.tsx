import { useState } from "react";
import { register } from "../../Api/auth";
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
import { useNavigate } from "react-router";

export const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange =
    (setValue: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // TODO: Validate email
      setValue(event.currentTarget.value);
    };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      await register(username, email, password);

      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickLogin = async () => {
    navigate("/login");
  };

  return (
    <Container size={400} my={40} px={0}>
      <Stack gap="md">
        <Title ta="center" fw={900}>
          Create an account
        </Title>

        <TextInput
          label="Username"
          placeholder="Username"
          value={username}
          onChange={handleChange(setUsername)}
          type="text"
          autoComplete="username"
          inputMode="text"
        />
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
      </Stack>
    </Container>
  );
};
