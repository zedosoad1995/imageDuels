import { useState } from "react";
import { Anchor, Container, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router";
import { GoogleButton } from "../../Components/GoogleButton/GoogleButton";

export const Register = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // TODO: maybe open another window?
      window.location.href = import.meta.env.VITE_API_URL + "/auth/google";
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
        <GoogleButton
          radius="xl"
          size="md"
          onClick={handleSubmit}
          loaderProps={{ type: "dots" }}
          loading={isLoading}
        >
          Sign up with Google
        </GoogleButton>
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
