import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull
} from "graphql";
import { typeMapper } from "graphql-sequelize";
import GraphQLDate from "graphql-date";

typeMapper.mapType(type => {
  //map bools as strings
  if (type instanceof Sequelize.DATE) {
    return GraphQLDate;
  }
  //use default for everything else
  return false;
});
import { GoalQuery } from "./queries/Goals";
import { CreateGoal } from "./mutations/Goal";


var Db = sequelize;

const Query = new GraphQLObjectType({
  name: "Query",
  description: "This is a root query.",
  fields: () => ({
    goals: GoalQuery,
  })
});
const Mutation = new GraphQLObjectType({
  name: "Mutations",
  description: "This is a root mutation.",
  fields: () => ({
    createGoal: CreateGoal
  })
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});
export { Schema };
