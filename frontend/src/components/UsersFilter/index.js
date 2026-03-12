import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

export const UsersFilter = ({ onFiltered, initialUsers }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(initialUsers || []);

  useEffect(() => {
    setSelectedUsers(initialUsers || []);
  }, [initialUsers]);

  useEffect(() => {
    if (searchParam.length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam },
          });
          setOptions(data.users);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };

      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  return (
    <Autocomplete
      multiple
      size="small"
      options={options}
      value={selectedUsers}
      onChange={(e, newValue) => {
        setSelectedUsers(newValue);
        onFiltered(newValue);
      }}
      getOptionLabel={(option) => option.name}
      getOptionSelected={(option, value) => option.id === value.id}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={i18n.t("transferTicketModal.fieldLabel")}
          variant="outlined"
          onChange={(e) => setSearchParam(e.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};
