// Backend/services/modbusservice.js
const ModbusRTU = require('modbus-serial');
const AUTOMATE_IP = "192.168.1.100"; // METS ton IP automate réel ici !
const AUTOMATE_PORT = 502;
const AUTOMATE_UNIT_ID = 1;

async function readModbusRegister(reg, length = 1) {
  const client = new ModbusRTU();
  try {
    await client.connectTCP(AUTOMATE_IP, { port: AUTOMATE_PORT });
    client.setID(AUTOMATE_UNIT_ID);
    const data = await client.readHoldingRegisters(reg, length);
    client.close();
    return data.data;
  } catch (e) {
    client.close();
    throw new Error("Erreur Modbus : " + e.message);
  }
}

module.exports = { readModbusRegister };
