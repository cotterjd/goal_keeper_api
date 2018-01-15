module.exports = {
  name: "goal",
  model: {
    id: {
      type: Sequelize.UUID,
      unique: true,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    goal: { type: Sequelize.STRING },
    term: { type: Sequelize.STRING },
    due_date: { type: Sequelize.DATE },
  }
};
