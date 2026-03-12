import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
    Paper, Typography, TextField, List, ListItem,
    ListItemText, ListItemAvatar, Avatar, IconButton,
    Divider, Tooltip, Switch, FormControlLabel, CircularProgress,
    InputAdornment, Chip, Badge
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import GroupIcon from "@material-ui/icons/Group";
import SearchIcon from "@material-ui/icons/Search";
import LabelIcon from "@material-ui/icons/Label";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        height: "calc(100vh - 64px)",
        overflow: "hidden",
    },
    sidebar: {
        width: 320,
        minWidth: 280,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        background: theme.palette.background.paper,
    },
    sidebarHeader: {
        padding: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    tagFiltersRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: theme.spacing(1, 2),
        borderBottom: `1px solid ${theme.palette.divider}`,
        maxHeight: 80,
        overflowY: "auto",
    },
    groupList: {
        flex: 1,
        overflowY: "auto",
    },
    groupItem: {
        cursor: "pointer",
        "&:hover": {
            background: theme.palette.action.hover,
        },
    },
    groupItemSelected: {
        background: theme.palette.action.selected,
    },
    chatPane: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: theme.palette.background.default,
    },
    chatHeader: {
        padding: theme.spacing(1.5, 2),
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(1),
        flexWrap: "wrap",
    },
    messagesArea: {
        flex: 1,
        overflowY: "auto",
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    messageBubble: {
        maxWidth: "70%",
        padding: theme.spacing(1, 1.5),
        borderRadius: 12,
        alignSelf: "flex-start",
        background: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
    },
    messageBubbleMe: {
        alignSelf: "flex-end",
        background: theme.palette.primary.main,
        color: "#fff",
    },
    senderName: {
        fontSize: "0.7rem",
        fontWeight: 700,
        color: theme.palette.primary.main,
        marginBottom: 2,
    },
    messageText: {
        fontSize: "0.875rem",
        wordBreak: "break-word",
    },
    messageTime: {
        fontSize: "0.65rem",
        opacity: 0.6,
        textAlign: "right",
        marginTop: 2,
    },
    inputArea: {
        padding: theme.spacing(1.5),
        borderTop: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(1),
    },
    emptyState: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: theme.palette.text.disabled,
    },
    noDbNote: {
        background: theme.palette.info.light,
        color: theme.palette.info.contrastText,
        padding: theme.spacing(1, 2),
        fontSize: "0.75rem",
    },
}));

