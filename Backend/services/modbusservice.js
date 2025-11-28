// Backend/services/modbusservice.js
const ModbusRTU = require('modbus-serial');

const AUTOMATE_PORT = 502;
const AUTOMATE_UNIT_ID = 1;

// Lecture d'un registre Modbus sur une IP donnée
async function readModbusRegister(ip, reg, length = 1) {
  const client = new ModbusRTU();
  try {
    await client.connectTCP(ip, { port: AUTOMATE_PORT });
    client.setID(AUTOMATE_UNIT_ID);
    const data = await client.readHoldingRegisters(reg, length);
    client.close();
    return data.data;
  } catch (e) {
    client.close();
    throw new Error('Erreur Modbus : ' + e.message);
  }
}

// "Ping" : teste juste la connexion + lecture d'1 registre
async function ping(ip) {
  const client = new ModbusRTU();
  try {
    await client.connectTCP(ip, { port: AUTOMATE_PORT });
    client.setID(AUTOMATE_UNIT_ID);
    await client.readHoldingRegisters(0, 1);
    client.close();
    return true;
  } catch (e) {
    client.close();
    return false;
  }
}

module.exports = {
  readModbusRegister,
  ping
};
