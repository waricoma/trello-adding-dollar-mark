import axios from 'axios';
//import fs from 'fs';
import dotenv from 'dotenv';
(async () => {
  dotenv.config();
  const APIKEY = process.env.APIKEY;
  const TOKEN = process.env.TOKEN;

  const BOARDID = process.env.BOARDID;

  const LIMIT = process.env.LIMIT || 1000;
  const since = process.env.SINCE || '2000-1-1T0:0:0.0Z';
  let before = process.env.BEFORE || '2050-1-1T0:0:0.0Z';

  let json = [];
  for (let i = 0; i < 10; i++) {
    //APIのリミット以上は回らないくらいにしたい
    console.log(`loop ${i}`);
    let action;
    await axios
      .get(
        `https://api.trello.com/1/boards/${BOARDID}/cards?key=${APIKEY}&token=${TOKEN}&since=${since}&before=${before}&limit=${LIMIT}`
      )
      .then((res) => {
        console.log(`status ${res.status}`);
        if (res.status != 200) {
          console.log(`${res.status} ${res.data}`);
          process.exit(1);
        }
        action = res.data;
      })
      .catch((error) => {
        console.log(error);
        process.exit(1);
      });
    json = json.concat(action);
    if (action.length != LIMIT) break;
    before = action[action.length - 1].date;
  }
  //fs.writeFileSync('a.json',JSON.stringify(json));

  for (const card of json) {
    if (card.labels.length) {
      for (const label of card.labels) {
        if (label.name.match(/SALARY/gi) && !card.name.match(/\$/g)) {
          await axios
            .put(`https://api.trello.com/1/cards/${card.id}?key=${APIKEY}&token=${TOKEN}`, { name: `$ ${card.name}` })
            .then((res) => {
              if (res.status != 200) {
                console.log(`${res.status} ${res.data}`);
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    }
  }
})();
