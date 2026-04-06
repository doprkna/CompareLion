import { Queue, QueueEvents } from 'bullmq';
import { connection } from './connection';
const queueName = 'question-gen';
const defaultOpts = {
    removeOnComplete: true,
    removeOnFail: 100,
};
let _questionGenQueue = null;
let _questionGenEvents = null;
function getQuestionGenQueue() {
    if (!_questionGenQueue) {
        // Access connection proxy to trigger lazy init
        const conn = connection;
        if (conn) {
            _questionGenQueue = new Queue(queueName, {
                connection: conn,
                defaultJobOptions: defaultOpts,
            });
        }
    }
    return _questionGenQueue;
}
function getQuestionGenEvents() {
    if (!_questionGenEvents) {
        const conn = connection;
        if (conn) {
            _questionGenEvents = new QueueEvents(queueName, { connection: conn });
        }
    }
    return _questionGenEvents;
}
const questionGenQueue = new Proxy({}, {
    get(_target, prop) {
        const queue = getQuestionGenQueue();
        if (!queue)
            return undefined;
        const value = queue[prop];
        return typeof value === 'function' ? value.bind(queue) : value;
    },
    set(_target, prop, value) {
        const queue = getQuestionGenQueue();
        if (queue) {
            queue[prop] = value;
        }
        return true;
    }
});
const questionGenEvents = new Proxy({}, {
    get(_target, prop) {
        const events = getQuestionGenEvents();
        if (!events)
            return undefined;
        const value = events[prop];
        return typeof value === 'function' ? value.bind(events) : value;
    },
    set(_target, prop, value) {
        const events = getQuestionGenEvents();
        if (events) {
            events[prop] = value;
        }
        return true;
    }
});
export { questionGenQueue, questionGenEvents };
