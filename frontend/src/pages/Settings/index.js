import React, { useState, useEffect } from "react";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { toast } from "react-toastify";

import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import SaveIcon from "@material-ui/icons/Save";
import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(8, 8, 3),
	},

	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
		marginBottom: 12,

	},

	settingOption: {
		marginLeft: "auto",
	},
	margin: {
		margin: theme.spacing(1),
	},

}));

const Settings = () => {
	const classes = useStyles();

	const [settings, setSettings] = useState([]);
	const [tempN8nUrl, setTempN8nUrl] = useState("");

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/settings");
				setSettings(data);
				const n8nUrlSetting = data.find(s => s.key === "n8nUrl");
				if (n8nUrlSetting) {
					setTempN8nUrl(n8nUrlSetting.value);
				}
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("settings", data => {
			if (data.action === "update") {
				setSettings(prevState => {
					const aux = [...prevState];
					const settingIndex = aux.findIndex(s => s.key === data.setting.key);
					aux[settingIndex].value = data.setting.value;
					return aux;
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleChangeSetting = async e => {
		const selectedValue = e.target.value;
		const settingKey = e.target.name;

		try {
			await api.put(`/settings/${settingKey}`, {
				value: selectedValue,
			});
			toast.success(i18n.t("settings.success"));
		} catch (err) {
			toastError(err);
		}
	};

	const handleUpdateN8nUrl = async () => {
		try {
			await api.put(`/settings/n8nUrl`, {
				value: tempN8nUrl,
			});
			toast.success(i18n.t("settings.success"));
		} catch (err) {
			toastError(err);
		}
	};

	const handleUploadLogo = async (e, key) => {
		const file = e.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);
		formData.append("settingKey", key);

		try {
			await api.post("/settings/logo", formData);
			toast.success(i18n.t("settings.success"));
		} catch (err) {
			toastError(err);
		}
	};

	const getSettingValue = key => {
		const setting = settings.find(s => s.key === key);
		return setting ? setting.value : "";
	};

	return (
		<div className={classes.root}>
			<Container className={classes.container} maxWidth="md">
				<Typography variant="body2" gutterBottom>
					{i18n.t("settings.title")}
				</Typography>
				<Paper className={classes.paper}>
					<Typography variant="body1">
						{i18n.t("settings.settings.userCreation.name")}
					</Typography>
					<Select
						margin="dense"
						variant="outlined"
						native
						id="userCreation-setting"
						name="userCreation"
						value={
							settings && settings.length > 0 && getSettingValue("userCreation")
						}
						className={classes.settingOption}
						onChange={handleChangeSetting}
					>
						<option value="enabled">
							{i18n.t("settings.settings.userCreation.options.enabled")}
						</option>
						<option value="disabled">
							{i18n.t("settings.settings.userCreation.options.disabled")}
						</option>
					</Select>
				</Paper>

				<Paper className={classes.paper}>
					<TextField
						id="api-token-setting"
						readonly
						label="Token Api"
						margin="dense"
						variant="outlined"
						fullWidth
						value={settings && settings.length > 0 && getSettingValue("userApiToken")}
					/>
				</Paper>

				<Paper className={classes.paper}>
					<TextField
						id="n8n-url-setting"
						label="URL do n8n"
						name="n8nUrl"
						margin="dense"
						variant="outlined"
						fullWidth
						value={tempN8nUrl}
						placeholder="http://localhost:5678"
						helperText="Inclua o http:// ou https://"
						onChange={e => setTempN8nUrl(e.target.value)}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										onClick={handleUpdateN8nUrl}
										edge="end"
										color="primary"
									>
										<SaveIcon />
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
				</Paper>

				<Typography variant="body2" style={{ marginTop: 20, marginBottom: 10 }}>
					Layout e Branding
				</Typography>
				<Paper className={classes.paper}>
					<TextField
						id="appName-setting"
						label="Nome do Sistema"
						name="appName"
						margin="dense"
						variant="outlined"
						fullWidth
						value={getSettingValue("appName")}
						onChange={handleChangeSetting}
					/>
				</Paper>

				<Paper className={classes.paper}>
					<TextField
						id="appPrimaryColor-setting"
						label="Cor Primária (Hex)"
						name="appPrimaryColor"
						margin="dense"
						variant="outlined"
						fullWidth
						value={getSettingValue("appPrimaryColor")}
						onChange={handleChangeSetting}
						placeholder="#001F60"
					/>
				</Paper>

				<Paper className={classes.paper}>
					<div style={{ width: "100%" }}>
						<Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>Logo da Tela de Login</Typography>
						<Typography variant="body2" color="textSecondary" gutterBottom>
							Esta é a imagem principal exibida na tela onde os usuários inserem e-mail e senha para entrar. Recomendado imagem .PNG com fundo transparente.
						</Typography>
						<div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
							<input
								accept="image/*"
								style={{ display: "none" }}
								id="appLogoLogin-upload"
								type="file"
								onChange={(e) => handleUploadLogo(e, "appLogoLogin")}
							/>
							<label htmlFor="appLogoLogin-upload">
								<Button variant="contained" color="primary" component="span">
									Fazer Upload
								</Button>
							</label>
							{getSettingValue("appLogoLogin") && (
								<img src={getSettingValue("appLogoLogin")} alt="Preview" style={{ height: 40, marginLeft: 20 }} />
							)}
						</div>
					</div>
				</Paper>

				<Paper className={classes.paper}>
					<div style={{ width: "100%" }}>
						<Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>Logo do Dashboard (Menu Interno)</Typography>
						<Typography variant="body2" color="textSecondary" gutterBottom>
							É a logo que aparece no topo do menu lateral superior esquerdo dentro do sistema. Geralmente uma versão horizontal (landscape).
						</Typography>
						<div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
							<input
								accept="image/*"
								style={{ display: "none" }}
								id="appLogoDashboard-upload"
								type="file"
								onChange={(e) => handleUploadLogo(e, "appLogoDashboard")}
							/>
							<label htmlFor="appLogoDashboard-upload">
								<Button variant="contained" color="primary" component="span">
									Fazer Upload
								</Button>
							</label>
							{getSettingValue("appLogoDashboard") && (
								<img src={getSettingValue("appLogoDashboard")} alt="Preview" style={{ height: 40, marginLeft: 20 }} />
							)}
						</div>
					</div>
				</Paper>

				<Paper className={classes.paper}>
					<div style={{ width: "100%" }}>
						<Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>Logo da Tela de Cadastro</Typography>
						<Typography variant="body2" color="textSecondary" gutterBottom>
							Imagem que aparecerá na tela onde os usuários clicam em "Registre-se".
						</Typography>
						<div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
							<input
								accept="image/*"
								style={{ display: "none" }}
								id="appLogoSignup-upload"
								type="file"
								onChange={(e) => handleUploadLogo(e, "appLogoSignup")}
							/>
							<label htmlFor="appLogoSignup-upload">
								<Button variant="contained" color="primary" component="span">
									Fazer Upload
								</Button>
							</label>
							{getSettingValue("appLogoSignup") && (
								<img src={getSettingValue("appLogoSignup")} alt="Preview" style={{ height: 40, marginLeft: 20 }} />
							)}
						</div>
					</div>
				</Paper>

				<Paper className={classes.paper}>
					<div style={{ width: "100%" }}>
						<Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>Ícone da Aba do Navegador (Favicon)</Typography>
						<Typography variant="body2" color="textSecondary" gutterBottom>
							Aquele ícone pequenininho quadrado (formato 1:1) que fica do lado do nome do site na aba do próprio navegador. (Recomendado tamanho 64x64 ou 128x128).
						</Typography>
						<div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
							<input
								accept="image/*"
								style={{ display: "none" }}
								id="appFavicon-upload"
								type="file"
								onChange={(e) => handleUploadLogo(e, "appFavicon")}
							/>
							<label htmlFor="appFavicon-upload">
								<Button variant="contained" color="primary" component="span">
									Fazer Upload
								</Button>
							</label>
							{getSettingValue("appFavicon") && (
								<img src={getSettingValue("appFavicon")} alt="Preview" style={{ height: 32, width: 32, objectFit: "contain", marginLeft: 20 }} />
							)}
						</div>
					</div>
				</Paper>

				<Paper className={classes.paper}>
					<TextField
						id="appFooterText-setting"
						label="Texto do Rodapé"
						name="appFooterText"
						margin="dense"
						variant="outlined"
						fullWidth
						value={getSettingValue("appFooterText")}
						onChange={handleChangeSetting}
					/>
				</Paper>
			</Container>
		</div>
	);
};

export default Settings;
