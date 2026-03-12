import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement
} from "sequelize-typescript";

import Ticket from "./Ticket";

@Table({
  tableName: "TicketInsights"
})
class TicketInsight extends Model<TicketInsight> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @Column
  summary: string;


  @Column
  mainDoubt: string;

  @Column
  sentiment: number;

  @Column
  agentFeedback: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TicketInsight;
