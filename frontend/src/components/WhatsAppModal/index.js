import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import {
	Dialog,
	DialogContent,
	DialogTitle,
	Button,
	DialogActions,
	CircularProgress,
	TextField,
	Switch,
	FormControlLabel,
	Divider,
	Typography,
} from "@material-ui/core";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import QueueIntegrationSelect from "../QueueIntegrationSelect";
import AIAgentRAG from "../AIAgentRAG";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},

	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
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
}));

const SessionSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
	const classes = useStyles();
	const initialState = {
		name: "",
		greetingMessage: "",
		farewellMessage: "",
		isDefault: false,
		useAIAgent: false,
		aiAgentPrompt: "",
		aiAgentExtraCommands: "",
		aiAgentTemperature: 0.5,
		webhookUrl: "",
		webhookToken: "",
		integrationId: "",
	};
	const [whatsApp, setWhatsApp] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;

			try {
				const { data } = await api.get(`whatsapp/${whatsAppId}`);
				setWhatsApp(data);

				const whatsQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(whatsQueueIds);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId]);

	const handleSaveWhatsApp = async values => {
		const whatsappData = { ...values, queueIds: selectedQueueIds };

		try {
			if (whatsAppId) {
				await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
			} else {
				await api.post("/whatsapp", whatsappData);
			}
			toast.success(i18n.t("whatsappModal.success"));
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	const handleClose = () => {
		onClose();
		setWhatsApp(initialState);
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				scroll="paper"
			>
				<DialogTitle>
					{whatsAppId
						? i18n.t("whatsappModal.title.edit")
						: i18n.t("whatsappModal.title.add")}
				</DialogTitle>
				<Formik
					initialValues={whatsApp}
					enableReinitialize={true}
					validationSchema={SessionSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveWhatsApp(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, touched, errors, isSubmitting, setFieldValue }) => (
						<Form>
							<DialogContent dividers>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("whatsappModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										className={classes.textField}
									/>
									<FormControlLabel
										control={
											<Field
												as={Switch}
												color="primary"
												name="isDefault"
												checked={values.isDefault}
											/>
										}
										label={i18n.t("whatsappModal.form.default")}
									/>
								</div>
								<div>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.greetingMessage")}
										type="greetingMessage"
										multiline
										rows={5}
										fullWidth
										name="greetingMessage"
										error={
											touched.greetingMessage && Boolean(errors.greetingMessage)
										}
										helperText={
											touched.greetingMessage && errors.greetingMessage
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
								<div>
									<Field
										as={TextField}
										label={i18n.t("whatsappModal.form.farewellMessage")}
										type="farewellMessage"
										multiline
										rows={5}
										fullWidth
										name="farewellMessage"
										error={
											touched.farewellMessage && Boolean(errors.farewellMessage)
										}
										helperText={
											touched.farewellMessage && errors.farewellMessage
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
								<FormControlLabel
									control={
										<Field
											as={Switch}
											color="primary"
											name="useAIAgent"
											checked={values.useAIAgent}
										/>
									}
									label={i18n.t("whatsappModal.form.useAIAgent")}
								/>

								{values.useAIAgent && (
									<>
										<Divider style={{ margin: "16px 0" }} />
										<Typography variant="subtitle1" gutterBottom style={{ fontWeight: "bold" }}>
											Personalidade e Instruções
										</Typography>
										<Field
											as={TextField}
											label={i18n.t("whatsappModal.form.aiAgentPrompt")}
											multiline
											rows={4}
											fullWidth
											name="aiAgentPrompt"
											error={touched.aiAgentPrompt && Boolean(errors.aiAgentPrompt)}
											helperText={touched.aiAgentPrompt && errors.aiAgentPrompt}
											variant="outlined"
											margin="dense"
											placeholder='Ex: Você é a Sofia, consultora técnica...'
										/>
										<Field
											as={TextField}
											label={i18n.t("whatsappModal.form.aiAgentExtraCommands")}
											multiline
											rows={2}
											fullWidth
											name="aiAgentExtraCommands"
											error={touched.aiAgentExtraCommands && Boolean(errors.aiAgentExtraCommands)}
											helperText={touched.aiAgentExtraCommands && errors.aiAgentExtraCommands}
											variant="outlined"
											margin="dense"
											placeholder='Ex: Use emojis. Não mencione preços.'
										/>
										<Field
											as={TextField}
											label={i18n.t("whatsappModal.form.aiAgentTemperature")}
											name="aiAgentTemperature"
											step={0.1}
											min={0}
											max={1}
											type="number"
											variant="outlined"
											margin="dense"
											fullWidth
										/>

										<Divider style={{ margin: "16px 0" }} />
										<Typography variant="subtitle1" gutterBottom style={{ fontWeight: "bold" }}>
											Base de Conhecimento (Arquivos PDF/TXT)
										</Typography>
										<Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 8 }}>
											Estes arquivos serão lidos pela IA antes de responder a qualquer cliente neste número.
										</Typography>

										{/* Componente de RAG será injetado aqui ou via Componente dedicado */}
										<AIAgentRAG whatsappId={whatsAppId} />

										<Divider style={{ margin: "16px 0" }} />
										<Typography variant="subtitle1" gutterBottom style={{ fontWeight: "bold" }}>
											Integração Webhook (n8n / Externo)
										</Typography>
										<Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 8 }}>
											Envie todos os eventos desta conexão para um sistema externo em tempo real.
										</Typography>
										<Field
											as={TextField}
											label="URL do Webhook"
											fullWidth
											name="webhookUrl"
											variant="outlined"
											margin="dense"
											placeholder='https://seu-n8n.com/webhook/...'
										/>
										<Field
											as={TextField}
											label="Token de Autenticação (Bearer)"
											fullWidth
											name="webhookToken"
											variant="outlined"
											margin="dense"
											placeholder='Token opcional para segurança'
										/>
									</>
								)}
								<QueueIntegrationSelect
									value={values.integrationId}
									onChange={val => setFieldValue("integrationId", val)}
								/>
								<QueueSelect
									selectedQueueIds={selectedQueueIds}
									onChange={selectedIds => setSelectedQueueIds(selectedIds)}
								/>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("whatsappModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{whatsAppId
										? i18n.t("whatsappModal.buttons.okEdit")
										: i18n.t("whatsappModal.buttons.okAdd")}
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

export default React.memo(WhatsAppModal);
