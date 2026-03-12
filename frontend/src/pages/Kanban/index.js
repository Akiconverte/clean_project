import React, { useState, useEffect, useReducer, useContext, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  button: {
    background: "#10a110",
    border: "none",
    padding: "10px",
    color: "white",
    fontWeight: "bold",
    borderRadius: "5px",
    cursor: "pointer",
    "&:hover": {
        background: "#0d8a0d"
    }
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();

  const [tags, setTags] = useState([]);
  const [reloadData, setReloadData] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchTags = async () => {
    try {
      const { data } = await api.get("/tags", {
        params: { kanban: 1 }
      });
      setTags(data.tags || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const [file, setFile] = useState({
    lanes: []
  });

  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban");
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [reloadData]);

  const handleCardClick = (id) => {  
    history.push('/tickets/' + id);
  };

  const popularCards = useCallback(() => {
    const filteredTicketsEmpty = tickets.filter(ticket => !ticket.tags || ticket.tags.length === 0);

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("Em aberto") || "Em aberto",
        label: filteredTicketsEmpty.length.toString(),
        cards: filteredTicketsEmpty.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
              <div>
                <p>
                  {ticket.contact.number}
                  <br />
                  {ticket.lastMessage}
                </p>
                <button 
                  className={classes.button} 
                  onClick={() => handleCardClick(ticket.id)}>
                    Ver Ticket
                </button>
              </div>
            ),
          title: ticket.contact.name,
          draggable: true,
        })),
      },
      ...tags.map(tag => {
        const filteredTickets = tickets.filter(ticket => {
          const tagIds = ticket.tags ? ticket.tags.map(t => t.id) : [];
          return tagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: filteredTickets.length.toString(),
          cards: filteredTickets.map(ticket => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div>
                <p>
                  {ticket.contact.number}
                  <br />
                  {ticket.lastMessage}
                </p>
                <button 
                  className={classes.button} 
                  onClick={() => handleCardClick(ticket.id)}>
                    Ver Ticket
                </button>
              </div>
            ),
            title: ticket.contact.name,
            draggable: true,
          })),
          style: { backgroundColor: tag.color, color: "white" }
        };
      }),
    ];

    setFile({ lanes });
  }, [tags, tickets, classes.button]);

  useEffect(() => {
    popularCards();
  }, [tags, tickets, reloadData, popularCards]);

  const handleCardMove = async (fromLaneId, toLaneId, cardId, index) => {
    try {
        if (fromLaneId !== "lane0") {
            await api.delete(`/ticket-tags/${cardId}`);
        }
        
        if (toLaneId !== "lane0") {
            await api.put(`/ticket-tags/${cardId}/${toLaneId}`);
        }
        
        toast.success(i18n.t('kanban.moveSuccess') || 'Movimentado com sucesso!');
        setReloadData(prev => !prev);
    } catch (err) {
      console.log(err);
      toast.error(i18n.t('kanban.moveError') || "Erro ao movimentar ticket");
    }
  };

  const handleBoardCardClick = (cardId, metadata, laneId) => {
    handleCardClick(cardId);
  };

  return (
    <div className={classes.root}>
      <Board 
		data={file} 
		onCardMoveAcrossLanes={handleCardMove}
        onCardClick={handleBoardCardClick}
		style={{backgroundColor: 'rgba(252, 252, 252, 0.03)', height: 'calc(100vh - 80px)'}}
    />
    </div>
  );
};

export default Kanban;
