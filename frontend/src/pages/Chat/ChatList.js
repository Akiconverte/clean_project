import React, { useContext, useState } from "react";
import {
  Avatar,
  Badge,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { format, parseISO } from "date-fns";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  chatList: {
    flex: 1,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  listItem: {
    cursor: "pointer",
    transition: "background 0.15s ease",
    borderBottom: `1px solid ${theme.palette.type === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
    padding: "10px 12px",
    "&:hover": {
      background: theme.palette.type === "dark" ? "rgba(255,255,255,0.05)" : "rgba(26,86,219,0.06)",
    },
  },
  activeItem: {
    background: theme.palette.type === "dark" ? "rgba(26,86,219,0.2)" : "rgba(26,86,219,0.08)",
    borderLeft: "4px solid #1a56db",
  },
  avatar: {
    width: 42,
    height: 42,
    fontSize: "1rem",
    fontWeight: 700,
  },
  primaryText: {
    fontWeight: 600,
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  secondaryText: {
    fontSize: "0.78rem",
    opacity: 0.65,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 160,
  },
  unreadBadge: {
    background: "#1a56db",
    color: "#fff",
    fontSize: "0.7rem",
    height: 18,
    minWidth: 18,
    borderRadius: 9,
    padding: "0 4px",
  },
  actionButtons: {
    display: "flex",
    gap: 2,
  },
  smallIcon: {
    fontSize: 16,
    opacity: 0.6,
    "&:hover": {
      opacity: 1,
    },
  },
}));

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getAvatarColor(name = "") {
  const colors = ["#1a56db","#7c3aed","#059669","#dc2626","#d97706","#0891b2"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function ChatList({
  chats,
  handleSelectChat,
  handleDeleteChat,
  handleEditChat,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [confirmationModal, setConfirmModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});
  const { id } = useParams();

  const goToMessages = async (chat) => {
    if (unreadMessages(chat) > 0) {
      try {
        await api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }
    if (id !== chat.uuid) {
      history.push(`/chats/${chat.uuid}`);
      handleSelectChat(chat);
    }
  };

  const unreadMessages = (chat) => {
    const currentUser = chat.users?.find((u) => u.userId === user.id);
    return currentUser ? currentUser.unreads : 0;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return format(parseISO(dateStr), "HH:mm");
    } catch {
      return "";
    }
  };

  return (
    <>
      <ConfirmationModal
        title="Excluir Conversa"
        open={confirmationModal}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteChat(selectedChat)}
      >
        Esta ação não pode ser revertida, confirmar?
      </ConfirmationModal>

      <div className={classes.mainContainer}>
        <div className={classes.chatList}>
          <List disablePadding>
            {Array.isArray(chats) && chats.map((chat, key) => {
              const unreads = unreadMessages(chat);
              const isActive = chat.uuid === id;

              return (
                <ListItem
                  key={key}
                  onClick={() => goToMessages(chat)}
                  className={`${classes.listItem} ${isActive ? classes.activeItem : ""}`}
                  button
                  disableGutters
                >
                  <ListItemAvatar>
                    <Avatar
                      className={classes.avatar}
                      style={{ background: getAvatarColor(chat.title || "") }}
                    >
                      {getInitials(chat.title || "C")}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <span className={classes.primaryText}>
                        {chat.title}
                        {unreads > 0 && (
                          <span className={classes.unreadBadge}>{unreads}</span>
                        )}
                      </span>
                    }
                    secondary={
                      <span className={classes.secondaryText}>
                        {chat.lastMessage
                          ? `${formatDate(chat.updatedAt)} · ${chat.lastMessage}`
                          : "Sem mensagens"}
                      </span>
                    }
                  />
                  {chat.ownerId === user.id && (
                    <ListItemSecondaryAction className={classes.actionButtons}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToMessages(chat).then(() => handleEditChat(chat));
                        }}
                      >
                        <EditIcon className={classes.smallIcon} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChat(chat);
                          setConfirmModalOpen(true);
                        }}
                      >
                        <DeleteIcon className={classes.smallIcon} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              );
            })}
          </List>
        </div>
      </div>
    </>
  );
}
