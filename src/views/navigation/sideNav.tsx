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
  ArrowBackTwoTone,
  AssignmentTwoTone,
  AssignmentTurnedInTwoTone,
  AssignmentLateTwoTone,
  ChatTwoTone,
  ExpandLessTwoTone,
  ExpandMoreTwoTone,
  GamesTwoTone,
  HomeTwoTone,
  RocketLaunchTwoTone,
  SchoolTwoTone,
  SettingsTwoTone,
  VideocamTwoTone,
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
    path: "/settings",
    icon: <SettingsTwoTone />,
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

  const handleAssignmentsClick = () =>
    setAssignmentsAreOpen(!assignmentsAreOpen);

  const handleGamesClick = () => setGamesAreOpen(!gamesAreOpen);

  return (
    <Drawer
      anchor="left"
      variant="temporary"
      open={drawerIsOpen}
      onClose={handleDrawerClose}
    >
      <Box>
        <Text variant="h6" textAlign="center">
          {intl.formatMessage({ id: "common_menu" })}
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
            } else {
              isOpen = false;
              handleClick = () => {};
            }

            return (
              <>
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
                      <ListItem>
                        <ListItemButton onClick={() => navigate(subItem.path!)}>
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
              </>
            );
          } else {
            return (
              <ListItem>
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
              <ArrowBackTwoTone />
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
