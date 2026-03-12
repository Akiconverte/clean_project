import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { format } from "date-fns";

const ScheduleModal = ({ open, onClose, scheduleId, reload }) => {
  const [body, setBody] = useState("");
  const [sendAt, setSendAt] = useState("");
  const [contactId, setContactId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [options, setOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (scheduleId && open) {
      (async () => {
        try {
          const { data } = await api.get(`/schedules/${scheduleId}`);
          setBody(data.body || "");
          setContactId(data.contactId);
          setSelectedContact(data.contact);
          if (data.sendAt) {
            // format to datetime-local format: yyyy-MM-ddTHH:mm
            const d = new Date(data.sendAt);
            const formatted = format(d, "yyyy-MM-dd'T'HH:mm");
            setSendAt(formatted);
          }
        } catch (err) {
          toastError(err);
        }
      })();
    } else {
      setBody("");
      setSendAt("");
      setContactId(null);
      setSelectedContact(null);
      setOptions([]);
    }
  }, [scheduleId, open]);

  useEffect(() => {
    if (!open || searchParam.length < 3) {
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("contacts", { params: { searchParam } });
        setOptions(data.contacts || []);
      } catch (err) {
        toastError(err);
      }
      setSearchLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchParam, open]);

  const handleSave = async () => {
    if (!contactId || !body || !sendAt) {
      toast.error("Preencha todos os campos!");
      return;
    }
    setSaving(true);
    try {
      if (scheduleId) {
        await api.put(`/schedules/${scheduleId}`, { body, sendAt, contactId });
        toast.success("Agendamento atualizado!");
      } else {
        await api.post("/schedules", { body, sendAt, contactId });
        toast.success("Agendamento criado!");
      }
      onClose();
      reload();
    } catch (err) {
      toastError(err);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{scheduleId ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
      <DialogContent dividers>
        <div style={{ marginBottom: 16 }}>
          <Autocomplete
            options={options}
            loading={searchLoading}
            getOptionLabel={(opt) => `${opt.name} - ${opt.number}`}
            onChange={(e, newValue) => {
              setSelectedContact(newValue);
              setContactId(newValue ? newValue.id : null);
            }}
            onInputChange={(e, val) => setSearchParam(val)}
            value={selectedContact}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Contato"
                variant="outlined"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searchLoading ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </div>
        <TextField
          label="Mensagem"
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <TextField
          label="Data e Hora do Envio"
          type="datetime-local"
          variant="outlined"
          fullWidth
          value={sendAt}
          onChange={(e) => setSendAt(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={24} /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleModal;
