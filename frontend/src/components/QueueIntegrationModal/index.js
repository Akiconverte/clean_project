import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
    Select,
    InputLabel,
    MenuItem,
    FormControl,
    TextField,
    Grid,
    Paper,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
        gap: 4
    },
    textField: {
        marginRight: theme.spacing(1),
        flex: 1,
    },

    btnWrapper: {
        position: "relative",
    },

    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    btnLeft: {
        display: "flex",
        marginRight: "auto",
        marginLeft: 12,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
}));

const IntegrationSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Too Short!")
        .max(50, "Too Long!")
        .required("Required"),
});

const QueueIntegrationModal = ({ open, onClose, integrationId }) => {
    const classes = useStyles();

    const initialState = {
        type: "n8n",
        name: "",
        projectName: "",
        jsonContent: "",
        language: "pt-BR",
        urlN8N: "",
        typebotDelayMessage: 1000,
        typebotExpires: 1,
        typebotKeywordFinish: "",
        typebotKeywordRestart: "",
        typebotRestartMessage: "",
        typebotSlug: "",
        typebotUnknownMessage: "",
    };

    const [integration, setIntegration] = useState(initialState);

    useEffect(() => {
        (async () => {
            if (!integrationId) return;
            try {
                const { data } = await api.get(`/queueIntegration/${integrationId}`);
                setIntegration((prevState) => {
                    return { ...prevState, ...data };
                });
            } catch (err) {
                toastError(err);
            }
        })();

        return () => {
            setIntegration(initialState);
        };
    }, [integrationId, open]);

    const handleClose = () => {
        onClose();
        setIntegration(initialState);
    };

    const handleSaveIntegration = async (values) => {
        try {
            if (values.type === 'n8n' || values.type === 'webhook' || values.type === 'typebot') values.projectName = values.name
            if (integrationId) {
                await api.put(`/queueIntegration/${integrationId}`, values);
                toast.success(i18n.t("queueIntegrationModal.messages.editSuccess"));
            } else {
                await api.post("/queueIntegration", values);
                toast.success(i18n.t("queueIntegrationModal.messages.addSuccess"));
            }
            handleClose();
        } catch (err) {
            toastError(err);
        }
    };

    return (
        <div className={classes.root}>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" scroll="paper">
                <DialogTitle>
                    {integrationId
                        ? `${i18n.t("queueIntegrationModal.title.edit")}`
                        : `${i18n.t("queueIntegrationModal.title.add")}`}
                </DialogTitle>
                <Formik
                    initialValues={integration}
                    enableReinitialize={true}
                    validationSchema={IntegrationSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSaveIntegration(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values }) => (
                        <Form>
                            <Paper square elevation={1}>
                                <DialogContent dividers>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12} md={6}>
                                            <FormControl
                                                variant="outlined"
                                                className={classes.formControl}
                                                margin="dense"
                                                fullWidth
                                            >
                                                <InputLabel id="type-selection-input-label">
                                                    {i18n.t("queueIntegrationModal.form.type")}
                                                </InputLabel>

                                                <Field
                                                    as={Select}
                                                    label={i18n.t("queueIntegrationModal.form.type")}
                                                    name="type"
                                                    labelId="type-selection-label"
                                                    id="type"
                                                    required
                                                >
                                                    <MenuItem value="n8n">N8N</MenuItem>
                                                    <MenuItem value="webhook">WebHooks</MenuItem>
                                                    <MenuItem value="typebot">Typebot</MenuItem>
                                                </Field>
                                            </FormControl>
                                        </Grid>

                                        {(values.type === "n8n" || values.type === "webhook") && (
                                            <>
                                                <Grid item xs={12} md={6}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("queueIntegrationModal.form.name")}
                                                        autoFocus
                                                        required
                                                        name="name"
                                                        error={touched.name && Boolean(errors.name)}
                                                        helperText={touched.name && errors.name}
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("queueIntegrationModal.form.urlN8N")}
                                                        name="urlN8N"
                                                        error={touched.urlN8N && Boolean(errors.urlN8N)}
                                                        helperText={touched.urlN8N && errors.urlN8N}
                                                        variant="outlined"
                                                        margin="dense"
                                                        required
                                                        fullWidth
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                        {(values.type === "typebot") && (
                                            <>
                                                <Grid item xs={12} md={6}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("queueIntegrationModal.form.name")}
                                                        autoFocus
                                                        name="name"
                                                        error={touched.name && Boolean(errors.name)}
                                                        helperText={touched.name && errors.name}
                                                        variant="outlined"
                                                        margin="dense"
                                                        required
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("queueIntegrationModal.form.urlN8N")}
                                                        name="urlN8N"
                                                        error={touched.urlN8N && Boolean(errors.urlN8N)}
                                                        helperText={touched.urlN8N && errors.urlN8N}
                                                        variant="outlined"
                                                        margin="dense"
                                                        required
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("queueIntegrationModal.form.typebotSlug")}
                                                        name="typebotSlug"
                                                        required
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("queueIntegrationModal.form.typebotExpires")}
                                                        name="typebotExpires"
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("queueIntegrationModal.form.typebotDelayMessage")}
                                                        name="typebotDelayMessage"
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("queueIntegrationModal.form.typebotKeywordFinish")}
                                                        name="typebotKeywordFinish"
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("queueIntegrationModal.form.typebotKeywordRestart")}
                                                        name="typebotKeywordRestart"
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("queueIntegrationModal.form.typebotUnknownMessage")}
                                                        name="typebotUnknownMessage"
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("queueIntegrationModal.form.typebotRestartMessage")}
                                                        name="typebotRestartMessage"
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                </DialogContent>
                            </Paper>

                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isSubmitting}
                                    variant="outlined"
                                >
                                    {i18n.t("queueIntegrationModal.buttons.cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                    variant="contained"
                                    className={classes.btnWrapper}
                                >
                                    {integrationId
                                        ? `${i18n.t("queueIntegrationModal.buttons.okEdit")}`
                                        : `${i18n.t("queueIntegrationModal.buttons.okAdd")}`}
                                    {isSubmitting && (
                                        <CircularProgress
                                            size={24}
                                            className={classes.buttonProgress}
                                        />
                                    )}
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};

export default QueueIntegrationModal;
