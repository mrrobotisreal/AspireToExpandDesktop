import React, { FC, useState } from "react";
import { Box, Container, Toolbar } from "@mui/material";

import TopNav from "../navigation/topNav";
import SideNav from "../navigation/sideNav";

// const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: FC<LayoutProps> = ({ children, title }) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  const handleDrawerOpen = () => setDrawerIsOpen(true);
  const handleDrawerClose = () => setDrawerIsOpen(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100vw" }}>
      <TopNav title={title} handleDrawerOpen={handleDrawerOpen} />
      <SideNav
        handleDrawerClose={handleDrawerClose}
        drawerIsOpen={drawerIsOpen}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          p: 3,
          bgcolor: "background.default",
        }}
      >
        <Toolbar />
        <Container>{children}</Container>
      </Box>
    </Box>
  );
};

export default Layout;
