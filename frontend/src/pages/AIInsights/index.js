import React, { useState, useEffect, useRef } from "react";
import {
    Container,
    Grid,
    Paper,
    Typography,
    makeStyles,
    useTheme,
    Card,

    CardContent,
    Avatar,
    LinearProgress,
    TextField,
    IconButton,
    Box,
    Button
} from "@material-ui/core";
import AssessmentIcon from "@material-ui/icons/Assessment";
import HappyIcon from "@material-ui/icons/SentimentVerySatisfied";
import SadIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import EmojiObjectsOutlinedIcon from "@material-ui/icons/EmojiObjectsOutlined";
import ChatIcon from "@material-ui/icons/Chat";
import SendIcon from "@material-ui/icons/Send";
import RobotIcon from "@material-ui/icons/Android";
import PersonIcon from "@material-ui/icons/Person";
import logoia from "../../assets/logoia.png";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    header: {
        marginBottom: theme.spacing(4),
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(1)
    },
    welcomeText: {
        fontSize: "1.8rem",
        fontWeight: 700,
        color: "#333"
    },
    subtitleText: {
        color: "#666",
        fontSize: "1rem"
    },
    cardInsight: {
        borderRadius: 20,
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)",
        height: "100%",
        border: "none",
        overflow: "hidden"
    },
    statCard: {
        padding: theme.spacing(3),
        borderRadius: 20,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: 160,
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s ease",
        "&:hover": {
            transform: "translateY(-5px)"
        }
    },
    blueCard: { background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)" },
    orangeCard: { background: "linear-gradient(135deg, #ea580c 0%, #fb923c 100%)" },
    greenCard: { background: "linear-gradient(135deg, #15803d 0%, #4ade80 100%)" },
    purpleCard: { background: "linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)" },
    
    statTitle: { fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 },
    statValue: { fontSize: "2.4rem", fontWeight: 800, margin: theme.spacing(1, 0) },
    
    cardIconBackground: {
        position: "absolute",
        right: -10,
        bottom: -10,
        fontSize: "6rem",
        opacity: 0.15,
        transform: "rotate(-15deg)"
    },
    trendBadge: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: "0.75rem",
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 4
    },
    
    // Estilos do Chat (Dark Mode Inspirado no Exemplo)
    chatContainer: {
        height: 550,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
        borderRadius: 20,
        overflow: "hidden",
        maxWidth: 900,
        margin: "0 auto",
    },
    messageList: {
        flexGrow: 1,
        padding: theme.spacing(3),
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(2),
        backgroundColor: "#000",
        backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "20px 20px"
    },
    messageBubble: {
        padding: theme.spacing(2),
        borderRadius: 20,
        maxWidth: "85%",
        lineHeight: 1.5,
        boxShadow: "0px 2px 10px rgba(0,0,0,0.2)"
    },
    aiMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#1c1c1e",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.05)",
        borderTopLeftRadius: 4,
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#3b82f6",
        color: "#fff",
        borderTopRightRadius: 4,
    },
    inputAreaWrapper: {
        padding: theme.spacing(2, 3),
        backgroundColor: "#000",
        borderTop: "1px solid rgba(255,255,255,0.1)",
    },
    inputArea: {
        backgroundColor: "#1c1c1e",
        borderRadius: 30,
        padding: "8px 16px",
        display: "flex",
        gap: theme.spacing(2),
        alignItems: "center",
        border: "1px solid rgba(255,255,255,0.1)",
    },
    inputField: {
        color: "#fff",
        "&::placeholder": {
            color: "rgba(255,255,255,0.4)"
        }
    },
    suggestionButton: {
        margin: theme.spacing(0.5),
        borderRadius: 12,
        textTransform: "none",
        backgroundColor: "#1c1c1e",
        borderColor: "rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.8)",
        "&:hover": {
            backgroundColor: "#2c2c2e"
        }
    }
}));