const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const Groups = () => {
    const classes = useStyles();
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [search, setSearch] = useState("");
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [whatsapps, setWhatsapps] = useState([]);
    const [activeTag, setActiveTag] = useState(null);
    const [tagInput, setTagInput] = useState("");
    const [editingTag, setEditingTag] = useState(false);
    const messagesEndRef = useRef(null);

    const fetchGroups = async () => {
        try {
            const { data } = await api.get("/groups", { params: { searchParam: search } });
            setGroups(data);
        } catch (err) { toastError(err); }
    };

    useEffect(() => { fetchGroups(); }, [search]);

    useEffect(() => {
        const fetchWhatsapps = async () => {
            try {
                const { data } = await api.get("/whatsapp");
                setWhatsapps(data);
            } catch (err) { toastError(err); }
        };
        fetchWhatsapps();
    }, []);

    const loadMessages = async (group) => {
        setSelectedGroup(group);
        setMessages([]);
        setTagInput(group.groupTag || "");
        if (!group.id) return; // No DB record yet, no messages
        setLoading(true);
        try {
            const { data } = await api.get(`/groups/${group.id}/messages`);
            setMessages(data.messages);
        } catch (err) { toastError(err); }
        setLoading(false);
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!replyText.trim() || !selectedGroup) return;
        const connectedWa = whatsapps.find(w => w.status === "CONNECTED");
        if (!connectedWa) {
            toast.error("Nenhuma conexão WhatsApp ativa.");
            return;
        }
        setSending(true);
        try {
            await api.post(`/groups/${selectedGroup.id || "direct"}/send`, {
                body: replyText,
                waId: selectedGroup.waId,
                whatsappId: connectedWa.id,
            });
            setReplyText("");
            toast.success("Mensagem enviada!");
            if (selectedGroup.id) await loadMessages(selectedGroup);
        } catch (err) { toastError(err); }
        setSending(false);
    };

    const handleToggleMode = async (group) => {
        if (!group.id) {
            toast.info("Este grupo ainda não tem registros no sistema. Aguarde a primeira mensagem.");
            return;
        }
        try {
            const { data } = await api.put(`/groups/${group.id}/mode`, { groupMode: !group.groupMode });
            setGroups(prev => prev.map(g => g.waId === group.waId ? { ...g, groupMode: data.groupMode } : g));
            if (selectedGroup?.waId === group.waId) setSelectedGroup(prev => ({ ...prev, groupMode: data.groupMode }));
            toast.success(data.groupMode ? "Modo grupo ativado! Sem tickets." : "Modo grupo desativado.");
        } catch (err) { toastError(err); }
    };

    const handleSaveTag = async () => {
        if (!selectedGroup?.id) {
            toast.info("Aguarde a primeira mensagem deste grupo para adicionar tags.");
            return;
        }
        try {
            const { data } = await api.put(`/groups/${selectedGroup.id}/tag`, { groupTag: tagInput });
            setGroups(prev => prev.map(g => g.waId === selectedGroup.waId ? { ...g, groupTag: data.groupTag } : g));
            setSelectedGroup(prev => ({ ...prev, groupTag: data.groupTag }));
            setEditingTag(false);
            toast.success("Tag salva!");
        } catch (err) { toastError(err); }
    };

    // Collect all unique tags
    const allTags = [...new Set(groups.map(g => g.groupTag).filter(Boolean))];

    const filteredGroups = groups.filter(g => {
        const matchSearch = g.name?.toLowerCase().includes(search.toLowerCase());
        const matchTag = activeTag ? g.groupTag === activeTag : true;
        return matchSearch && matchTag;
    });

    return (
        <div className={classes.root}>
            {/* Sidebar */}
            <div className={classes.sidebar}>
                <div className={classes.sidebarHeader}>
                    <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 8 }}>
                        Grupos ({filteredGroups.length}/{groups.length})
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Buscar grupo..."
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                        }}
                    />
                </div>

                {/* Tag filter chips */}
                {allTags.length > 0 && (
                    <div className={classes.tagFiltersRow}>
                        <Chip
                            label="Todos"
                            size="small"
                            color={!activeTag ? "primary" : "default"}
                            onClick={() => setActiveTag(null)}
                        />
                        {allTags.map(tag => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                icon={<LabelIcon />}
                                color={activeTag === tag ? "primary" : "default"}
                                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                            />
                        ))}
                    </div>
                )}

                <List className={classes.groupList} disablePadding>
                    {filteredGroups.map(group => (
                        <React.Fragment key={group.waId}>
                            <ListItem
                                className={`${classes.groupItem} ${selectedGroup?.waId === group.waId ? classes.groupItemSelected : ""}`}
                                onClick={() => loadMessages(group)}
                            >
                                <ListItemAvatar>
                                    <Badge badgeContent={group.unreadCount || 0} color="error" max={99}>
                                        <Avatar src={group.profilePicUrl}>
                                            <GroupIcon />
                                        </Avatar>
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={group.name}
                                    secondary={
                                        <span>
                                            {group.groupTag && <span style={{ color: "#666", marginRight: 4 }}>🏷️ {group.groupTag} · </span>}
                                            {group.groupMode ? "🛡️ Modo grupo" : "📋 Criando tickets"}
                                        </span>
                                    }
                                    primaryTypographyProps={{ noWrap: true, style: { fontWeight: 600 } }}
                                    secondaryTypographyProps={{ noWrap: true, style: { fontSize: "0.7rem" } }}
                                />
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                    {filteredGroups.length === 0 && (
                        <Typography variant="body2" color="textSecondary" style={{ textAlign: "center", padding: 24 }}>
                            Nenhum grupo encontrado.
                        </Typography>
                    )}
                </List>
            </div>

            {/* Chat Pane */}
            <div className={classes.chatPane}>
                {!selectedGroup ? (
                    <div className={classes.emptyState}>
                        <GroupIcon style={{ fontSize: 80, marginBottom: 16 }} />
                        <Typography variant="h6">Selecione um grupo</Typography>
                        <Typography variant="body2">Escolha um grupo na lista para ver as mensagens</Typography>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className={classes.chatHeader}>
                            <Avatar src={selectedGroup.profilePicUrl}><GroupIcon /></Avatar>
                            <div style={{ flex: 1 }}>
                                <Typography variant="subtitle1" style={{ fontWeight: 700 }}>{selectedGroup.name}</Typography>
                                <Typography variant="caption" color="textSecondary">{selectedGroup.number}</Typography>
                            </div>

                            {/* Tag editor */}
                            {editingTag ? (
                                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                    <TextField
                                        size="small"
                                        variant="outlined"
                                        placeholder="Ex: Suporte, VIP..."
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") handleSaveTag(); }}
                                        style={{ width: 140 }}
                                    />
                                    <IconButton size="small" onClick={handleSaveTag} color="primary">
                                        <SendIcon fontSize="small" />
                                    </IconButton>
                                </div>
                            ) : (
                                <Tooltip title="Clique para definir uma tag para este grupo">
                                    <Chip
                                        icon={<LabelIcon />}
                                        label={selectedGroup.groupTag || "Sem tag"}
                                        size="small"
                                        onClick={() => setEditingTag(true)}
                                        variant={selectedGroup.groupTag ? "default" : "outlined"}
                                        color={selectedGroup.groupTag ? "primary" : "default"}
                                    />
                                </Tooltip>
                            )}

                            <Tooltip title="Ativar Modo Grupo desabilita tickets para este grupo">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!selectedGroup.groupMode}
                                            onChange={() => handleToggleMode(selectedGroup)}
                                            color="primary"
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="caption">Modo Grupo</Typography>}
                                />
                            </Tooltip>
                        </div>

                        {!selectedGroup.id && (
                            <div className={classes.noDbNote}>
                                ℹ️ Grupo ainda sem histórico no sistema. Mensagens aparecerão aqui após a primeira interação.
                            </div>
                        )}

                        {/* Messages */}
                        <div className={classes.messagesArea}>
                            {loading ? (
                                <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                                    <CircularProgress />
                                </div>
                            ) : messages.length === 0 ? (
                                <Typography variant="body2" color="textSecondary" style={{ textAlign: "center", padding: 32 }}>
                                    {selectedGroup.id ? "Nenhuma mensagem encontrada." : "Aguardando primeira mensagem do grupo."}
                                </Typography>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className={`${classes.messageBubble} ${msg.fromMe ? classes.messageBubbleMe : ""}`}>
                                        {!msg.fromMe && msg.contact && (
                                            <div className={classes.senderName}>{msg.contact.name}</div>
                                        )}
                                        <div className={classes.messageText}>{msg.body}</div>
                                        <div className={classes.messageTime}>{formatTime(msg.createdAt)}</div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply */}
                        <div className={classes.inputArea}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="Responder no grupo..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                multiline
                                maxRows={3}
                            />
                            <IconButton color="primary" onClick={handleSend} disabled={sending || !replyText.trim()}>
                                <SendIcon />
                            </IconButton>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Groups;
