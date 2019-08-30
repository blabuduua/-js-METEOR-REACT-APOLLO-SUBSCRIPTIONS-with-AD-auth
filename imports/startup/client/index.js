import React from 'react'
import { Meteor } from 'meteor/meteor'
import { render } from 'react-dom'

import { Accounts } from 'meteor/accounts-base'

import { HttpLink } from "apollo-link-http"
import { WebSocketLink } from "apollo-link-ws"
import ApolloClient from "apollo-client"
import { InMemoryCache } from "apollo-cache-inmemory"

import { ApolloProvider } from '@apollo/react-hooks'

import { ApolloLink, split } from "apollo-link"
import { getMainDefinition } from "apollo-utilities"

import App from '../../ui/App'

const httpLink = new HttpLink();

const middlewareLink = new ApolloLink((operation, forward) => {
    operation.setContext({
        headers: {
            Authorization: Accounts._storedLoginToken(),
        },
    });

    return forward(operation)
});

const httpLinkAuth = middlewareLink.concat(httpLink);

const wsLink = new WebSocketLink({
    uri: `${window.location.origin}/subscriptions`.replace(/^http/, "ws"),
    options: {
        reconnect: true,
    },
});

const link = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind === "OperationDefinition" && definition.operation === "subscription";
    },
    wsLink,
    httpLinkAuth,
);

const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
});

const ApolloApp = () => (
    <ApolloProvider client={apolloClient}>
        <App />
    </ApolloProvider>
);

Meteor.startup(() => {
    render(<ApolloApp />, document.getElementById('app'))
});