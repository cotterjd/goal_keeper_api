const _ = require("lodash");
const R = require("ramda");

import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
  GraphQLFloat,
  GraphQLNonNull
} from "graphql";
import { attributeFields } from "graphql-sequelize";
import { setTimeout } from "core-js/library/web/timers";

const Goal = new GraphQLObjectType({
  name: "Goal",
  description: "This represents a Goal",
  fields: () => _.assign(attributeFields(sequelize.models.goal), {})
});

export { Goal };
