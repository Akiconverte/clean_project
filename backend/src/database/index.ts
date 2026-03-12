import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Setting from "../models/Setting";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import ContactCustomField from "../models/ContactCustomField";
import Message from "../models/Message";
import Queue from "../models/Queue";
import WhatsappQueue from "../models/WhatsappQueue";
import UserQueue from "../models/UserQueue";
import QuickAnswer from "../models/QuickAnswer";
import WppKey from "../models/WppKey";
import PromptFile from "../models/PromptFile";
import AiAgent from "../models/AiAgent";
import QueueIntegrations from "../models/QueueIntegrations";
import Tag from "../models/Tag";
import TicketTag from "../models/TicketTag";
import Chat from "../models/Chat";
import ChatUser from "../models/ChatUser";
import ChatMessage from "../models/ChatMessage";
import Schedule from "../models/Schedule";
import TicketNote from "../models/TicketNote";
import TicketInsight from "../models/TicketInsight";


// eslint-disable-next-line
const dbConfig = require("../config/database");

const sequelize = new Sequelize(dbConfig);

const models = [
  User,
  Contact,
  Ticket,
  Message,
  Whatsapp,
  ContactCustomField,
  Setting,
  Queue,
  WhatsappQueue,
  UserQueue,
  QuickAnswer,
  WppKey,
  PromptFile,
  AiAgent,
  QueueIntegrations,
  Tag,
  TicketTag,
  Chat,
  ChatUser,
  ChatMessage,
  Schedule,
  TicketNote,
  TicketInsight
];

sequelize.addModels(models);

export default sequelize;
