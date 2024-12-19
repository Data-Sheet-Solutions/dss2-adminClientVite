/**
 * Main handler for all WebSocket updates
 * @param {Object} update - The update message from the WebSocket
 * @param {Object} handlers - Object containing state update functions
 */
export const handleWebSocketUpdate = (update, handlers) => {
  console.log('Received WebSocket update:', update);
  const { updateMasterPendingData } = handlers;

  switch (update.type) {
    case 'RECORD_UPDATE': {
      updateMasterPendingData(update);
      break;
    }

    case 'REVISION_UPDATE': {
      updateMasterPendingData(update);
      break;
    }

    default:
      console.log('Unhandled update type:', update.type);
  }
};
