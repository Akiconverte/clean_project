import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Paper, CircularProgress } from "@material-ui/core";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        padding: "0",
        overflow: "hidden",
    },
    iframe: {
        flex: 1,
        width: "100%",
        height: "100%",
        border: "none",
    },
    center: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: theme.spacing(4),
    },
    noUrl: {
        padding: theme.spacing(6),
        textAlign: "center",
        maxWidth: 480,
        width: "100%",
        borderRadius: 16,
        boxShadow: theme.shadows[4],
    },
    icon: {
        fontSize: 64,
        color: theme.palette.text.disabled,
        marginBottom: theme.spacing(2),
    },
}));

const N8N = () => {
    const classes = useStyles();
    const [n8nUrl, setN8nUrl] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUrl = async () => {
            try {
                const { data } = await api.get("/settings");
                const urlSetting = data.find(s => s.key === "n8nUrl");
                if (urlSetting && urlSetting.value) {
                    // Use the NGINX proxy port (5679) instead of direct (5678) 
                    // to strip X-Frame-Options and allow iframe embedding
                    const proxyUrl = urlSetting.value.replace(":5678", ":5679");
                    setN8nUrl(proxyUrl);
                }
            } catch (err) {
                toastError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUrl();
    }, []);

    if (loading) {
        return (
            <div className={classes.center}>
                <CircularProgress />
            </div>
        );
    }

    if (!n8nUrl) {
        return (
            <div className={classes.center}>
                <Paper className={classes.noUrl}>
                    <AccountTreeIcon className={classes.icon} />
                    <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 8 }}>
                        URL do n8n não configurada
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Vá em <strong>Configurações</strong> e preencha o campo <strong>"URL do n8n"</strong> para ativar essa funcionalidade.
                    </Typography>
                </Paper>
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <iframe
                src={n8nUrl}
                title="n8n Workflow"
                className={classes.iframe}
                allow="clipboard-read; clipboard-write"
            />
        </div>
    );
};

export default N8N;
