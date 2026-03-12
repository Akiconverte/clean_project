import React, { useState, useEffect } from "react";
import {
    makeStyles,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    IconButton,
    Tabs,
    Tab,
    Box,
    Slider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PublishIcon from "@material-ui/icons/Publish";
import DeleteIcon from "@material-ui/icons/Delete";
import { toast } from "react-toastify";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    dialogPaper: {
        borderRadius: "12px", // Cantos fortemente arredondados conforme a regra (Premium estigma)
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        minWidth: "600px",
        [theme.breakpoints.down("sm")]: {
            minWidth: "100%",
        },
    },
    titleDialog: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    closeButton: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.text.secondary,
    },
    textField: {
        margin: theme.spacing(1, 0),
    },
    tabPanel: {
        padding: theme.spacing(2, 0),
        color: theme.palette.text.primary,
    },
    sliderContainer: {
        marginTop: theme.spacing(3),
        padding: theme.spacing(0, 2),
        color: theme.palette.text.primary,
    },
    uploadSection: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        border: `2px dashed ${theme.palette.primary.main}`,
        borderRadius: "8px",
        textAlign: "center",
        backgroundColor: theme.palette.background.default,
    },
    uploadButton: {
        marginTop: theme.spacing(1),
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
    },
    listItem: {
        backgroundColor: theme.palette.background.default,
        marginBottom: theme.spacing(1),
        borderRadius: "8px",
        color: theme.palette.text.primary,
    },
}));

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`ai-agent-tabpanel-${index}`}
            aria-labelledby={`ai-agent-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={1}>{children}</Box>}
        </div>
    );
}

const AIAgentModal = ({ open, onClose, agentId }) => {
    const classes = useStyles();
    const [tabIndex, setTabIndex] = useState(0);

    // Estados dos recursos do IA Centralizados na Feature
    const [promptBase, setPromptBase] = useState("");
    const [extraCommands, setExtraCommands] = useState("");
    const [temperature, setTemperature] = useState(0.5);
    const [promptFiles, setPromptFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && agentId) {
            loadAgentData();
            loadPromptFiles();
        }
    }, [open, agentId]);

    const loadAgentData = async () => {
        try {
            // Busca as configurações centrais
            const { data } = await api.get(`/ai-agents/1`);
            setPromptBase(data.prompt || "");
            setExtraCommands(data.extraCommands || "");
            setTemperature(data.temperature || 0.5);
        } catch (err) { }
    };

    const loadPromptFiles = async () => {
        try {
            const { data } = await api.get(`/prompt-files/agent/1`);
            setPromptFiles(data);
        } catch (err) { }
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleClose = () => {
        setPromptBase("");
        setExtraCommands("");
        setTemperature(0.5);
        setPromptFiles([]);
        setTabIndex(0);
        onClose();
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            // Salva na conexão 1 como sendo as configs do "Agente Global"
            await api.post(`/ai-agents`, {
                whatsappId: 1,
                promptBase,
                extraCommands,
                temperature
            });
            toast.success("Configurações da Inteligência Artificial salvas com sucesso!");
            handleClose();
        } catch (err) {
            toast.error("Erro ao salvar IA.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUploadFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["application/pdf", "text/plain"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Apenas arquivos PDF ou TXT são permitidos.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("agentId", agentId);

        try {
            await api.post("/prompt-files", formData);
            toast.success("Arquivo anexado à base de conhecimento!");
            loadPromptFiles();
        } catch (err) {
            toast.error("Erro ao enviar arquivo.");
        }
    };

    const handleDeleteFile = async (fileId) => {
        try {
            await api.delete(`/prompt-files/${fileId}`);
            toast.success("Arquivo removido.");
            loadPromptFiles();
        } catch (err) {
            toast.error("Erro ao remover arquivo.");
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            classes={{ paper: classes.dialogPaper }}
        >
            <DialogTitle className={classes.titleDialog}>
                Configurar Agente IA
                <IconButton
                    aria-label="close"
                    className={classes.closeButton}
                    onClick={handleClose}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="Prompt e Persona" />
                    <Tab label="RAG (Base de Conhecimento)" />
                </Tabs>

                {/* Tab 1: Construção do Robô e Configurações */}
                <TabPanel value={tabIndex} index={0} className={classes.tabPanel}>
                    <Typography variant="subtitle2" gutterBottom>
                        Qual é o papel desse Robô na empresa?
                    </Typography>
                    <TextField
                        label="Prompt Base (Identidade / Instruções Principais)"
                        multiline
                        minRows={5}
                        fullWidth
                        variant="outlined"
                        value={promptBase}
                        onChange={(e) => setPromptBase(e.target.value)}
                        className={classes.textField}
                        placeholder='Ex: Você é a Sofia, consultora da "Creative Lions". Seja sempre educada e direta...'
                    />

                    <TextField
                        label="Comandos Extras / Formatação"
                        multiline
                        minRows={3}
                        fullWidth
                        variant="outlined"
                        value={extraCommands}
                        onChange={(e) => setExtraCommands(e.target.value)}
                        className={classes.textField}
                        placeholder="Ex: Nunca responda sobre concorrentes. Deixe todas as respostas em no máximo 2 parágrafos."
                    />

                    <div className={classes.sliderContainer}>
                        <Typography id="temperature-slider" gutterBottom>
                            Temperatura / Criatividade ({temperature})
                        </Typography>
                        <Slider
                            value={temperature}
                            onChange={(e, val) => setTemperature(val)}
                            step={0.1}
                            marks
                            min={0}
                            max={1}
                            valueLabelDisplay="auto"
                            aria-labelledby="temperature-slider"
                        />
                        <Typography variant="caption" color="textSecondary">
                            * 0 é mais lógico e engessado. 1 é mais criativo e humanizado.
                        </Typography>
                    </div>
                </TabPanel>

                {/* Tab 2: RAG (Leitura de PDF / TXT) */}
                <TabPanel value={tabIndex} index={1} className={classes.tabPanel}>
                    <Typography variant="body1">
                        Anexe PDFs de manuais, tabelas de preços ou FAQs (TXT). A IA lerá
                        este contexto dinamicamente antes de responder.
                    </Typography>

                    <Box className={classes.uploadSection}>
                        <input
                            accept=".pdf,.txt"
                            style={{ display: "none" }}
                            id="upload-rag-file"
                            type="file"
                            onChange={handleUploadFile}
                        />
                        <label htmlFor="upload-rag-file">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<PublishIcon />}
                                className={classes.uploadButton}
                            >
                                Anexar Documento (.pdf, .txt)
                            </Button>
                        </label>
                    </Box>

                    <List>
                        {promptFiles.map((f) => (
                            <ListItem key={f.id} className={classes.listItem}>
                                <ListItemText
                                    primary={f.name}
                                    secondary={`Adicionado em: ${new Date().toLocaleDateString()}`}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => handleDeleteFile(f.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                        {promptFiles.length === 0 && (
                            <Typography variant="caption" style={{ display: 'block', marginTop: 16 }}>
                                Nenhum arquivo de contexto anexado a este Agente.
                            </Typography>
                        )}
                    </List>
                </TabPanel>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="secondary" disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Salvando..." : "Salvar Configurações"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AIAgentModal;
