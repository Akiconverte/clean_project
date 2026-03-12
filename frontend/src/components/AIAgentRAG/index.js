import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    CircularProgress,
    Divider
} from "@material-ui/core";
import {
    Publish as PublishIcon,
    Delete as DeleteIcon,
    Description as DescriptionIcon
} from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";

const AIAgentRAG = ({ whatsappId }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (whatsappId) {
            loadFiles();
        }
    }, [whatsappId]);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/prompt-files/agent/${whatsappId}`);
            setFiles(data);
        } catch (err) {
            toast.error("Erro ao carregar arquivos da base de conhecimento.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["application/pdf", "text/plain"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Apenas arquivos PDF ou TXT são permitidos.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("whatsappId", whatsappId);

        try {
            await api.post("/prompt-files", formData);
            toast.success("Arquivo enviado com sucesso!");
            loadFiles();
        } catch (err) {
            toast.error("Erro ao enviar arquivo.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileId) => {
        try {
            await api.delete(`/prompt-files/${fileId}`);
            toast.success("Arquivo removido.");
            loadFiles();
        } catch (err) {
            toast.error("Erro ao remover arquivo.");
        }
    };

    return (
        <Box style={{ marginTop: 16 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2" style={{ fontWeight: 500 }}>
                    Arquivos de Treinamento
                </Typography>
                <input
                    accept=".pdf,.txt"
                    style={{ display: "none" }}
                    id="upload-button-rag"
                    type="file"
                    onChange={handleUpload}
                />
                <label htmlFor="upload-button-rag">
                    <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        size="small"
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <PublishIcon />}
                        disabled={uploading || !whatsappId}
                    >
                        {uploading ? "Enviando..." : "Subir Arquivo"}
                    </Button>
                </label>
            </Box>

            <Divider />

            {loading ? (
                <Box display="flex" justifyContent="center" m={2}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <List dense>
                    {files.length === 0 ? (
                        <Typography variant="caption" color="textSecondary" style={{ padding: 8, textAlign: "center", display: "block" }}>
                            Nenhum arquivo anexado para este número.
                        </Typography>
                    ) : (
                        files.map((file) => (
                            <ListItem key={file.id}>
                                <ListItemText
                                    primary={file.name}
                                    secondary={new Date(file.createdAt).toLocaleDateString()}
                                    primaryTypographyProps={{ variant: "body2", noWrap: true }}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => handleDelete(file.id)} size="small">
                                        <DeleteIcon fontSize="small" color="secondary" />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))
                    )}
                </List>
            )}
        </Box>
    );
};

export default AIAgentRAG;
