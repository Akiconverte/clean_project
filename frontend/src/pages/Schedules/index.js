import React, { useState, useEffect, useReducer } from "react";
import {
  makeStyles,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment
} from "@material-ui/core";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ScheduleModal from "../../components/ScheduleModal";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { Edit, Delete, Search } from "@material-ui/icons";
import { format, parseISO } from "date-fns";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles
  }
}));

const Schedules = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, [searchParam]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/schedules/", {
        params: { searchParam }
      });
      setSchedules(data.schedules);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const handleOpenScheduleModal = () => {
    setSelectedScheduleId(null);
    setScheduleModalOpen(true);
  };

  const handleEditSchedule = (id) => {
    setSelectedScheduleId(id);
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await api.delete(`/schedules/${id}`);
      toast.success("Agendamento excluído!");
      fetchSchedules();
    } catch (err) {
      toastError(err);
    }
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  return (
    <MainContainer>
      <ScheduleModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        scheduleId={selectedScheduleId}
        reload={fetchSchedules}
      />
      <MainHeader>
        <Title>Agendamentos</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder="Pesquisar..."
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="secondary" />
                </InputAdornment>
              )
            }}
          />
          <Button variant="contained" color="primary" onClick={handleOpenScheduleModal}>
            Novo Agendamento
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Contato</TableCell>
              <TableCell align="center">Mensagem</TableCell>
              <TableCell align="center">Data de Envio</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRowSkeleton columns={5} />
            ) : (
              Array.isArray(schedules) && schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell align="center">{schedule.contact?.name}</TableCell>
                    <TableCell align="center" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {schedule.body}
                    </TableCell>
                    <TableCell align="center">
                      {format(parseISO(schedule.sendAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell align="center">{schedule.status}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleEditSchedule(schedule.id)}>
                        <Edit color="secondary" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteSchedule(schedule.id)}>
                        <Delete color="secondary" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhum agendamento encontrado
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Schedules;
