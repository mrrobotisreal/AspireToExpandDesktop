import React, { FC } from "react";
import {
  AppBar,
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
} from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

import { useStudentContext } from "../../context/studentContext";
import Text from "../text/text";

interface TopNavProps {
  handleDrawerOpen: () => void;
  title: string;
}

const TopNav: FC<TopNavProps> = ({ handleDrawerOpen, title }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { info } = useStudentContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed">
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleDrawerOpen}
        >
          <MenuIcon />
        </IconButton>
        <Text
          variant="h5"
          fontFamily="Bauhaus-Heavy"
          textAlign="center"
          sx={{ flexGrow: 1 }}
        >
          {title}
        </Text>
        <Avatar
          src={info.profilePicturePath}
          sx={{ ml: "auto" }}
          onClick={handleMenuOpen}
        />
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              navigate("/profile");
              handleMenuClose();
            }}
            sx={{
              p: 2,
            }}
          >
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <Text variant="body1">
              {intl.formatMessage({ id: "account_profileSettings" })}
            </Text>
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate("/settings");
              handleMenuClose();
            }}
            sx={{
              p: 2,
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <Text variant="body1">
              {intl.formatMessage({ id: "account_appSettings" })}
            </Text>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              navigate("/");
              handleMenuClose();
            }}
            sx={{
              p: 2,
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <Text variant="body1">
              {intl.formatMessage({ id: "common_logout" })}
            </Text>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
