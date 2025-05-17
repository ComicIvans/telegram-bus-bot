import { Sequelize, DataTypes, Model } from 'sequelize';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './private/db.sqlite',
  logging: false,
});

/** Known stop metadata */
export class Stop extends Model {
  declare id: string;
  declare name: string;
  /** JSON-stringified array of line IDs */
  declare lines: string;
}
Stop.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    lines: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, modelName: 'Stop' },
);

/** User subscription to a line on a stop */
export class Subscription extends Model {
  declare id: number;
  declare userId: number;
  declare chatId: number;
  declare stopId: string;
  declare line: string;
  declare active: boolean;
  /** JSON-stringified days array, e.g. '["L","M","X"]' */
  declare days: string;
  /** JSON-stringified TimeSlot[], e.g. '[{"from":"06:30","to":"09:00"}]' */
  declare timeSlots: string;
}
Subscription.init(
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    chatId: { type: DataTypes.INTEGER, allowNull: false },
    stopId: { type: DataTypes.STRING, allowNull: false },
    line: { type: DataTypes.STRING, allowNull: false },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    days: { type: DataTypes.TEXT, allowNull: false, defaultValue: '[]' },
    timeSlots: { type: DataTypes.TEXT, allowNull: false, defaultValue: '[]' },
  },
  { sequelize, modelName: 'Subscription' },
);

/** Records thresholds already notified on a given day */
export class DailyNotification extends Model {
  declare subscriptionId: number;
  declare date: string; // YYYY-MM-DD
  declare threshold: number; // 5, 10 or 15
}
DailyNotification.init(
  {
    subscriptionId: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.STRING, allowNull: false },
    threshold: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'DailyNotification' },
);
