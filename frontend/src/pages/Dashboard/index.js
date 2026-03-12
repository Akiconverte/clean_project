import React, { useContext } from "react"

import Paper from "@material-ui/core/Paper"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography";

import TextField from "@material-ui/core/TextField"
import useTickets from "../../hooks/useTickets"
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import Chart from "./Chart"
import { format, parseISO, startOfMonth } from "date-fns";

import {
	Call as CallIcon,
	Schedule as ScheduleIcon,
	CheckCircle as CheckCircleIcon,
} from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
	container: {
		paddingTop: theme.spacing(4),
		paddingBottom: theme.spacing(4),
	},
	fixedHeightPaper: {
		padding: theme.spacing(3),
		display: "flex",
		overflow: "auto",
		flexDirection: "column",
		height: 260,
		borderRadius: 20,
		boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
		border: "none",
	},
	card: {
		padding: theme.spacing(3),
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		height: 160,
		borderRadius: 20,
		color: "#fff",
		position: "relative",
		overflow: "hidden",
		transition: "transform 0.3s ease, boxShadow 0.3s ease",
		"&:hover": {
			transform: "translateY(-5px)",
			boxShadow: "0px 15px 35px rgba(0, 0, 0, 0.2)",
		}
	},
	card1: {
		background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
	},
	card2: {
		background: "linear-gradient(135deg, #ea580c 0%, #fb923c 100%)",
	},
	card3: {
		background: "linear-gradient(135deg, #15803d 0%, #4ade80 100%)",
	},
	cardTitle: {
		fontSize: "0.9rem",
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: "1px",
		opacity: 0.9,
		display: "flex",
		alignItems: "center",
		gap: 8,
		zIndex: 2,
	},
	cardValue: {
		fontSize: "2.4rem",
		fontWeight: 800,
		zIndex: 2,
	},
	cardIconBackground: {
		position: "absolute",
		right: -10,
		bottom: -10,
		fontSize: "6rem",
		opacity: 0.15,
		transform: "rotate(-15deg)",
		zIndex: 1,
	},
	trendBadge: {
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		padding: "4px 12px",
		borderRadius: 20,
		fontSize: "0.75rem",
		fontWeight: 700,
		display: "inline-flex",
		alignItems: "center",
		width: "fit-content",
		zIndex: 2,
	},
	filterContainer: {
		display: "flex",
		justifyContent: "flex-end",
		alignItems: "center",
		gap: theme.spacing(2),
		marginBottom: theme.spacing(3),
		padding: theme.spacing(2),
		backgroundColor: "rgba(255, 255, 255, 0.5)",
		borderRadius: 20,
		backdropFilter: "blur(10px)",
	},
	textField: {
		"& .MuiOutlinedInput-root": {
			borderRadius: 12,
			backgroundColor: "#fff",
		}
	}
}))

const Dashboard = () => {
	const classes = useStyles()
	const [dateStart, setDateStart] = React.useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
	const [dateEnd, setDateEnd] = React.useState(format(new Date(), "yyyy-MM-dd"))

	const { user } = useContext(AuthContext);
	var userQueueIds = [];

	if (user.queues && user.queues.length > 0) {
		userQueueIds = user.queues.map(q => q.id);
	}

	const GetTickets = (status, showAll, withUnreadMessages) => {
		const { count } = useTickets({
			status: status,
			showAll: showAll,
			withUnreadMessages: withUnreadMessages,
			queueIds: JSON.stringify(userQueueIds),
			dateStart,
			dateEnd
		});
		return count;
	}

	return (
		<div>
			<Container maxWidth="lg" className={classes.container}>
				<div className={classes.filterContainer}>
					<TextField
						label="Início"
						type="date"
						value={dateStart}
						variant="outlined"
						fullWidth
						className={classes.textField}
						onChange={(e) => setDateStart(e.target.value)}
						InputLabelProps={{
							shrink: true,
						}}
					/>
					<TextField
						label="Fim"
						type="date"
						value={dateEnd}
						variant="outlined"
						fullWidth
						className={classes.textField}
						onChange={(e) => setDateEnd(e.target.value)}
						InputLabelProps={{
							shrink: true,
						}}
					/>
				</div>
				<Grid container spacing={3}>
					<Grid item xs={12} sm={4}>
						<Paper className={`${classes.card} ${classes.card1}`} elevation={0}>
							<CallIcon className={classes.cardIconBackground} />
							<Typography className={classes.cardTitle}>
								<CallIcon />
								{i18n.t("dashboard.messages.inAttendance.title")}
							</Typography>
							<Typography className={classes.cardValue}>
								{GetTickets("open", "true", "false")}
							</Typography>
							<div className={classes.trendBadge}>
								ATIVOS AGORA
							</div>
						</Paper>
					</Grid>
					<Grid item xs={12} sm={4}>
						<Paper className={`${classes.card} ${classes.card2}`} elevation={0}>
							<ScheduleIcon className={classes.cardIconBackground} />
							<Typography className={classes.cardTitle}>
								<ScheduleIcon />
								{i18n.t("dashboard.messages.waiting.title")}
							</Typography>
							<Typography className={classes.cardValue}>
								{GetTickets("pending", "true", "false")}
							</Typography>
							<div className={classes.trendBadge}>
								NA FILA
							</div>
						</Paper>
					</Grid>
					<Grid item xs={12} sm={4}>
						<Paper className={`${classes.card} ${classes.card3}`} elevation={0}>
							<CheckCircleIcon className={classes.cardIconBackground} />
							<Typography className={classes.cardTitle}>
								<CheckCircleIcon />
								{i18n.t("dashboard.messages.closed.title")}
							</Typography>
							<Typography className={classes.cardValue}>
								{GetTickets("closed", "true", "false")}
							</Typography>
							<div className={classes.trendBadge}>
								CONCLUÍDO
							</div>
						</Paper>
					</Grid>
					<Grid item xs={12}>
						<Paper className={classes.fixedHeightPaper}>
							<Chart dateStart={dateStart} dateEnd={dateEnd} />
						</Paper>
					</Grid>
				</Grid>
			</Container>
		</div>
	)
}

export default Dashboard