import React, { useContext, useEffect, useRef, useState } from "react";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";

import {
  Box,
  CircularProgress,
  ClickAwayListener,
  IconButton,
  InputBase,
  makeStyles,
  Paper,
  Tooltip,
  Typography,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import MoodIcon from "@material-ui/icons/Mood";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import MicIcon from "@material-ui/icons/Mic";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import CancelIcon from "@material-ui/icons/Cancel";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import AudiotrackIcon from "@material-ui/icons/Audiotrack";
import { green } from "@material-ui/core/colors";

import { AuthContext } from "../../context/Auth/AuthContext";
import { format, parseISO } from "date-fns";
import api from "../../services/api";
import { getBackendUrl } from "../../config";

let Mp3Recorder = null;
const initRecorder = async () => {
  if (!Mp3Recorder) {
    try {
      const MicRecorder = (await import("mic-recorder-to-mp3")).default;
      Mp3Recorder = new MicRecorder({ bitRate: 128 });
    } catch (error) {
      console.error("Failed to initialize recorder:", error);
      return null;
    }
  }
  return Mp3Recorder;
};

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    borderRadius: 0,
    background: theme.palette.type === "dark" ? "#1a1a2e" : "#f0f4f8",
  },
  chatHeader: {
    padding: "12px 20px",
    background: theme.palette.type === "dark"
      ? "linear-gradient(135deg, #16213e 0%, #0f3460 100%)"
      : "linear-gradient(135deg, #0F2F6B 0%, #1a56db 100%)",
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: "1rem",
    background: "rgba(255,255,255,0.25)",
  },
  headerTitle: { color: "#fff", fontWeight: 700, fontSize: "1rem" },
  headerSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" },
  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    ...theme.scrollbarStyles,
  },
  messageRow: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "70%",
  },
  messageRowRight: { alignSelf: "flex-end", alignItems: "flex-end" },
  messageRowLeft: { alignSelf: "flex-start", alignItems: "flex-start" },
  senderName: { fontSize: "0.72rem", fontWeight: 700, marginBottom: 2, paddingLeft: 4 },
  bubbleRight: {
    background: "linear-gradient(135deg, #1a56db 0%, #0F2F6B 100%)",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "18px 18px 4px 18px",
    fontSize: "0.9rem",
    lineHeight: 1.4,
    boxShadow: "0 2px 6px rgba(26,86,219,0.35)",
    wordBreak: "break-word",
    maxWidth: "100%",
  },
  bubbleLeft: {
    background: theme.palette.type === "dark" ? "#2c2c3e" : "#fff",
    color: theme.palette.type === "dark" ? "#e8eaf6" : "#1a1a2e",
    padding: "10px 14px",
    borderRadius: "18px 18px 18px 4px",
    fontSize: "0.9rem",
    lineHeight: 1.4,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    wordBreak: "break-word",
    maxWidth: "100%",
  },
  timestamp: { fontSize: "0.68rem", opacity: 0.65, marginTop: 3, paddingLeft: 4, paddingRight: 4 },
  inputArea: {
    padding: "10px 16px",
    background: theme.palette.type === "dark" ? "#16213e" : "#fff",
    borderTop: `1px solid ${theme.palette.type === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    display: "flex",
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  inputBase: {
    flex: 1,
    background: theme.palette.type === "dark" ? "#1e1e30" : "#f0f4f8",
    borderRadius: 24,
    padding: "8px 16px",
    fontSize: "0.9rem",
    color: theme.palette.type === "dark" ? "#e8eaf6" : "#1a1a2e",
    maxHeight: 120,
    overflowY: "auto",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #1a56db 0%, #0F2F6B 100%)",
    color: "#fff",
    width: 42,
    height: 42,
    "&:hover": { background: "linear-gradient(135deg, #2563eb 0%, #1a56db 100%)", transform: "scale(1.05)" },
    transition: "all 0.2s ease",
    flexShrink: 0,
  },
  iconBtn: {
    color: theme.palette.type === "dark" ? "rgba(255,255,255,0.5)" : "#9ca3af",
    "&:hover": { color: "#1a56db" },
    padding: 6,
  },
  micBtn: {
    color: theme.palette.type === "dark" ? "rgba(255,255,255,0.5)" : "#9ca3af",
    "&:hover": { color: "#dc2626" },
    padding: 6,
  },
  micRecordingBtn: { color: "#dc2626", padding: 6, animation: "pulse 1s infinite" },
  emojiBox: {
    position: "absolute",
    bottom: 65,
    left: 10,
    zIndex: 9999,
    "& .emoji-mart": { fontSize: "14px !important" },
  },
  filePreview: {
    padding: "8px 16px",
    background: theme.palette.type === "dark" ? "#16213e" : "#e8f0fe",
    borderTop: `1px solid ${theme.palette.type === "dark" ? "rgba(255,255,255,0.08)" : "rgba(26,86,219,0.15)"}`,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  filePreviewName: { fontSize: "0.8rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  recorderWrapper: { display: "flex", alignItems: "center", gap: 6, flex: 1 },
  uploadInput: { display: "none" },
  mediaImage: { maxWidth: "100%", maxHeight: 200, borderRadius: 8, cursor: "pointer" },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0.4 },
}));

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}
function getAvatarColor(name = "") {
  const colors = ["#1a56db","#7c3aed","#059669","#dc2626","#d97706","#0891b2"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function MediaBubble({ msg, isMe }) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}public/${msg.mediaPath}`;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.mediaPath || "");
  const isAudio = /\.(mp3|ogg|wav|m4a)$/i.test(msg.mediaPath || "");
  const isPdf = /\.pdf$/i.test(msg.mediaPath || "");

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt={msg.mediaName} style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, display: "block" }} />
      </a>
    );
  }
  if (isAudio) {
    return <audio controls src={url} style={{ maxWidth: 240 }} />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, color: isMe ? "#fff" : "#1a56db", textDecoration: "none" }}>
      {isPdf ? <PictureAsPdfIcon fontSize="small" /> : <InsertDriveFileIcon fontSize="small" />}
      <span style={{ fontSize: "0.85rem", textDecoration: "underline" }}>{msg.mediaName || "arquivo"}</span>
    </a>
  );
}

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const baseRef = useRef();
  const fileInputRef = useRef();
  const [contentMessage, setContentMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sendingMedia, setSendingMedia] = useState(false);

  const scrollToBottom = () => {
    if (baseRef.current) baseRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chat?.id) {
      try { api.post(`/chats/${chat.id}/read`, { userId: user.id }); } catch (err) {}
    }
    scrollToBottomRef.current = scrollToBottom;
    // eslint-disable-next-line
  }, []);

  const handleScroll = (e) => {
    if (e.currentTarget.scrollTop < 100 && pageInfo?.hasMore && !loading) handleLoadMore();
  };

  const handleKeyUp = (e) => {
    if (e.key === "Enter" && !e.shiftKey && contentMessage.trim()) {
      doSendText();
    }
  };

  const doSendText = () => {
    if (contentMessage.trim()) {
      handleSendMessage(contentMessage, null);
      setContentMessage("");
    }
  };

  const doSendFile = async () => {
    if (!mediaFile) return;
    setSendingMedia(true);
    try {
      await handleSendMessage("", mediaFile);
    } finally {
      setSendingMedia(false);
      setMediaFile(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setMediaFile(file);
    e.target.value = "";
  };

  const handleStartRecording = async () => {
    const recorder = await initRecorder();
    if (!recorder) return;
    try {
      await recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopRecording = async () => {
    const recorder = await initRecorder();
    if (!recorder) return;
    try {
      const [buffer, blob] = await recorder.stop().getMp3();
      const audioFile = new File(buffer, "audio.mp3", { type: blob.type, lastModified: Date.now() });
      setIsRecording(false);
      setSendingMedia(true);
      await handleSendMessage("", audioFile);
      setSendingMedia(false);
    } catch (err) {
      setIsRecording(false);
      console.error(err);
    }
  };

  const handleCancelRecording = async () => {
    const recorder = await initRecorder();
    if (!recorder) return;
    try { await recorder.stop(); } catch {}
    setIsRecording(false);
  };

  const handleEmojiSelect = (emoji) => {
    setContentMessage((prev) => prev + emoji.native);
    setShowEmoji(false);
  };

  const participants = chat?.users?.length || 0;

  return (
    <Paper className={classes.mainContainer} elevation={0}>
      {/* Header */}
      <div className={classes.chatHeader}>
        <div className={classes.headerAvatar} style={{ background: getAvatarColor(chat?.title || "") }}>
          {getInitials(chat?.title || "C")}
        </div>
        <div>
          <Typography className={classes.headerTitle}>{chat?.title || "Conversa"}</Typography>
          <Typography className={classes.headerSubtitle}>{participants} participante{participants !== 1 ? "s" : ""}</Typography>
        </div>
      </div>

      {/* Messages */}
      <div onScroll={handleScroll} className={classes.messageList}>
        {Array.isArray(messages) && messages.length === 0 && (
          <div className={classes.emptyState}>
            <span style={{ fontSize: 64 }}>💬</span>
            <Typography variant="body2">Sem mensagens ainda. Diga olá!</Typography>
          </div>
        )}
        {Array.isArray(messages) && messages.map((item, key) => {
          const isMe = item.senderId === user.id;
          const senderName = item.sender?.name || "Usuário";
          const timeStr = item.createdAt ? format(parseISO(item.createdAt), "HH:mm") : "";

          return (
            <div key={key} className={`${classes.messageRow} ${isMe ? classes.messageRowRight : classes.messageRowLeft}`}>
              {!isMe && (
                <Typography className={classes.senderName} style={{ color: getAvatarColor(senderName) }}>
                  {senderName}
                </Typography>
              )}
              <div className={isMe ? classes.bubbleRight : classes.bubbleLeft}>
                {item.mediaPath && <MediaBubble msg={item} isMe={isMe} />}
                {item.message && <span>{item.message}</span>}
              </div>
              <Typography className={classes.timestamp}>{timeStr}</Typography>
            </div>
          );
        })}
        <div ref={baseRef} />
      </div>

      {/* File preview bar */}
      {mediaFile && (
        <div className={classes.filePreview}>
          {/image\//i.test(mediaFile.type) ? <InsertDriveFileIcon fontSize="small" style={{ color: "#1a56db" }} /> : <InsertDriveFileIcon fontSize="small" style={{ color: "#1a56db" }} />}
          <Typography className={classes.filePreviewName}>{mediaFile.name}</Typography>
          <IconButton size="small" onClick={() => setMediaFile(null)}>
            <CancelIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" className={classes.sendBtn} onClick={doSendFile} disabled={sendingMedia}>
            {sendingMedia ? <CircularProgress size={18} style={{ color: "#fff" }} /> : <SendIcon style={{ fontSize: 18 }} />}
          </IconButton>
        </div>
      )}

      {/* Input Area */}
      <div className={classes.inputArea}>
        {/* Emoji picker */}
        {showEmoji && (
          <div className={classes.emojiBox}>
            <ClickAwayListener onClickAway={() => setShowEmoji(false)}>
              <div>
                <Picker
                  showPreview={false}
                  showSkinTones={false}
                  onSelect={handleEmojiSelect}
                  theme="light"
                  set="apple"
                  i18n={{ search: "Buscar", categories: { search: "Resultados", recent: "Recentes" } }}
                />
              </div>
            </ClickAwayListener>
          </div>
        )}

        <Tooltip title="Emoji">
          <IconButton size="small" className={classes.iconBtn} onClick={() => setShowEmoji(!showEmoji)}>
            <MoodIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Anexar arquivo">
          <IconButton size="small" className={classes.iconBtn} onClick={() => fileInputRef.current.click()}>
            <AttachFileIcon />
          </IconButton>
        </Tooltip>
        <input
          type="file"
          ref={fileInputRef}
          className={classes.uploadInput}
          accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileChange}
        />

        {isRecording ? (
          <div className={classes.recorderWrapper}>
            <Tooltip title="Cancelar">
              <IconButton size="small" onClick={handleCancelRecording}>
                <HighlightOffIcon style={{ color: "#dc2626" }} />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" style={{ color: "#dc2626", flex: 1 }}>
              🔴 Gravando... (clique ✓ para enviar)
            </Typography>
            <Tooltip title="Enviar áudio">
              <IconButton size="small" onClick={handleStopRecording}>
                <CheckCircleOutlineIcon style={{ color: "#059669" }} />
              </IconButton>
            </Tooltip>
          </div>
        ) : (
          <>
            <InputBase
              className={classes.inputBase}
              multiline
              rowsMax={4}
              placeholder="Digite uma mensagem... (Enter para enviar)"
              value={contentMessage}
              onChange={(e) => setContentMessage(e.target.value)}
              onKeyUp={handleKeyUp}
            />
            {contentMessage ? (
              <Tooltip title="Enviar">
                <IconButton className={classes.sendBtn} size="small" onClick={doSendText}>
                  <SendIcon style={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Gravar áudio">
                <IconButton size="small" className={classes.micBtn} onClick={handleStartRecording}>
                  <MicIcon />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </Paper>
  );
}
