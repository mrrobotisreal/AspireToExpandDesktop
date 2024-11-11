import React, { FC, ReactElement, useState } from "react";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AssignmentTwoTone,
  AssignmentTurnedInTwoTone,
  AssignmentLateTwoTone,
  ChatTwoTone,
  ExpandLessTwoTone,
  ExpandMoreTwoTone,
  GamesTwoTone,
  HomeTwoTone,
  LogoutTwoTone,
  RocketLaunchTwoTone,
  SchoolTwoTone,
  SettingsTwoTone,
  VideocamTwoTone,
  AccountCircleTwoTone,
} from "@mui/icons-material";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

import Text from "../text/text";

interface SideNavSubItem {
  id: string;
  path: string;
  icon: ReactElement;
}

interface SideNavItem {
  id: string;
  icon: ReactElement;
  path?: string;
  children?: SideNavSubItem[];
}

const SIDE_NAV_ITEMS: SideNavItem[] = [
  {
    id: "menu_home",
    path: "/home",
    icon: <HomeTwoTone />,
  },
  {
    id: "menu_chat",
    path: "/chat",
    icon: <ChatTwoTone />,
  },
  {
    id: "menu_classroom",
    path: "/classroom",
    icon: <VideocamTwoTone />,
  },
  {
    id: "menu_lessons",
    path: "/lessons",
    icon: <SchoolTwoTone />,
  },
  {
    id: "menu_assignments",
    icon: <AssignmentTwoTone />,
    children: [
      {
        id: "menu_assignments_allAssignments",
        path: "/assignments",
        icon: <AssignmentTwoTone />,
      },
      {
        id: "menu_assignments_completedAssignments",
        path: "/assignments/completed",
        icon: <AssignmentTurnedInTwoTone />,
      },
      {
        id: "menu_assignments_currentAssignments",
        path: "/assignments/current",
        icon: <AssignmentLateTwoTone />,
      },
    ],
  },
  {
    id: "menu_games",
    icon: <GamesTwoTone />,
    children: [
      {
        id: "menu_games_allGames",
        path: "/games",
        icon: <GamesTwoTone />,
      },
      {
        id: "menu_games_spaceShooter",
        path: "/games/space-shooter",
        icon: <RocketLaunchTwoTone />,
      },
    ],
  },
  {
    id: "menu_settings",
    icon: <SettingsTwoTone />,
    children: [
      {
        id: "menu_settings_appSettings",
        path: "/settings",
        icon: <SettingsTwoTone />,
      },
      {
        id: "menu_settings_profileSettings",
        path: "/profile",
        icon: <AccountCircleTwoTone />,
      },
    ],
  },
];

interface SideNavProps {
  handleDrawerClose: () => void;
  drawerIsOpen: boolean;
}

const SideNav: FC<SideNavProps> = ({
  handleDrawerClose,
  drawerIsOpen,
}: SideNavProps) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [assignmentsAreOpen, setAssignmentsAreOpen] = useState(false);
  const [gamesAreOpen, setGamesAreOpen] = useState(false);
  const [settingsAreOpen, setSettingsAreOpen] = useState(false);

  const handleAssignmentsClick = () =>
    setAssignmentsAreOpen(!assignmentsAreOpen);
  const handleGamesClick = () => setGamesAreOpen(!gamesAreOpen);
  const handleSettingsClick = () => setSettingsAreOpen(!settingsAreOpen);

  return (
    <Drawer
      anchor="left"
      variant="temporary"
      open={drawerIsOpen}
      onClose={handleDrawerClose}
    >
      <Box
        sx={{
          bgcolor: "primary.main",
          pt: 4,
          pb: 4,
          pl: 8,
          pr: 8,
        }}
      >
        <Text
          variant="h6"
          textAlign="center"
          color="white"
          fontFamily="Bauhaus-Heavy"
        >
          {intl.formatMessage({ id: "common_menuTitle" })}
        </Text>
      </Box>
      <Divider />
      <List>
        {SIDE_NAV_ITEMS.map((item) => {
          if (item.children) {
            let isOpen: boolean;
            let handleClick: () => void;

            if (item.id === "menu_assignments") {
              isOpen = assignmentsAreOpen;
              handleClick = handleAssignmentsClick;
            } else if (item.id === "menu_games") {
              isOpen = gamesAreOpen;
              handleClick = handleGamesClick;
            } else if (item.id === "menu_settings") {
              isOpen = settingsAreOpen;
              handleClick = handleSettingsClick;
            } else {
              isOpen = false;
              handleClick = () => {};
            }

            return (
              <div key={item.id}>
                <ListItem>
                  <ListItemButton onClick={handleClick}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText>
                      <Text variant="body1">
                        {intl.formatMessage({ id: item.id })}
                      </Text>
                    </ListItemText>
                    {isOpen ? <ExpandLessTwoTone /> : <ExpandMoreTwoTone />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((subItem) => (
                      <ListItem key={subItem.id}>
                        <ListItemButton
                          onClick={() => navigate(subItem.path!)}
                          sx={{ pl: 4 }}
                        >
                          <ListItemIcon>{subItem.icon}</ListItemIcon>
                          <ListItemText>
                            <Text variant="body1">
                              {intl.formatMessage({ id: subItem.id })}
                            </Text>
                          </ListItemText>
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </div>
            );
          } else {
            return (
              <ListItem key={item.id}>
                <ListItemButton onClick={() => navigate(item.path!)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText>
                    <Text variant="body1">
                      {intl.formatMessage({ id: item.id })}
                    </Text>
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            );
          }
        })}
      </List>
      <Divider />
      <List>
        <ListItem>
          <ListItemButton
            onClick={() => {
              // TODO: implement logout
              navigate("/");
            }}
          >
            <ListItemIcon>
              <LogoutTwoTone />
            </ListItemIcon>
            <ListItemText>
              <Text variant="body1">
                {intl.formatMessage({ id: "menu_logout" })}
              </Text>
            </ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default SideNav;
