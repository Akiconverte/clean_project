import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	ticket: {
		position: "relative",
		backgroundColor: "#fff",
		borderRadius: "12px",
		marginBottom: "8px",
		border: "1px solid rgba(0, 0, 0, 0.06)",
		transition: "all 0.3s ease",
		"&:hover": {
			border: "1px solid #001F60",
			boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
		},
	},

	pendingTicket: {
		cursor: "unset",
	},

	noTicketsDiv: {
		display: "flex",
		height: "100px",
		margin: 40,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},

	noTicketsText: {
		textAlign: "center",
		color: "rgb(104, 121, 146)",
		fontSize: "14px",
		lineHeight: "1.4",
	},

	noTicketsTitle: {
		textAlign: "center",
		fontSize: "16px",
		fontWeight: "600",
		margin: "0px",
	},

	contactNameWrapper: {
		display: "flex",
		justifyContent: "space-between",
		width: "100%",
	},

	lastMessageTime: {
		justifySelf: "flex-end",
	},

	closedBadge: {
		alignSelf: "center",
		justifySelf: "flex-end",
		marginRight: 32,
		marginLeft: "auto",
	},

	contactLastMessage: {
		paddingRight: 20,
	},

	newMessagesCount: {
		alignSelf: "center",
		marginLeft: "8px",
		marginRight: "8px",
	},

	badgeStyle: {
		color: "white",
		backgroundColor: green[500],
	},

	acceptButton: {
		borderRadius: "20px",
		backgroundColor: "#001F60",
		color: "#fff",
		padding: "4px 16px",
		fontSize: "0.8rem",
		fontWeight: 700,
		"&:hover": {
			backgroundColor: "#001240",
		},
	},

	ticketQueueColor: {
		flex: "none",
		width: "6px",
		height: "60%",
		position: "absolute",
		top: "20%",
		left: "0%",
		borderRadius: "0 4px 4px 0",
	},

	userTag: {
		background: "#2576D2",
		color: "#ffffff",
		padding: "2px 8px",
		borderRadius: 12,
		fontSize: "0.75rem",
		fontWeight: 500,
		marginLeft: 10,
		whiteSpace: "nowrap",
	},
}));

const TicketListItem = ({ ticket }) => {
	const classes = useStyles();
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const { ticketId } = useParams();
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleAcepptTicket = async id => {
		setLoading(true);
		try {
			await api.put(`/tickets/${id}`, {
				status: "open",
				userId: user?.id,
			});
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
		if (isMounted.current) {
			setLoading(false);
		}
		history.push(`/tickets/${id}`);
	};

	const handleSelectTicket = id => {
		history.push(`/tickets/${id}`);
	};

	return (
		<React.Fragment key={ticket.id}>
			<ListItem
				dense
				button
				onClick={e => {
					if (ticket.status === "pending") return;
					handleSelectTicket(ticket.id);
				}}
				selected={ticketId && +ticketId === ticket.id}
				className={clsx(classes.ticket, {
					[classes.pendingTicket]: ticket.status === "pending",
				})}
			>
				<Tooltip
					arrow
					placement="right"
					title={ticket.queue?.name || "Sem fila"}
				>
					<span
						style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
						className={classes.ticketQueueColor}
					></span>
				</Tooltip>
				<ListItemAvatar>
					<Avatar src={ticket?.contact?.profilePicUrl} />
				</ListItemAvatar>
				<ListItemText
					disableTypography
					primary={
						<div className={classes.contactNameWrapper}>
							<Typography
								noWrap
								component="span"
								variant="body2"
								color="textPrimary"
							>
								{ticket.contact.name}
							</Typography>
							<div style={{ display: "flex", alignItems: "center" }}>
								{ticket.status === "closed" && (
									<Badge
										className={classes.closedBadge}
										badgeContent={"closed"}
										color="primary"
									/>
								)}
								{ticket.lastMessage && (
									<Typography
										className={classes.lastMessageTime}
										component="span"
										variant="body2"
										color="textSecondary"
									>
										{isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
											<>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
										) : (
											<>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
										)}
									</Typography>
								)}
							</div>
						</div>
					}
					secondary={
						<div className={classes.contactNameWrapper} style={{ marginTop: 4 }}>
							<Typography
								className={classes.contactLastMessage}
								noWrap
								component="span"
								variant="body2"
								color="textSecondary"
								style={{ flexGrow: 1 }}
							>
								{ticket.lastMessage ? (
									<MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
								) : (
									<br />
								)}
							</Typography>

							<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
								{ticket.whatsappId && (
									<div className={classes.userTag} title={i18n.t("ticketsList.connectionTitle")}>
										{ticket.whatsapp?.name}
									</div>
								)}
								<Badge
									className={classes.newMessagesCount}
									badgeContent={ticket.unreadMessages}
									classes={{
										badge: classes.badgeStyle,
									}}
								/>
							</div>
						</div>
					}
				/>
				{ticket.status === "pending" && (
					<div style={{ marginLeft: 12 }}>
						<ButtonWithSpinner
							color="primary"
							variant="contained"
							className={classes.acceptButton}
							size="small"
							loading={loading}
							onClick={e => handleAcepptTicket(ticket.id)}
						>
							{i18n.t("ticketsList.buttons.accept")}
						</ButtonWithSpinner>
					</div>
				)}
			</ListItem>
		</React.Fragment>
	);
};

export default TicketListItem;
