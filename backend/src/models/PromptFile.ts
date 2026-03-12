import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    DataType,
} from "sequelize-typescript";

@Table
class PromptFile extends Model<PromptFile> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column(DataType.STRING)
    name: string;

    @Column(DataType.STRING)
    path: string;

    @Column(DataType.INTEGER)
    whatsappId: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default PromptFile;
