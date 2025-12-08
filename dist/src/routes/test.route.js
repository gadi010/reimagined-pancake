import express from "express";
const testrouter = express.Router();
testrouter.get('/', (_, res) => {
    res.send('Test route is working');
});
testrouter.get('/one', (_, res) => {
    res.send('Test one route is working');
});
testrouter.get('/two', (_, res) => {
    res.send('Test two route is working');
});
export default testrouter;
