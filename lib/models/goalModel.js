module.exports = {
  name: "goal",
  model: {
    id: {
      type: Sequelize.UUID,
      unique: true,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    goal: { type: Sequelize.STRING, unique: true },
    term: { type: Sequelize.STRING },
    dueDate: { type: Sequelize.DATE }
  }
};
