import { attributeFields } from "graphql-sequelize";
import { GraphQLList, GraphQLString, GraphQLInt } from "graphql";
import { Goal } from "../schemas/Goal";
import ResponsePayload from "../schemas/ResponsePayload";
//import userJoiModel from "../../joiModels/userModel";
//import updateUserJoiModel from "../../joiModels/putUserModel";
import { joiValidate } from "../validator";
import _ from "lodash/fp";
import joi from "joi";
const uuid = require("node-uuid"),
  emailService = include("services/emailService"),
  config = include("config")(),
  base = _.assign(
    {},
    attributeFields(sequelize.models.goal, {
      exclude: ["id", "createdAt", "updatedAt"]
    })
  ),
  baseUpdate = _.assign(
    {},
    attributeFields(sequelize.models.goal, {
      exclude: ["createdAt", "updatedAt"]
    })
  ),
  CreateGoal = {
    type: ResponsePayload,
    args: base,
    resolve: (root, goal, context) => {
      //return joiValidate({
      //  permission: "WriteUser",
      //  obj: user,
      //  joiModel: userJoiModel,
      //  user: context.user
      //}).then(() => {
        return new Promise(function(resolve, reject) {
          return sequelize.models.goal.create(goal)
            .then(user => resolve({ success: true, payload: user }))
            .catch(e => {
              console.log(e);
              reject(e);
            });
        });
      //});
    }
  }
  //UpdateUser = {
  //  type: ResponsePayload,
  //  args: baseUpdate,
  //  resolve: (root, user, context) => {
  //    return joiValidate({
  //      permission: "WriteUser",
  //      obj: user,
  //      joiModel: updateUserJoiModel,
  //      user: context.user
  //    }).then(() => {
  //      return new Promise(function(resolve, reject) {
  //        sequelize.models.user
  //          .update(user, { where: { id: user.id } })
  //          .then(() => {
  //            return sequelize.models.user.findOne({ where: { id: user.id } });
  //          })
  //          .then(r => resolve({ success: true, payload: r }))
  //          .catch(e => {
  //            console.log(e);
  //            reject(e);
  //          });
  //      });
  //    });
  //  }
  //}
;

export { CreateGoal };
