import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLBoolean
} from "graphql";

import JSONType from "graphql-sequelize/lib/types/jsonType";

const ResponsePayload = new GraphQLObjectType({
  name: "ResponsePayload",
  description: "This represents a ResponsePayload",
  fields: () => {
    return {
      success: {
        type: GraphQLBoolean,
        resolve(o) {
          return o.success;
        }
      },
      payload: {
        type: JSONType,
        resolve(o) {
          return o.payload;
        }
      },
      error: {
        type: JSONType,
        resolve(o) {
          return o.error;
        }
      }
    };
  }
});
export default ResponsePayload;
