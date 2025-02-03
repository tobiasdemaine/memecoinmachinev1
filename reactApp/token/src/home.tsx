import {
  Container,
  Text,
  Group,
  Button,
  Paper,
  Box,
  Title,
  Center,
} from "@mantine/core";
import { motion } from "framer-motion";
import { useMediaQuery } from "@mantine/hooks";
import config from "./data/data.json";

const heroSectionStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${config.gradientStart}, ${config.gradientEnd})`,
  backgroundImage: `url(${config.heroImage})`,
  backgroundSize: "cover",
  backgroundBlendMode: "multiply",
  color: "white",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  textAlign: "center",
  padding: "0 20px",
};
import "./Home.css";

export const Home = () => {
  const isMobile = useMediaQuery("(max-width: 768px)"); // For responsive design
  console.log(isMobile);
  return (
    <div style={{ backgroundColor: "#f5f5f5" }}>
      <Box
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          // transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          // padding: "10px",
          // borderRadius: "0 5px 5px 0",
          textAlign: "right",
          zIndex: 1000,
        }}
      >
        <Group justify="space-between">
          <Button
            variant="subtle"
            style={{ color: "white" }}
            onClick={() => scrollTo(0, 0)}
          >
            {config.symbol}
          </Button>
          <Box>
            {config.menu &&
              config.menu.map((item: any) => (
                <Button
                  key={item.name}
                  variant="subtle"
                  style={{ color: "white" }}
                  onClick={() => {
                    window.open(item.link);
                  }}
                >
                  {item.name}
                </Button>
              ))}
          </Box>
        </Group>
      </Box>
      {/* Hero Section */}
      <div style={heroSectionStyle}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <Container>
            <Group justify="space-evenly">
              <Box>
                <img
                  style={{ width: 300, marginTop: "50px" }}
                  src={config.logo}
                  alt="logo"
                />
              </Box>
              <Box mb={50}>
                <Title size="h1" fw={700} style={{ marginBottom: "20px" }}>
                  {config.welcomeText}
                </Title>
                <Text size="lg" fw={500} style={{ marginBottom: "30px" }}>
                  {config.welcomeMessage}
                </Text>
                <Group justify="space-evenly" gap="md">
                  <Button
                    variant="filled"
                    size="lg"
                    radius="xl"
                    style={{
                      color: "white",
                      padding: isMobile ? "12px 24px" : "14px 36px",
                    }}
                    onClick={() => {
                      const featuresSection =
                        document.getElementById("features-section");
                      if (featuresSection) {
                        featuresSection.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    {config.buttonA}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    radius="xl"
                    onClick={() => window.open(config.buttonBLink)}
                  >
                    {config.buttonB}
                  </Button>
                </Group>
              </Box>
            </Group>
          </Container>
        </motion.div>
      </div>

      {/* Features Section */}
      <Container
        size="lg"
        style={{ paddingTop: "50px", paddingBottom: "50px" }}
        id="features-section"
      >
        <Group justify="space-evenly" gap={isMobile ? "sm" : "xl"}>
          <Paper
            shadow="sm"
            radius="md"
            p="md"
            style={{
              width: "300px",
              backgroundColor: "#fff",

              transition: "transform 0.3s ease",
            }}
            component={motion.div}
            whileHover={{ scale: 1.05 }}
          >
            <Center>
              <Text fw={600} size="lg" style={{ marginBottom: "20px" }}>
                {config.featuresA}
              </Text>
            </Center>
            <Text>{config.featuresAcontent}</Text>
          </Paper>
          <Paper
            shadow="sm"
            radius="md"
            p="md"
            style={{
              width: "300px",
              backgroundColor: "#fff",

              transition: "transform 0.3s ease",
            }}
            component={motion.div}
            whileHover={{ scale: 1.05 }}
          >
            <Center>
              <Text fw={600} size="lg" style={{ marginBottom: "20px" }}>
                {config.featuresB}
              </Text>
            </Center>
            <Text>{config.featuresBcontent}</Text>
          </Paper>
          <Paper
            shadow="sm"
            radius="md"
            p="md"
            style={{
              width: "300px",
              backgroundColor: "#fff",
              transition: "transform 0.3s ease",
            }}
            component={motion.div}
            whileHover={{ scale: 1.05 }}
          >
            <Center>
              <Text fw={600} size="lg" style={{ marginBottom: "20px" }}>
                {config.featuresC}
              </Text>
            </Center>
            <Text>{config.featuresCcontent}</Text>
          </Paper>
        </Group>
      </Container>

      <Container
        size="lg"
        style={{ paddingTop: "50px", paddingBottom: "50px" }}
      >
        <Text size="lg" style={{ marginBottom: "30px", textAlign: "left" }}>
          <div dangerouslySetInnerHTML={{ __html: config.document }} />
        </Text>
        <Group justify="space-evenly" gap="md" style={{ verticalAlign: "top" }}>
          <Paper
            shadow="sm"
            radius="md"
            p="md"
            style={{ width: "100%", maxWidth: "500px" }}
          >
            <Text fw={600} size="lg" style={{ marginBottom: "10px" }}>
              {config.documentBlock1Title}
            </Text>
            <Text>{config.documentBlock1Description}</Text>
            <Button
              variant="outline"
              style={{ marginTop: "15px" }}
              size="sm"
              radius="xl"
              onClick={() => window.open(config.documentBlock1Link)}
            >
              {config.documentBlock1LinkText}
            </Button>
          </Paper>
          <Paper
            shadow="sm"
            radius="md"
            p="md"
            style={{ width: "100%", maxWidth: "500px" }}
          >
            <Text fw={600} size="lg" style={{ marginBottom: "10px" }}>
              {config.documentBlock2Title}
            </Text>
            <Text>{config.documentBlock2Description}</Text>
            <Button
              variant="outline"
              style={{ marginTop: "15px" }}
              size="sm"
              radius="xl"
              onClick={() => window.open(config.documentBlock2Link)}
            >
              {config.documentBlock2LinkText}
            </Button>
          </Paper>
        </Group>
      </Container>

      {/* Footer Section */}
      <Box
        style={{
          background: "#333",
          color: "white",
          padding: "20px 0",
          textAlign: "center",
        }}
      >
        <Text size="sm">&copy; 2025 {config.entityCopyrightFooter}</Text>
      </Box>
    </div>
  );
};
