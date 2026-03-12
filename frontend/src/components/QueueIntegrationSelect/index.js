import React, { useState, useEffect } from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        flex: 1,
    },
}));

const QueueIntegrationSelect = ({ value, onChange }) => {
    const classes = useStyles();
    const [integrations, setIntegrations] = useState([]);

    useEffect(() => {
        const fetchIntegrations = async () => {
            try {
                const { data } = await api.get("/queueIntegration");
                setIntegrations(data.queueIntegrations);
            } catch (err) {
                toastError(err);
            }
        };
        fetchIntegrations();
    }, []);

    return (
        <FormControl variant="outlined" className={classes.formControl} margin="dense" fullWidth>
            <InputLabel>{i18n.t("queueModal.form.integrationId")}</InputLabel>
            <Select
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                label={i18n.t("queueModal.form.integrationId")}
            >
                <MenuItem value="">
                    <em>Nenhuma</em>
                </MenuItem>
                {integrations.map((integration) => (
                    <MenuItem key={integration.id} value={integration.id}>
                        {integration.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default QueueIntegrationSelect;
