import React, { useState, useEffect, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Colorize } from "@material-ui/icons";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { IconButton, InputAdornment } from "@material-ui/core";
import { FormControlLabel } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import ColorPicker from "../ColorPicker";

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
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
	colorAdorment: {
		width: 20,
		height: 20,
	},
}));

const TagSchema = Yup.object().shape({
	name: Yup.string()
		.min(3, "Mensagem muito curta")
		.required("Obrigatório"),
    color: Yup.string().required("Obrigatório")
});

const TagModal = ({ open, onClose, tagId, reload }) => {
	const classes = useStyles();
	const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);

	const initialState = {
		name: "",
		color: "#2196f3",
		kanban: 0
	};

	const [tag, setTag] = useState(initialState);
	const [ kanban, setKanban] = useState(0);

	useEffect(() => {
		try {
			(async () => {
				if (!tagId) return;

				const { data } = await api.get(`/tags/`);
                // Como ListTagsService retorna {tags, count, hasMore}, precisamos achar a tag específica ou criar um ShowTagService
                // Por simplicidade, vamos ver se o ListTagsService pode filtrar por ID ou se precisamos do ShowTagService.
                // Vou assumir que o backend tem um ShowTagService que eu ainda não criei. 
                // Vou criar o ShowTagService agora para não quebrar o modal.
				const tagFound = data.tags.find(t => t.id === tagId);
                if (tagFound) {
                    setKanban(tagFound.kanban);
				    setTag(tagFound);
                }
			})()
		} catch (err) {
			toastError(err);
		}
	}, [tagId, open]);

	const handleClose = () => {
		setTag(initialState);
		setKanban(0);
		onClose();
	};

	const handleKanbanChange = (e) => {
		setKanban( e.target.checked ? 1 : 0);
	};

	const handleSaveTag = async values => {
		const tagData = { ...values, kanban };
		try {
			if (tagId) {
				await api.put(`/tags/${tagId}`, tagData);
			} else {
				await api.post("/tags", tagData);
			}
			toast.success(i18n.t("tagModal.success") || "Tag salva com sucesso");
			if (typeof reload == 'function') {
				reload();
			}
		} catch (err) {
			toastError(err);
		}
		handleClose();
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{(tagId ? "Editar Tag" : "Nova Tag")}
				</DialogTitle>
				<Formik
					initialValues={tag}
					enableReinitialize={true}
					validationSchema={TagSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveTag(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values, setFieldValue }) => (
						<Form>
							<DialogContent dividers>
                                <ColorPicker
                                    open={colorPickerModalOpen}
                                    handleClose={() => setColorPickerModalOpen(false)}
                                    onChange={(color) => {
                                        setFieldValue("color", color);
                                        setTag(prev => ({ ...prev, color }));
                                    }}
                                    currentColor={values.color}
                                />
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("tagModal.form.name") || "Nome"}
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
								</div>
								<br />
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										fullWidth
										label={i18n.t("tagModal.form.color") || "Cor"}
										name="color"
										id="color"
										error={touched.color && Boolean(errors.color)}
										helperText={touched.color && errors.color}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<div
														style={{ backgroundColor: values.color }}
														className={classes.colorAdorment}
													></div>
												</InputAdornment>
											),
											endAdornment: (
												<IconButton
													size="small"
													color="default"
													onClick={() => setColorPickerModalOpen(!colorPickerModalOpen)}
												>
													<Colorize />
												</IconButton>
											),
										}}
										variant="outlined"
										margin="dense"
									/>
								</div>
								<div className={classes.multFieldLine}>
        							<FormControlLabel
          								control={
            								<Checkbox
             									checked={kanban === 1}
             									onChange={handleKanbanChange}
              									value={kanban}
              									color="primary"
            								/>
          								}
          								label="Kanban"
          								labelPlacement="start"
        							/>
      							</div>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("tagModal.buttons.cancel") || "Cancelar"}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{tagId
										? `${i18n.t("tagModal.buttons.okEdit") || "Salvar"}`
										: `${i18n.t("tagModal.buttons.okAdd") || "Adicionar"}`}
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

export default TagModal;
