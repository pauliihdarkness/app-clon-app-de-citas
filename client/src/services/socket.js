import io from 'socket.io-client';

// URL of your backend server
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
    socket;

    connect() {
        this.socket = io(SOCKET_URL);

        this.socket.on('connect', () => {
            console.log('✅ Connected to Socket.io server');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from Socket.io server');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    joinRoom(roomId) {
        if (this.socket) {
            this.socket.emit('join_room', roomId);
        }
    }

    sendMessage(data) {
        if (this.socket) {
            this.socket.emit('send_message', data);
        }
    }

    onMessage(callback) {
        if (this.socket) {
            this.socket.on('receive_message', callback);
        }
    }

    offMessage() {
        if (this.socket) {
            this.socket.off('receive_message');
        }
    }
}

export default new SocketService();