const AIInsights = () => {
    const classes = useStyles();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);

    const [sending, setSending] = useState(false);
    const [stats, setStats] = useState({ 
        categories: [], 
        sentiment: {}, 
        global: { pending: 0, open: 0, closed: 0 },
        distribution: [],
        lastDica: ""
    });
    
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([
        { role: "ai", text: "Olá! Sou o seu Strategic Lion. Como posso ajudar com os insights do seu negócio hoje?" }
    ]);
    
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchData = async () => {
        try {
            const { data } = await api.get("/ticket-insights/stats");
            setStats(data);
            setLoading(false);
        } catch (err) {
            toastError(err);
            setLoading(false);
        }
    };

    const handleSendMessage = async (msgText) => {
        const textToSearch = msgText || question;
        if (!textToSearch.trim()) return;

        const newMessages = [...messages, { role: "user", text: textToSearch }];
        setMessages(newMessages);
        setQuestion("");
        setSending(true);

        try {
            const { data } = await api.post("/ticket-insights/chat", { question: textToSearch });
            setMessages([...newMessages, { role: "ai", text: data.response }]);
        } catch (err) {
            toastError(err);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <LinearProgress />;

    return (
        <Container maxWidth="xl" className={classes.container}>
            <div className={classes.header}>
                <Typography className={classes.welcomeText}>
                    Olá, bem-vindo à sua Central de Inteligência
                </Typography>
                <Typography className={classes.subtitleText}>
                    Aqui você acompanha a saúde do seu atendimento e insights da IA em tempo real.
                </Typography>
            </div>

            <Grid container spacing={3}>
                {/* Dashboard Stats Premium */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper className={`${classes.statCard} ${classes.blueCard}`}>
                        <AssessmentIcon className={classes.cardIconBackground} />
                        <Typography className={classes.statTitle}>Em Atendimento</Typography>
                        <Typography className={classes.statValue}>{stats.global.open}</Typography>
                        <div className={classes.trendBadge}>
                            ATIVOS AGORA
                        </div>
                    </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Paper className={`${classes.statCard} ${classes.orangeCard}`}>
                        <ChatIcon className={classes.cardIconBackground} />
                        <Typography className={classes.statTitle}>Aguardando</Typography>
                        <Typography className={classes.statValue}>{stats.global.pending}</Typography>
                        <div className={classes.trendBadge}>
                            FILA DE ESPERA
                        </div>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper className={`${classes.statCard} ${classes.greenCard}`}>
                        <HappyIcon className={classes.cardIconBackground} />
                        <Typography className={classes.statTitle}>Satisfação IA</Typography>
                        <Typography className={classes.statValue}>
                            {stats.sentiment?.averageSentiment ? parseFloat(stats.sentiment.averageSentiment).toFixed(1) : "0.0"}
                        </Typography>
                        <div className={classes.trendBadge}>
                            MÉDIA GLOBAL / 5
                        </div>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper className={`${classes.statCard} ${classes.purpleCard}`}>
                        <RobotIcon className={classes.cardIconBackground} />
                        <Typography className={classes.statTitle}>Total Analisado</Typography>
                        <Typography className={classes.statValue}>{stats.sentiment?.totalInsights || 0}</Typography>
                        <div className={classes.trendBadge}>
                            PELA INTELIGÊNCIA
                        </div>
                    </Paper>
                </Grid>

                {/* IA CONSULTANT CHAT SECTION */}
                <Grid item xs={12} md={8}>
                    <Card className={classes.cardInsight} style={{ backgroundColor: "#000" }}>
                        <CardContent style={{ height: "100%", display: "flex", flexDirection: "column", padding: 0 }}>
                            <Box p={2.5} display="flex" alignItems="center" gap={2} borderBottom="1px solid rgba(255,255,255,0.1)" bgcolor="#000">
                                <Avatar 
                                    src={logoia} 
                                    style={{ 
                                        width: 56, 
                                        height: 56, 
                                        border: "2px solid #3b82f6",
                                        boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.4)" 
                                    }} 
                                />
                                <div>
                                    <Typography variant="h6" style={{ fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "0.5px" }}>Strategic Lion</Typography>
                                    <Box display="flex" alignItems="center" gap={0.8} mt={0.5}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0px 0px 8px #10b981" }} />
                                        <Typography variant="caption" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>IA treinada com os dados do seu negócio</Typography>
                                    </Box>
                                </div>
                            </Box>

                            <div className={classes.chatContainer}>
                                <div className={classes.messageList} ref={scrollRef}>
                                    {messages.map((m, i) => (
                                        <div key={i} className={`${classes.messageBubble} ${m.role === "ai" ? classes.aiMessage : classes.userMessage}`}>
                                            <Typography variant="body2" style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>
                                                {m.text}
                                            </Typography>
                                        </div>
                                    ))}
                                    {sending && (
                                        <div className={`${classes.messageBubble} ${classes.aiMessage}`}>
                                            <Typography variant="body2" color="textSecondary">Consultando banco de dados...</Typography>
                                            <LinearProgress style={{ marginTop: 12, borderRadius: 4, height: 4 }} />
                                        </div>
                                    )}
                                </div>

                                <Box p={2} display="flex" flexWrap="wrap" gap={1} bgcolor="#000">
                                    <Button 
                                        size="small" variant="outlined" className={classes.suggestionButton}
                                        onClick={() => handleSendMessage("Quais as maiores dúvidas hoje?")}
                                        disabled={sending}
                                    >
                                        Dúvidas frequentes?
                                    </Button>
                                    <Button 
                                        size="small" variant="outlined" className={classes.suggestionButton}
                                        onClick={() => handleSendMessage("Resuma o sentimento dos clientes")}
                                        disabled={sending}
                                    >
                                        Humor dos clientes?
                                    </Button>
                                </Box>

                                <div className={classes.inputAreaWrapper}>
                                    <div className={classes.inputArea}>
                                        <TextField
                                            fullWidth
                                            placeholder="Digite sua dúvida estratégica..."
                                            variant="standard"
                                            InputProps={{ 
                                                disableUnderline: true,
                                                className: classes.inputField
                                            }}
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                            disabled={sending}
                                        />
                                        <IconButton 
                                            style={{ backgroundColor: "#3b82f6", color: "#fff" }} 
                                            onClick={() => handleSendMessage()} 
                                            disabled={sending || !question.trim()}
                                            size="small"
                                        >
                                            <SendIcon fontSize="small" />
                                        </IconButton>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Categorias e Dicas Lado a Lado */}
                <Grid item xs={12} md={4}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Card className={classes.cardInsight}>
                                <CardContent p={3}>
                                    <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 20 }}>Categorias de Dúvida</Typography>
                                    {stats.categories.map((cat, index) => (
                                        <Box key={index} mb={2.5}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="body2" style={{ fontWeight: 500 }}>{cat.mainDoubt}</Typography>
                                                <Typography variant="caption" style={{ color: "#3b82f6", fontWeight: 700 }}>{cat.count} casos</Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={(cat.count / (stats.sentiment.totalInsights || 1)) * 100} 
                                                style={{ height: 8, borderRadius: 4, backgroundColor: "#f3f4f6" }}
                                            />
                                        </Box>
                                    ))}
                                    {stats.categories.length === 0 && (
                                        <Typography variant="body2" color="textSecondary">Nenhum dado categorizado ainda.</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Card className={classes.cardInsight} style={{ background: "#1f2937", color: "#fff" }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                        <EmojiObjectsOutlinedIcon style={{ color: "#fbbf24" }} />
                                        <Typography variant="h6" style={{ fontWeight: 700 }}>Dica da IA</Typography>
                                    </Box>
                                    <Typography variant="body2" style={{ fontStyle: "italic", opacity: 0.9, lineHeight: 1.6 }}>
                                        "{stats.lastDica}"
                                    </Typography>
                                    <Box mt={3} p={1.5} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12 }}>
                                        <Typography variant="caption" style={{ opacity: 0.7 }}>
                                            Insight baseado no último atendimento finalizado.
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};


export default AIInsights;
