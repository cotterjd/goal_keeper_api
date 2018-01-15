import { GraphQLList, GraphQLString, GraphQLInt } from "graphql";
import { Goal } from "../schemas/Goal";
import { resolver, defaultListArgs } from "graphql-sequelize";
var Db = sequelize;
var _ = require("lodash");

const GoalQuery = {
  type: new GraphQLList(Goal),
  args: _.assign(defaultListArgs(), { id: { type: GraphQLString } }),
  resolve: resolver(Db.models.goal)
};

export { GoalQuery };
