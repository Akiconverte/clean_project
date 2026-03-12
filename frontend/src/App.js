import React, { useState, useEffect } from "react";
import Routes from "./routes";
import "react-toastify/dist/ReactToastify.css";

import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { ptBR } from "@material-ui/core/locale";

import api from "./services/api";

const App = () => {
	const [locale, setLocale] = useState();
	const [primaryColor, setPrimaryColor] = useState("#0F2F6B");
	const [secondaryColor, setSecondaryColor] = useState("#2B6CB0");

	const theme = createTheme(
		{
			palette: {
				primary: {
					main: primaryColor,
				},
				secondary: {
					main: secondaryColor,
				},
			},
		},
		locale
	);

	useEffect(() => {
		const fetchPublicSettings = async () => {
			try {
				const { data } = await api.get("/settings/public");
				if (data && Array.isArray(data)) {
					const primary = data.find(s => s.key === "appPrimaryColor")?.value;
					const secondary = data.find(s => s.key === "appSecondaryColor")?.value;
					const name = data.find(s => s.key === "appName")?.value;
					const favicon = data.find(s => s.key === "appFavicon")?.value;

					if (primary && primary !== "null" && primary.trim() !== "") setPrimaryColor(primary);
					if (secondary && secondary !== "null" && secondary.trim() !== "") setSecondaryColor(secondary);
					if (name) document.title = name;
					if (favicon) {
						let link = document.querySelector("link[rel~='icon']");
						if (!link) {
							link = document.createElement("link");
							link.rel = "icon";
							document.getElementsByTagName("head")[0].appendChild(link);
						}
						link.href = favicon;
					}
				}
			} catch (err) {
				console.error("Erro ao carregar configurações de branding", err);
			}
		};
		fetchPublicSettings();
	}, []);

	useEffect(() => {
		const i18nlocale = localStorage.getItem("i18nextLng");
		const browserLocale =
			i18nlocale?.substring(0, 2) + i18nlocale?.substring(3, 5);

		if (browserLocale === "ptBR") {
			setLocale(ptBR);
		}
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<Routes />
		</ThemeProvider>
	);
};

export default App;
