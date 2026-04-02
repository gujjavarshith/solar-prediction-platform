// Socket.io connection manager — tracks which socket belongs to which job.
// When a prediction completes, we can push the result to the right client.

const connectedClients = new Map();  // jobId → socket

function registerJob(jobId, socket) {
  connectedClients.set(jobId, socket);
}

function notifyClient(jobId, event, data) {
  const socket = connectedClients.get(jobId);
  if (socket && socket.connected) {
    socket.emit(event, data);
    connectedClients.delete(jobId);  // clean up after delivery
    return true;
  }
  return false;
}

function removeSocket(socketId) {
  // Clean up all jobs for a disconnected socket
  for (const [jobId, socket] of connectedClients.entries()) {
    if (socket.id === socketId) {
      connectedClients.delete(jobId);
    }
  }
}

module.exports = { registerJob, notifyClient, removeSocket };
