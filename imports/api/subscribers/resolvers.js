import { PubSub } from "apollo-server-express";

const pubsub = new PubSub();
const CURRENT_TIME = "CURRENT_TIME";

let updateInterval = 1000;

function updateTime() {
    pubsub.publish(CURRENT_TIME, new Date().toISOString());
    setTimeout(updateTime, updateInterval);
}

updateTime();

export default {
    Query: {
        sayHello: (root, { name }) => `Hello ${name}`,
    },
    Mutation: {
        setUpdateIntervalTime(root, { timeInMs }, { user } ) {
            console.log(user);
            updateInterval = timeInMs;
        },
    },
    Subscription: {
        currentTime: {
            subscribe: () => pubsub.asyncIterator(CURRENT_TIME),
            resolve: payload => payload,
        },
    }
};