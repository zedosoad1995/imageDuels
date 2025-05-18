import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { Anchor, Container, Stack, Text, Title } from "@mantine/core";
import { UserContext } from "../../Contexts/UserContext";
import { GoogleButton } from "../../Components/GoogleButton/GoogleButton";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      login();
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
        <GoogleButton
          radius="xl"
          size="md"
          onClick={handleSubmit}
          loaderProps={{ type: "dots" }}
          loading={isLoading}
        >
          Login with Google
        </GoogleButton>
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
