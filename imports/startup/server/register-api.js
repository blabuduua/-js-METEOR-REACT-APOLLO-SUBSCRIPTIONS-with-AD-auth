import { ApolloServer, gql } from 'apollo-server-express'
import { WebApp } from 'meteor/webapp'
import { getUser } from 'meteor/apollo'
import merge from 'lodash/merge'

import UserSchema from '../../api/users/User.graphql'
import UserResolvers from '../../api/users/resolvers'

import SubscribersSchema from '../../api/subscribers/Subscribers.graphql'
import SubscribersResolvers from '../../api/subscribers/resolvers'

import ResolutionSchema from '../../api/resolutions/Resolution.graphql'
import ResolutionResolvers from '../../api/resolutions/resolvers'

import GoalSchema from '../../api/goals/Goal.graphql'
import GoalResolvers from '../../api/goals/resolvers'

// Reresh

const typeDefs = [
    UserSchema,
    SubscribersSchema,
    ResolutionSchema,
    GoalSchema
];

const resolvers = merge(
    UserResolvers,
    SubscribersResolvers,
    ResolutionResolvers,
    GoalResolvers
);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, connection }) => {
        if (connection) {
          // check connection for metadata
          return connection.context;
        } else {
          // check from req
          const token = req.headers.authorization || "";

          return { user: await getUser(token) };
        }
    },
    subscriptions: {
        path: "/subscriptions",
        onConnect: async (connectionParams, webSocket, context) => {
            console.log(`Subscription client connected using Apollo server's built-in SubscriptionServer.`)

            if (connectionParams.authToken !== null) {
                return {
                    currentUser: await getUser(connectionParams.authToken),
                };
            }

            throw new Error('Missing auth token!');
        },
        onDisconnect: async (webSocket, context) => {
            console.log(`Subscription client disconnected.`)
        }
    }
});

server.applyMiddleware({
    app: WebApp.connectHandlers,
});

server.installSubscriptionHandlers(WebApp.httpServer);