// Service de lecture sur automate réseau via Modbus TCP
const Modbus = require('jsmodbus');
const net = require('net');

async function readModbusRegister(ip, port, unitId, reg, length=1) {
  return new Promise((resolve,reject)=>{
    const socket = new net.Socket();
    const client = new Modbus.client.TCP(socket, unitId);
    socket.on('connect', ()=>{
      client.readHoldingRegisters(reg, length)
        .then(resp=>{
          socket.end();
          resolve(resp.response._body.values);
        })
        .catch(e=>{ socket.end(); reject(e.message); });
    });
    socket.on('error', reject);
    socket.connect(port, ip);
  });
}
module.exports = { readModbusRegister };
