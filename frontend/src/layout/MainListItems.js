import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import { Badge } from "@material-ui/core";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import QuestionAnswerOutlinedIcon from "@material-ui/icons/QuestionAnswerOutlined";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import ViewColumnIcon from "@material-ui/icons/ViewColumn";
import ForumIcon from "@material-ui/icons/Forum";
import EventIcon from "@material-ui/icons/Event";
import AssessmentIcon from "@material-ui/icons/Assessment";

// import AIAgentModal from "../components/AIAgentModal";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  listItem: {
    transition: "all 0.3s ease",
    borderRadius: "8px",
    margin: "4px 8px",
    width: "auto",
    "&:hover": {
      backgroundColor: "#001F60",
      "& $listItemIcon, & $listItemText": {
        color: "#fff",
      },
    },
  },
  listItemIcon: {
    transition: "color 0.3s ease",
  },
  listItemText: {
    transition: "color 0.3s ease",
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, className } = props;
  const classes = useStyles();

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem 
        button 
        component={renderLink} 
        className={`${classes.listItem} ${className}`}
      >
        {icon ? (
          <ListItemIcon className={classes.listItemIcon}>
            {icon}
          </ListItemIcon>
        ) : null}
        <ListItemText 
          primary={primary} 
          className={classes.listItemText} 
        />
      </ListItem>
    </li>
  );
}

const MainListItems = (props) => {
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  // const [aiAgentModalOpen, setAiAgentModalOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  return (
    <div onClick={drawerClose}>
      <ListItemLink
        to="/"
        primary="Dashboard"
        icon={<DashboardOutlinedIcon />}
      />
      <ListItemLink
        to="/n8n"
        primary="n8n Workflow"
        icon={<AccountTreeIcon />}
      />
      <ListItemLink
        to="/groups"
        primary="Grupos WhatsApp"
        icon={<AccountTreeOutlinedIcon />}
      />
      <ListItemLink
        to="/connections"
        primary={i18n.t("mainDrawer.listItems.connections")}
        icon={
          <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
            <SyncAltIcon />
          </Badge>
        }
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<WhatsAppIcon />}
      />
      <ListItemLink
        to="/kanban"
        primary="Kanban"
        icon={<ViewColumnIcon />}
      />
      <ListItemLink
        to="/ai-insights"
        primary="Insights IA"
        icon={<AssessmentIcon />}
      />


      <ListItemLink
        to="/chats"
        primary="Chat Interno"
        icon={<ForumIcon />}
      />
      <ListItemLink
        to="/schedules"
        primary="Agendamentos"
        icon={<EventIcon />}
      />

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlinedIcon />}
      />
      <ListItemLink
        to="/quickAnswers"
        primary={i18n.t("mainDrawer.listItems.quickAnswers")}
        icon={<QuestionAnswerOutlinedIcon />}
      />
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader inset>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<PeopleAltOutlinedIcon />}
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<AccountTreeOutlinedIcon />}
            />
            <ListItemLink
              to="/queue-integration"
              primary={i18n.t("mainDrawer.listItems.integrations")}
              icon={<DeviceHubIcon />}
            />
            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<SettingsOutlinedIcon />}
            />
            <ListItemLink
              to="/tags"
              primary="Etiquetas (Tags)"
              icon={<LocalOfferIcon />}
            />

            {/* <Divider />
            <ListItem button onClick={() => { setAiAgentModalOpen(true); drawerClose(); }}>
              <ListItemIcon>
                <MemoryIcon />
              </ListItemIcon>
              <ListItemText primary="Agente IA" />
            </ListItem>

            <AIAgentModal
              open={aiAgentModalOpen}
              onClose={() => setAiAgentModalOpen(false)}
              agentId={1}
            /> */}
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
