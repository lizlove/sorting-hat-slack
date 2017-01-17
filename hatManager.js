'use strict';
const houses = require('./houses.js');

function getHogwartsHouse(name) {
  const nameInt = parseInt(name, 36);
  if (nameInt % 4 === 0) {
    return houses[3];
  } else if (nameInt % 3 === 0) {
    return houses[1];
  } else if (nameInt % 2 === 0) {
    return houses[2];
  } else {
    return houses[0];
  }
}

module.exports.getHogwartsHouse = getHogwartsHouse;
