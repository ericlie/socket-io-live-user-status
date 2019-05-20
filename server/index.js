const axios = require('axios');
const io = require('socket.io');

const port = 9901;
const socket = io(port);

const getUsers = async () => {
  try {
    const { data: { users } } = await axios.get(`http://localhost:3000/users`);
    return users;
  } catch (error) {
    console.error(error);
  }

  return null;
};

const operation = (list1, list2, isUnion = false) => list1.filter(
  (set => a => isUnion === set.includes(a.id))(list2),
);

const inBoth = (list1, list2) => operation(list1, list2, true);
const subscribers = {};
const jobs = {};

socket.on('connection', (client) => {
  console.log(`A client is connected with id ${client.id}`);
  client.on('checking', (channel, data) => {
    const { extensions } = JSON.parse(data);
    console.log(`channel ${channel} has joined the room! Subscribe data : ${data}`);
    subscribers[channel] = extensions;
  });
  jobs[client.id] = setInterval(async () => {
    const users = await getUsers();
    if (users) {
      Object.keys(subscribers).forEach((channel) => {
        const result = inBoth(users, subscribers[channel]);
        console.log(`emitting to ${channel}`);
        client.emit(`status-of-${channel}`, JSON.stringify({ result }));
      });
    }
  }, 1000);
  client.on('disconnect', () => {
    console.log(`Clearing job id: ${jobs[client.id]}`);
    clearInterval(jobs[client.id]);
    console.log(`A client ${client.id} has disconnected`);
  });
});

console.log(`Server starting at port ${port}...`);
