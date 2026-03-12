import React, { useState, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";

import {
    Button,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
} from "@material-ui/core";

import {
    DeleteOutline,
    Edit
} from "@material-ui/icons";

import SearchIcon from "@material-ui/icons/Search";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import IntegrationModal from "../../components/QueueIntegrationModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const reducer = (state, action) => {
    if (action.type === "LOAD_INTEGRATIONS") {
        const queueIntegration = action.payload;
        const newIntegrations = [];

        queueIntegration.forEach((integration) => {
            const integrationIndex = state.findIndex((u) => u.id === integration.id);
            if (integrationIndex !== -1) {
                state[integrationIndex] = integration;
            } else {
                newIntegrations.push(integration);
            }
        });

        return [...state, ...newIntegrations];
    }

    if (action.type === "UPDATE_INTEGRATIONS") {
        const queueIntegration = action.payload;
        const integrationIndex = state.findIndex((u) => u.id === queueIntegration.id);

        if (integrationIndex !== -1) {
            state[integrationIndex] = queueIntegration;
            return [...state];
        } else {
            return [queueIntegration, ...state];
        }
    }

    if (action.type === "DELETE_INTEGRATION") {
        const integrationId = action.payload;

        const integrationIndex = state.findIndex((u) => u.id === integrationId);
        if (integrationIndex !== -1) {
            state.splice(integrationIndex, 1);
        }
        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }
};

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(2),
        margin: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
}));

const QueueIntegration = () => {
    const classes = useStyles();

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState(null);
    const [deletingIntegration, setDeletingIntegration] = useState(null);
    const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [queueIntegration, dispatch] = useReducer(reducer, []);

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchIntegrations = async () => {
                try {
                    const { data } = await api.get("/queueIntegration/", {
                        params: { searchParam, pageNumber },
                    });
                    dispatch({ type: "LOAD_INTEGRATIONS", payload: data.queueIntegrations });
                    setHasMore(data.hasMore);
                    setLoading(false);
                } catch (err) {
                    toastError(err);
                }
            };
            fetchIntegrations();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber]);

    useEffect(() => {
        const socket = openSocket();

        socket.on(`queueIntegration`, (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_INTEGRATIONS", payload: data.queueIntegration });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_INTEGRATION", payload: +data.integrationId });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleOpenIntegrationModal = () => {
        setSelectedIntegration(null);
        setIntegrationModalOpen(true);
    };

    const handleCloseIntegrationModal = () => {
        setSelectedIntegration(null);
        setIntegrationModalOpen(false);
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleEditIntegration = (queueIntegration) => {
        setSelectedIntegration(queueIntegration);
        setIntegrationModalOpen(true);
    };

    const handleDeleteIntegration = async (integrationId) => {
        try {
            await api.delete(`/queueIntegration/${integrationId}`);
            toast.success(i18n.t("queueIntegration.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingIntegration(null);
        setSearchParam("");
        setPageNumber(1);
    };

    const loadMore = () => {
        setPageNumber((prevState) => prevState + 1);
    };

    const handleScroll = (e) => {
        if (!hasMore || loading) return;
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - (scrollTop + 100) < clientHeight) {
            loadMore();
        }
    };

    return (
        <MainContainer>
            <ConfirmationModal
                title={
                    deletingIntegration &&
                    `${i18n.t("queueIntegration.confirmationModal.deleteTitle")} ${deletingIntegration.name
                    }?`
                }
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeleteIntegration(deletingIntegration.id)}
            >
                {i18n.t("queueIntegration.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <IntegrationModal
                open={integrationModalOpen}
                onClose={handleCloseIntegrationModal}
                aria-labelledby="form-dialog-title"
                integrationId={selectedIntegration && selectedIntegration.id}
            />
            <MainHeader>
                <Title>{i18n.t("queueIntegration.title")} ({queueIntegration.length})</Title>
                <MainHeaderButtonsWrapper>
                    <TextField
                        placeholder={i18n.t("queueIntegration.searchPlaceholder")}
                        type="search"
                        value={searchParam}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="secondary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenIntegrationModal}
                    >
                        {i18n.t("queueIntegration.buttons.add")}
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
                onScroll={handleScroll}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">{i18n.t("queueIntegration.table.id")}</TableCell>
                            <TableCell align="center">{i18n.t("queueIntegration.table.name")}</TableCell>
                            <TableCell align="center">{i18n.t("queueIntegration.table.actions")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {queueIntegration.map((integration) => (
                                <TableRow key={integration.id}>
                                    <TableCell align="center">{integration.id}</TableCell>
                                    <TableCell align="center">{integration.name}</TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditIntegration(integration)}
                                        >
                                            <Edit color="secondary" />
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setConfirmModalOpen(true);
                                                setDeletingIntegration(integration);
                                            }}
                                        >
                                            <DeleteOutline color="secondary" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={3} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default QueueIntegration;
