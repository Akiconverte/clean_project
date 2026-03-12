import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    DataType,
    Default,
} from "sequelize-typescript";

@Table
class AiAgent extends Model<AiAgent> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column(DataType.TEXT)
    prompt: string;

    @Column(DataType.TEXT)
    extraCommands: string;

    @Default(0.5)
    @Column(DataType.FLOAT)
    temperature: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default AiAgent;
