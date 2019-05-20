const io = require('socket.io-client');

const port = 9901;
const socket = io(`http://localhost:${port}`);

const data = {
  extensions: ['1558178414801', '1558178414806'],
};
const channel = 'testing123';

socket.emit('checking', channel, JSON.stringify(data));

socket.on(`status-of-${channel}`, (response) => {
  console.log('incoming data from server');
  const { result } = JSON.parse(response);
  console.log(result);
});

console.log('starting npm client ...');
